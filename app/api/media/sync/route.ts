import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { z } from "zod";
import { buildPublicUrl, getR2Client, MediaMeta, readMediaIndex, requireEnv, writeMediaIndex } from "../store";
import { jsonResponse } from "../../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SyncSchema = z.object({
  prefix: z.string().min(1).max(120).optional(),
  maxScan: z.coerce.number().int().min(1).max(10000).optional()
});

function detectContentType(key: string) {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function extractFilenameFromKey(key: string) {
  const parts = key.split("/");
  return parts[parts.length - 1] || key;
}

function toDisplayName(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const parsed = SyncSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "POST /api/media/sync", status: 400, startMs: start });
    }
    const prefix = parsed.data.prefix?.trim() || "uploads/";
    const maxScan = parsed.data.maxScan ?? 3000;

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const index = await readMediaIndex(client, bucket);
    const byKey = new Map(index.map((item) => [item.key, item]));

    let continuationToken: string | undefined;
    let scanned = 0;
    let inserted = 0;
    const additions: MediaMeta[] = [];

    do {
      const page = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000
        })
      );

      const objects = page.Contents || [];
      for (const obj of objects) {
        const key = obj.Key || "";
        if (!key) continue;
        scanned += 1;
        if (scanned > maxScan) break;
        if (byKey.has(key)) continue;

        const filename = extractFilenameFromKey(key);
        const createdAt = obj.LastModified ? new Date(obj.LastModified).toISOString() : new Date().toISOString();
        additions.push({
          id: crypto.randomUUID(),
          key,
          url: buildPublicUrl(key),
          filename,
          displayName: toDisplayName(filename),
          contentType: detectContentType(key),
          size: Number(obj.Size || 0),
          createdAt,
          updatedAt: createdAt,
          tags: ["synced"]
        });
        inserted += 1;
      }

      if (scanned > maxScan) break;
      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);

    if (additions.length) {
      const nextIndex = [...additions, ...index];
      await writeMediaIndex(client, bucket, nextIndex);
    }

    return jsonResponse({ ok: true, scanned, inserted, prefix, maxScan }, { route: "POST /api/media/sync", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync media";
    return jsonResponse({ error: message }, { route: "POST /api/media/sync", status: 500, startMs: start });
  }
}
