import { z } from "zod";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Draft, DraftMeta, getR2Client, requireEnv } from "../store";
import { DRAFT_INDEX_KEY, DRAFT_PREFIX } from "../store";
import { readJsonArray, readJsonObject, writeJson } from "../../shared/r2";
import { jsonResponse } from "../../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DraftUpdateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  filename: z.string().min(1).max(220).optional()
});

async function readIndex(client: ReturnType<typeof getR2Client>, bucket: string) {
  return readJsonArray<DraftMeta>(client, bucket, DRAFT_INDEX_KEY);
}

async function writeIndex(client: ReturnType<typeof getR2Client>, bucket: string, data: DraftMeta[]) {
  await writeJson(client, bucket, DRAFT_INDEX_KEY, data);
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;

    const draft = await readJsonObject<Draft>(client, bucket, `${DRAFT_PREFIX}${id}.json`);
    if (!draft) {
      return jsonResponse({ error: "Not found" }, { route: "GET /api/drafts/[id]", status: 404, startMs: start });
    }
    return jsonResponse(draft, { route: "GET /api/drafts/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load draft";
    return jsonResponse({ error: message }, { route: "GET /api/drafts/[id]", status: 500, startMs: start });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const parsed = DraftUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "PATCH /api/drafts/[id]", status: 400, startMs: start });
    }

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;
    const payload = parsed.data;

    const current = await readJsonObject<Draft>(client, bucket, `${DRAFT_PREFIX}${id}.json`);
    if (!current) {
      return jsonResponse({ error: "Not found" }, { route: "PATCH /api/drafts/[id]", status: 404, startMs: start });
    }

    const updatedAt = new Date().toISOString();
    const next: Draft = {
      ...current,
      title: payload.title?.trim() || current.title,
      filename: payload.filename?.trim() || current.filename,
      updatedAt
    };

    await writeJson(client, bucket, `${DRAFT_PREFIX}${id}.json`, next);

    const index = await readIndex(client, bucket);
    const nextIndex = [{ id, title: next.title, filename: next.filename, updatedAt }, ...index.filter((item) => item.id !== id)];
    await writeIndex(client, bucket, nextIndex);

    return jsonResponse({ id, title: next.title, filename: next.filename, updatedAt }, { route: "PATCH /api/drafts/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update draft";
    return jsonResponse({ error: message }, { route: "PATCH /api/drafts/[id]", status: 500, startMs: start });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`
      })
    );

    const index = await readIndex(client, bucket);
    const nextIndex = index.filter((item) => item.id !== id);
    await writeIndex(client, bucket, nextIndex);

    return jsonResponse({ ok: true }, { route: "DELETE /api/drafts/[id]", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete draft";
    return jsonResponse({ error: message }, { route: "DELETE /api/drafts/[id]", status: 500, startMs: start });
  }
}
