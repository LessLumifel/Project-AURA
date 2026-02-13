import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { getR2Client, readMediaIndex, requireEnv, writeMediaIndex } from "../store";
import { jsonResponse } from "../../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BatchSchema = z.object({
  action: z.enum(["delete", "set_tags", "rename"]),
  ids: z.array(z.string().min(1)).min(1).max(100),
  tags: z.array(z.string().min(1).max(40)).optional(),
  prefix: z.string().max(60).optional(),
  suffix: z.string().max(60).optional(),
  find: z.string().max(80).optional(),
  replace: z.string().max(80).optional()
});

function applyRename(name: string, options: { prefix?: string; suffix?: string; find?: string; replace?: string }) {
  const prefix = (options.prefix || "").trim();
  const suffix = (options.suffix || "").trim();
  const find = (options.find || "").trim();
  const replace = (options.replace || "").trim();

  let next = name;
  if (find) {
    next = next.split(find).join(replace);
  }
  next = `${prefix}${next}${suffix}`.trim();
  if (!next) return name;
  return next.slice(0, 200);
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const parsed = BatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Invalid payload", details: parsed.error.flatten() }, { route: "POST /api/media/batch", status: 400, startMs: start });
    }
    const payload = parsed.data;
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const index = await readMediaIndex(client, bucket);

    if (payload.action === "set_tags") {
      const tags = payload.tags || [];
      const nextIndex = index.map((item) => (payload.ids.includes(item.id) ? { ...item, tags, updatedAt: new Date().toISOString() } : item));
      await writeMediaIndex(client, bucket, nextIndex);
      return jsonResponse({ ok: true, affected: payload.ids.length }, { route: "POST /api/media/batch", startMs: start });
    }

    if (payload.action === "rename") {
      const nextIndex = index.map((item) =>
        payload.ids.includes(item.id)
          ? {
              ...item,
              displayName: applyRename(item.displayName || item.filename, payload),
              updatedAt: new Date().toISOString()
            }
          : item
      );
      await writeMediaIndex(client, bucket, nextIndex);
      return jsonResponse({ ok: true, affected: payload.ids.length }, { route: "POST /api/media/batch", startMs: start });
    }

    const targets = index.filter((item) => payload.ids.includes(item.id));
    for (const item of targets) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: item.key
        })
      );
    }
    const nextIndex = index.filter((item) => !payload.ids.includes(item.id));
    await writeMediaIndex(client, bucket, nextIndex);
    return jsonResponse({ ok: true, affected: targets.length }, { route: "POST /api/media/batch", startMs: start });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed batch action";
    return jsonResponse({ error: message }, { route: "POST /api/media/batch", status: 500, startMs: start });
  }
}
