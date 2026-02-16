import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { jsonResponse } from "../../../../lib/api/monitoring";
import { getR2Client, requireEnv } from "../../media/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AllowedDocxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MaxDocxBytes = 200 * 1024 * 1024;

const PresignSchema = z.object({
  filename: z.string().min(1).max(220),
  size: z.number().int().positive().max(MaxDocxBytes),
  contentType: z.string().optional()
});

function sanitizeToken(input: string, fallback: string, max = 50) {
  const token = input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return (token || fallback).slice(0, max);
}

function buildDocxUploadKey(filename: string) {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const base = sanitizeToken(filename.replace(/\.docx$/i, ""), "document", 60);
  const suffix = crypto.randomUUID().slice(0, 8);
  return `uploads/pandoc/input/${yyyy}/${mm}/${dd}/${base}-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${suffix}.docx`;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const parsed = PresignSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { route: "POST /api/pandoc/presign", status: 400, startMs: start }
      );
    }

    const { filename, size, contentType } = parsed.data;
    const isDocx = filename.toLowerCase().endsWith(".docx");
    if (!isDocx) {
      return jsonResponse(
        { error: "Only .docx is supported for now" },
        { route: "POST /api/pandoc/presign", status: 400, startMs: start }
      );
    }

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const key = buildDocxUploadKey(filename);
    const normalizedType = contentType || AllowedDocxMime;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: normalizedType,
      ContentLength: size
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 10 });

    return jsonResponse(
      {
        ok: true,
        key,
        uploadUrl,
        expiresIn: 60 * 10,
        requiredHeaders: {
          "content-type": normalizedType
        }
      },
      { route: "POST /api/pandoc/presign", startMs: start }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create upload url";
    return jsonResponse({ error: message }, { route: "POST /api/pandoc/presign", status: 500, startMs: start });
  }
}
