import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, readMediaIndex, requireEnv, writeMediaIndex } from "../store";
import type { MediaMeta } from "../store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const id = context.params.id;
    const index = await readMediaIndex(client, bucket);
    const item = index.find((entry) => entry.id === id);
    if (!item) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get media";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const payload = (await request.json()) as Partial<Pick<MediaMeta, "displayName" | "tags">>;
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const id = context.params.id;

    const index = await readMediaIndex(client, bucket);
    const current = index.find((entry) => entry.id === id);
    if (!current) return Response.json({ error: "Not found" }, { status: 404 });

    const next: MediaMeta = {
      ...current,
      displayName: payload.displayName?.trim() || current.displayName,
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : current.tags,
      updatedAt: new Date().toISOString()
    };

    const nextIndex = [next, ...index.filter((entry) => entry.id !== id)];
    await writeMediaIndex(client, bucket, nextIndex);
    return Response.json(next);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const id = context.params.id;

    const index = await readMediaIndex(client, bucket);
    const current = index.find((entry) => entry.id === id);
    if (!current) return Response.json({ error: "Not found" }, { status: 404 });

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: current.key
      })
    );

    const nextIndex = index.filter((entry) => entry.id !== id);
    await writeMediaIndex(client, bucket, nextIndex);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return Response.json({ error: message }, { status: 500 });
  }
}
