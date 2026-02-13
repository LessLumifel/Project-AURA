import { getR2Client, MediaMeta, readDraftIndex, readMediaIndex, requireEnv, writeMediaIndex } from "./store";
import { z } from "zod";
import { jsonResponse } from "../../../lib/api/monitoring";

type MediaListItem = MediaMeta & {
  source: "media" | "draft";
  draftId?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MediaQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(["all", "image", "document"]).optional(),
  source: z.enum(["all", "media", "draft"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

const MediaCreateSchema = z.object({
  id: z.string().min(1).optional(),
  key: z.string().min(1),
  url: z.string().min(1),
  filename: z.string().min(1),
  displayName: z.string().min(1).max(200).optional(),
  contentType: z.string().min(1).optional(),
  size: z.coerce.number().min(0).optional(),
  createdAt: z.string().optional(),
  tags: z.array(z.string().min(1).max(40)).optional()
});

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const url = new URL(request.url);
    const queryParsed = MediaQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? undefined,
      type: (url.searchParams.get("type") ?? undefined) as "all" | "image" | "document" | undefined,
      source: (url.searchParams.get("source") ?? undefined) as "all" | "media" | "draft" | undefined,
      limit: url.searchParams.get("limit") ?? 30,
      offset: url.searchParams.get("offset") ?? 0
    });
    if (!queryParsed.success) {
      return jsonResponse({ error: "Invalid query", details: queryParsed.error.flatten() }, { route: "GET /api/media", status: 400, startMs: start });
    }
    const q = queryParsed.data.q?.toLowerCase() || "";
    const type = queryParsed.data.type || "all";
    const source = queryParsed.data.source || "all";
    const limit = queryParsed.data.limit ?? 30;
    const offset = queryParsed.data.offset ?? 0;

    const mediaIndex = source === "draft" ? [] : await readMediaIndex(client, bucket);
    const draftIndex = source === "media" ? [] : await readDraftIndex(client, bucket);

    const draftItems: MediaListItem[] = draftIndex.map((draft) => ({
      id: `draft:${draft.id}`,
      source: "draft",
      draftId: draft.id,
      key: `drafts/${draft.id}.json`,
      url: `/tools/markdown/viewer?id=${draft.id}`,
      filename: draft.filename || "new-doc.md",
      displayName: draft.title || draft.filename || "งานใหม่",
      contentType: "text/markdown",
      size: 0,
      createdAt: draft.updatedAt,
      updatedAt: draft.updatedAt,
      tags: ["draft"]
    }));

    let result: MediaListItem[] = [
      ...mediaIndex.map((item) => ({ ...item, source: "media" as const })),
      ...draftItems
    ];
    if (q) {
      result = result.filter((item) => {
        const joined = `${item.displayName} ${item.filename} ${item.key} ${item.tags.join(" ")}`.toLowerCase();
        return joined.includes(q);
      });
    }
    if (type === "image") {
      result = result.filter((item) => item.contentType.startsWith("image/"));
    } else if (type === "document") {
      result = result.filter((item) => !item.contentType.startsWith("image/"));
    }
    result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const total = result.length;
    const items = result.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    return jsonResponse(
      { items, total, hasMore, nextOffset: hasMore ? offset + limit : null },
      { route: "GET /api/media", startMs: start, cacheControl: "private, max-age=8, stale-while-revalidate=20" }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list media";
    return jsonResponse({ error: message }, { route: "GET /api/media", status: 500, startMs: start });
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const parsed = MediaCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "POST /api/media", status: 400, startMs: start });
    }
    const payload = parsed.data;

    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const nowIso = new Date().toISOString();
    const item: MediaMeta = {
      id: payload.id || crypto.randomUUID(),
      key: payload.key,
      url: payload.url,
      filename: payload.filename,
      displayName: payload.displayName || payload.filename,
      contentType: payload.contentType || "application/octet-stream",
      size: Number(payload.size || 0),
      createdAt: payload.createdAt || nowIso,
      updatedAt: nowIso,
      tags: Array.isArray(payload.tags) ? payload.tags : []
    };

    const index = await readMediaIndex(client, bucket);
    const nextIndex = [item, ...index.filter((entry) => entry.id !== item.id)];
    await writeMediaIndex(client, bucket, nextIndex);
    return jsonResponse(item, { route: "POST /api/media", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create media";
    return jsonResponse({ error: message }, { route: "POST /api/media", status: 500, startMs: start });
  }
}
