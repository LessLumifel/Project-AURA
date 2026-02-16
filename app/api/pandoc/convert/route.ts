import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { z } from "zod";
import { jsonResponse } from "../../../../lib/api/monitoring";
import { buildPublicUrl, getR2Client, MediaMeta, readMediaIndex, requireEnv, writeMediaIndex } from "../../media/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MaxUploadBytes = 30 * 1024 * 1024;
const MaxStoredDocxBytes = 200 * 1024 * 1024;
const AllowedDocxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function sanitizeToken(input: string, fallback: string, max = 40) {
  const token = input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return (token || fallback).slice(0, max);
}

function getExt(name: string) {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectContentType(file: string) {
  const lower = file.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function buildUploadKey(baseName: string, ext: string) {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const shortId = crypto.randomUUID().slice(0, 8);
  return `uploads/pandoc/${yyyy}/${mm}/${dd}/${baseName}-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${shortId}.${ext || "bin"}`;
}

function buildPandocImageBaseName(options: {
  docToken: string;
  assetToken: string;
  index: number;
}) {
  const idx = String(options.index + 1).padStart(3, "0");
  return `aura-pandoc-word-${options.docToken}-img-${idx}-${options.assetToken}`;
}

async function runPandoc(inputPath: string, outputPath: string, cwd: string) {
  const args = [
    inputPath,
    "-f",
    "docx",
    "-t",
    "gfm",
    "--wrap=none",
    "--extract-media=media",
    "-o",
    outputPath
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("pandoc", args, { cwd });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    proc.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(new Error("Pandoc executable is not available on server runtime"));
        return;
      }
      reject(error);
    });
    proc.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(stderr || `pandoc failed with code ${code}`));
    });
  });
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out;
}

function replaceAll(haystack: string, needle: string, replacement: string) {
  if (!needle) return haystack;
  return haystack.split(needle).join(replacement);
}

const FileNameSchema = z.string().max(220).optional();
const ConvertByKeySchema = z.object({
  key: z.string().min(1).max(620),
  filename: z.string().max(220).optional()
});

type InputDoc = {
  fileBuffer: Buffer;
  sourceFileName: string;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function bodyToBuffer(body: unknown) {
  if (!body) return Buffer.alloc(0);

  const withTransform = body as { transformToByteArray?: () => Promise<Uint8Array> };
  if (typeof withTransform.transformToByteArray === "function") {
    return Buffer.from(await withTransform.transformToByteArray());
  }

  if (typeof (body as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] === "function") {
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }

  if (typeof (body as ReadableStream<Uint8Array>).getReader === "function") {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }

  return Buffer.alloc(0);
}

async function getInputDoc(request: Request): Promise<InputDoc> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const parsed = ConvertByKeySchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError("Invalid payload", 400);
    }

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const key = parsed.data.key;
    const sourceFileName = parsed.data.filename || path.basename(key);
    if (!sourceFileName.toLowerCase().endsWith(".docx")) {
      throw new ApiError("Only .docx is supported for now", 400);
    }

    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );

    if (!res.Body) {
      throw new ApiError("Uploaded source file was not found", 404);
    }

    const fileBuffer = await bodyToBuffer(res.Body);
    if (fileBuffer.length <= 0) {
      throw new ApiError("Uploaded source file is empty", 400);
    }
    if (fileBuffer.length > MaxStoredDocxBytes) {
      throw new ApiError("Source file too large", 413);
    }

    return { fileBuffer, sourceFileName };
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const fileNameParsed = FileNameSchema.safeParse(formData.get("filename")?.toString());
  const preferredName = fileNameParsed.success ? fileNameParsed.data || "" : "";

  if (!(file instanceof File)) {
    throw new ApiError("No file uploaded", 400);
  }
  if (file.size > MaxUploadBytes) {
    throw new ApiError("File too large (max 30MB)", 413);
  }

  const isDocx = file.type === AllowedDocxMime || (file.name || "").toLowerCase().endsWith(".docx");
  if (!isDocx) {
    throw new ApiError("Only .docx is supported for now", 400);
  }

  const sourceFileName = preferredName || file.name || "input.docx";
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  return { fileBuffer, sourceFileName };
}

