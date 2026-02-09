import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

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

export async function GET() {
  try {
    const bucket = requireEnv("R2_BUCKET");
    const client = getR2Client();

    const index = await readIndex(client, bucket);
    const sorted = [...index].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return Response.json(sorted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list drafts";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Draft>;
    if (!payload.markdown) {
      return Response.json({ error: "Missing markdown" }, { status: 400 });
    }

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

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${DRAFT_PREFIX}${id}.json`,
        Body: JSON.stringify(draft, null, 2),
        ContentType: "application/json"
      })
    );

    const index = await readIndex(client, bucket);
    const nextIndex = [
      { id, title, filename, updatedAt },
      ...index.filter((item) => item.id !== id)
    ];
    await writeIndex(client, bucket, nextIndex);

    return Response.json({ id, title, filename, updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save draft";
    return Response.json({ error: message }, { status: 500 });
  }
}
