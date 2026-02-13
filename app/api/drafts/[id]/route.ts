import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DraftMeta = {
  id: string;
  title: string;
  filename: string;
  updatedAt: string;
};

type Draft = DraftMeta & { markdown: string };

const INDEX_KEY = "drafts/index.json";
const DRAFT_PREFIX = "drafts/";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getR2Client() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
   return new S3Client({
    region: "APAC",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true
  });
}

async function bodyToString(body: unknown) {
  if (!body) return "";
  if (typeof (body as { transformToString?: () => Promise<string> }).transformToString === "function") {
    return (body as { transformToString: () => Promise<string> }).transformToString();
  }
  if (typeof (body as ReadableStream<Uint8Array>).getReader === "function") {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder().decode(buffer);
  }
  if (typeof (body as AsyncIterable<Uint8Array>)[Symbol.asyncIterator] === "function") {
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder().decode(buffer);
  }
  return "";
}

async function readIndex(client: S3Client, bucket: string): Promise<DraftMeta[]> {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: INDEX_KEY
      })
    );
    if (!res.Body) return [];
    const raw = await bodyToString(res.Body);
    const parsed = JSON.parse(raw) as DraftMeta[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(client: S3Client, bucket: string, data: DraftMeta[]) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: INDEX_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json"
    })
  );
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`
      })
    );

    if (!res.Body) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await bodyToString(res.Body as ReadableStream<Uint8Array>);
    const parsed = JSON.parse(raw) as Draft;
    return Response.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load draft";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const { id } = await context.params;
    const payload = (await request.json()) as Partial<Pick<Draft, "title" | "filename">>;

    const currentRes = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`
      })
    );
    if (!currentRes.Body) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const raw = await bodyToString(currentRes.Body as ReadableStream<Uint8Array>);
    const current = JSON.parse(raw) as Draft;

    const updatedAt = new Date().toISOString();
    const next: Draft = {
      ...current,
      title: payload.title?.trim() || current.title,
      filename: payload.filename?.trim() || current.filename,
      updatedAt
    };

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`,
        Body: JSON.stringify(next, null, 2),
        ContentType: "application/json"
      })
    );

    const index = await readIndex(client, bucket);
    const nextIndex = [
      { id, title: next.title, filename: next.filename, updatedAt },
      ...index.filter((item) => item.id !== id)
    ];
    await writeIndex(client, bucket, nextIndex);

    return Response.json({ id, title: next.title, filename: next.filename, updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update draft";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
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

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete draft";
    return Response.json({ error: message }, { status: 500 });
  }
}