export async function POST(request: Request) {
  const start = Date.now();
  let tempRoot = "";
  try {
    const inputDoc = await getInputDoc(request);

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();

    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "aura-pandoc-"));
    const inputName = sanitizeToken(inputDoc.sourceFileName || "input.docx", "input", 80);
    const inputPath = path.join(tempRoot, inputName.endsWith(".docx") ? inputName : `${inputName}.docx`);
    const outputPath = path.join(tempRoot, "output.md");
    const mediaRoot = path.join(tempRoot, "media");

    await fs.writeFile(inputPath, inputDoc.fileBuffer);
    await runPandoc(inputPath, outputPath, tempRoot);

    let markdown = await fs.readFile(outputPath, "utf8");
    let mediaFiles: string[] = [];
    try {
      await fs.access(mediaRoot);
      mediaFiles = await listFilesRecursive(mediaRoot);
    } catch {
      mediaFiles = [];
    }

    const nowIso = new Date().toISOString();
    const addedMedia: MediaMeta[] = [];
    const uploaded: Array<{ filename: string; key: string; url: string }> = [];

    const sourceDocToken = sanitizeToken(
      path.basename(inputDoc.sourceFileName || inputName, path.extname(inputDoc.sourceFileName || inputName)),
      "document",
      48
    );

    for (let index = 0; index < mediaFiles.length; index += 1) {
      const filePath = mediaFiles[index];
      const rel = path.relative(tempRoot, filePath).replace(/\\/g, "/");
      const basename = path.basename(filePath);
      const assetToken = sanitizeToken(path.basename(filePath, path.extname(filePath)), "image", 32);
      const base = buildPandocImageBaseName({
        docToken: sourceDocToken,
        assetToken,
        index
      });
      const ext = getExt(basename) || "bin";
      const body = await fs.readFile(filePath);
      const contentType = detectContentType(filePath);
      let key = "";
      let uploadOk = false;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const attemptBase = attempt === 0 ? base : `${base}-v${attempt + 1}`;
        key = buildUploadKey(attemptBase, ext);
        try {
          await client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: body,
              ContentType: contentType,
              IfNoneMatch: "*"
            })
          );
          uploadOk = true;
          break;
        } catch (error) {
          const statusCode =
            typeof error === "object" && error && "$metadata" in error
              ? Number((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode || 0)
              : 0;
          if (statusCode !== 412) throw error;
        }
      }
      if (!uploadOk) {
        throw new Error(`Failed to generate unique key for extracted asset: ${basename}`);
      }

      const url = buildPublicUrl(key);
      markdown = replaceAll(markdown, rel, url);
      markdown = replaceAll(markdown, `./${rel}`, url);
      markdown = replaceAll(markdown, `media/${basename}`, url);

      uploaded.push({ filename: basename, key, url });
      addedMedia.push({
        id: crypto.randomUUID(),
        key,
        url,
        filename: basename,
        displayName: base,
        contentType,
        size: body.length,
        createdAt: nowIso,
        updatedAt: nowIso,
        tags: ["pandoc", "word-image", `doc-${sourceDocToken}`]
      });
    }

    if (addedMedia.length) {
      const currentIndex = await readMediaIndex(client, bucket);
      await writeMediaIndex(client, bucket, [...addedMedia, ...currentIndex]);
    }

    return jsonResponse(
      {
        ok: true,
        markdown,
        uploadedCount: uploaded.length,
        assets: uploaded
      },
      { route: "POST /api/pandoc/convert", startMs: start }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pandoc convert failed";
    const status = error instanceof ApiError ? error.status : 500;
    return jsonResponse({ error: message }, { route: "POST /api/pandoc/convert", status, startMs: start });
  } finally {
    if (tempRoot) {
      try {
        await fs.rm(tempRoot, { recursive: true, force: true });
      } catch {
        // no-op
      }
    }
  }
}
