import { z } from "zod";
import { Draft, DraftMeta, getR2Client, requireEnv } from "./store";
import { DRAFT_INDEX_KEY, DRAFT_PREFIX } from "./store";
import { readJsonArray, writeJson } from "../shared/r2";
import { jsonResponse } from "../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DraftCreateSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().max(160).optional(),
  filename: z.string().max(220).optional(),
  markdown: z.string().min(1)
});

async function readIndex(client: ReturnType<typeof getR2Client>, bucket: string) {
  return readJsonArray<DraftMeta>(client, bucket, DRAFT_INDEX_KEY);
}

async function writeIndex(client: ReturnType<typeof getR2Client>, bucket: string, data: DraftMeta[]) {
  await writeJson(client, bucket, DRAFT_INDEX_KEY, data);
}

export async function GET() {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const index = await readIndex(client, bucket);
    const sorted = [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return jsonResponse(sorted, {
      route: "GET /api/drafts",
      startMs: start,
      cacheControl: "private, max-age=8, stale-while-revalidate=20"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list drafts";
    return jsonResponse({ error: message }, { route: "GET /api/drafts", status: 500, startMs: start });
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const parsed = DraftCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "POST /api/drafts", status: 400, startMs: start });
    }

    const payload = parsed.data;
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();

    const id = payload.id ?? crypto.randomUUID();
    const title = payload.title ?? "งานใหม่";
    const filename = payload.filename ?? "new-doc.md";
    const updatedAt = new Date().toISOString();

    const draft: Draft = {
      id,
      title,
      filename,
      markdown: payload.markdown,
      updatedAt
    };

    await writeJson(client, bucket, `${DRAFT_PREFIX}${id}.json`, draft);

    const index = await readIndex(client, bucket);
    const nextIndex = [{ id, title, filename, updatedAt }, ...index.filter((item) => item.id !== id)];
    await writeIndex(client, bucket, nextIndex);

    return jsonResponse({ id, title, filename, updatedAt }, { route: "POST /api/drafts", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save draft";
    return jsonResponse({ error: message }, { route: "POST /api/drafts", status: 500, startMs: start });
  }
}
