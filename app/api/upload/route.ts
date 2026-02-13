import { PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { buildPublicUrl, getR2Client, MediaMeta, readMediaIndex, requireEnv, writeMediaIndex } from "../media/store";
import { jsonResponse } from "../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const FilenameSchema = z.string().max(220).optional();

function sanitizeBaseName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^-+|-+$/g, "");
}

function getFileExt(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFileBase(name: string) {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex > 0 ? name.slice(0, dotIndex) : name;
}

function buildUploadKey(baseName: string, ext: string) {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `uploads/markdown/${yyyy}/${mm}/${dd}/${baseName}.${ext}`;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const filenameParsed = FilenameSchema.safeParse(formData.get("filename")?.toString());
    const preferredFilename = filenameParsed.success ? filenameParsed.data || "" : "";

    if (!(file instanceof File)) {
      return jsonResponse({ error: "No file uploaded" }, { route: "POST /api/upload", status: 400, startMs: start });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return jsonResponse({ error: "File too large (max 20MB)" }, { route: "POST /api/upload", status: 413, startMs: start });
    }

    const bucket = requireEnv("R2_BUCKET");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const preferredExt = getFileExt(preferredFilename);
    const originalExt = getFileExt(file.name);
    const safeExt = preferredExt || originalExt || "bin";
    const preferredBase = sanitizeBaseName(getFileBase(preferredFilename));
    const originalBase = sanitizeBaseName(getFileBase(file.name));
    const safeBase = (preferredBase || originalBase || "image").slice(0, 80);

    const client = getR2Client();
    let key = buildUploadKey(safeBase, safeExt);
    let uploaded = false;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const attemptBase = attempt === 0 ? safeBase : `${safeBase}-v${attempt + 1}`;
      key = buildUploadKey(attemptBase, safeExt);
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type || "application/octet-stream",
            IfNoneMatch: "*"
          })
        );
        uploaded = true;
        break;
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "$metadata" in error
            ? Number((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode || 0)
            : 0;
        if (statusCode !== 412) throw error;
      }
    }

    if (!uploaded) {
      throw new Error("Failed to generate a unique upload filename");
    }

    const nowIso = new Date().toISOString();
    const url = buildPublicUrl(key);
    const id = crypto.randomUUID();
    const entry: MediaMeta = {
      id,
      key,
      url,
      filename: file.name,
      displayName: safeBase,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: nowIso,
      updatedAt: nowIso,
      tags: []
    };
    const currentIndex = await readMediaIndex(client, bucket);
    const nextIndex = [entry, ...currentIndex];
    await writeMediaIndex(client, bucket, nextIndex);

    return jsonResponse({ id, url, key }, { route: "POST /api/upload", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonResponse({ error: message }, { route: "POST /api/upload", status: 500, startMs: start });
  }
}
