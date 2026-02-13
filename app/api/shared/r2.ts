import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

export async function readJsonArray<T>(client: S3Client, bucket: string, key: string): Promise<T[]> {
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

export async function readJsonObject<T>(client: S3Client, bucket: string, key: string): Promise<T | null> {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
    if (!res.Body) return null;
    const raw = await bodyToString(res.Body);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(client: S3Client, bucket: string, key: string, data: unknown) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json"
    })
  );
}
