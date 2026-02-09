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
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
}

async function streamToString(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
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

async function readIndex(client: S3Client, bucket: string): Promise<DraftMeta[]> {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: INDEX_KEY
      })
    );
    if (!res.Body) return [];
    const raw = await streamToString(res.Body as ReadableStream<Uint8Array>);
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

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const id = context.params.id;

    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`
      })
    );

    if (!res.Body) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await streamToString(res.Body as ReadableStream<Uint8Array>);
    const parsed = JSON.parse(raw) as Draft;

    return Response.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load draft";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();
    const id = context.params.id;

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
