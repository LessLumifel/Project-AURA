import { getR2Client, MediaMeta, readDraftIndex, readMediaIndex, requireEnv, writeMediaIndex } from "./store";

type MediaListItem = MediaMeta & {
  source: "media" | "draft";
  draftId?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() || "";
    const type = url.searchParams.get("type")?.trim().toLowerCase() || "";
    const source = url.searchParams.get("source")?.trim().toLowerCase() || "all";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 30), 1), 100);
    const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);

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
    return Response.json({ items, total, hasMore, nextOffset: hasMore ? offset + limit : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list media";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<MediaMeta>;
    if (!payload.key || !payload.url || !payload.filename) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

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
    return Response.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create media";
    return Response.json({ error: message }, { status: 500 });
  }
}
