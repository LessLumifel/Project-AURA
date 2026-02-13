import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, readMediaIndex, requireEnv, writeMediaIndex } from "../store";
import type { MediaMeta } from "../store";
import { z } from "zod";
import { jsonResponse } from "../../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MediaUpdateSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  tags: z.array(z.string().min(1).max(40)).optional()
});

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;
    const index = await readMediaIndex(client, bucket);
    const item = index.find((entry) => entry.id === id);
    if (!item) return jsonResponse({ error: "Not found" }, { route: "GET /api/media/[id]", status: 404, startMs: start });
    return jsonResponse(item, { route: "GET /api/media/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get media";
    return jsonResponse({ error: message }, { route: "GET /api/media/[id]", status: 500, startMs: start });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const parsed = MediaUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "PATCH /api/media/[id]", status: 400, startMs: start });
    }
    const payload = parsed.data;
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;

    const index = await readMediaIndex(client, bucket);
    const current = index.find((entry) => entry.id === id);
    if (!current) return jsonResponse({ error: "Not found" }, { route: "PATCH /api/media/[id]", status: 404, startMs: start });

    const next: MediaMeta = {
      ...current,
      displayName: payload.displayName?.trim() || current.displayName,
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : current.tags,
      updatedAt: new Date().toISOString()
    };

    const nextIndex = [next, ...index.filter((entry) => entry.id !== id)];
    await writeMediaIndex(client, bucket, nextIndex);
    return jsonResponse(next, { route: "PATCH /api/media/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return jsonResponse({ error: message }, { route: "PATCH /api/media/[id]", status: 500, startMs: start });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;

    const index = await readMediaIndex(client, bucket);
    const current = index.find((entry) => entry.id === id);
    if (!current) return jsonResponse({ error: "Not found" }, { route: "DELETE /api/media/[id]", status: 404, startMs: start });

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: current.key
      })
    );

    const nextIndex = index.filter((entry) => entry.id !== id);
    await writeMediaIndex(client, bucket, nextIndex);
    return jsonResponse({ ok: true }, { route: "DELETE /api/media/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return jsonResponse({ error: message }, { route: "DELETE /api/media/[id]", status: 500, startMs: start });
  }
}
