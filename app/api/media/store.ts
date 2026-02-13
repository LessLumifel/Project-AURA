import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type MediaMeta = {
  id: string;
  key: string;
  url: string;
  filename: string;
  displayName: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export type DraftMeta = {
  id: string;
  title: string;
  filename: string;
  updatedAt: string;
};

export const MEDIA_INDEX_KEY = "media/index.json";
export const DRAFT_INDEX_KEY = "drafts/index.json";

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getR2Client() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
}

export function buildPublicUrl(key: string) {
  const publicBase = process.env.R2_PUBLIC_URL;
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_BUCKET");
  return `https://${bucket}.${accountId}.r2.dev/${key}`;
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

export async function readMediaIndex(client: S3Client, bucket: string): Promise<MediaMeta[]> {
  return readJsonArray<MediaMeta>(client, bucket, MEDIA_INDEX_KEY);
}

export async function readDraftIndex(client: S3Client, bucket: string): Promise<DraftMeta[]> {
  return readJsonArray<DraftMeta>(client, bucket, DRAFT_INDEX_KEY);
}

async function readJsonArray<T>(client: S3Client, bucket: string, key: string): Promise<T[]> {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
    if (!res.Body) return [];
    const raw = await bodyToString(res.Body);
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeMediaIndex(client: S3Client, bucket: string, data: MediaMeta[]) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: MEDIA_INDEX_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json"
    })
  );
}
