import type { S3Client } from "@aws-sdk/client-s3";
import { getR2Client, readJsonArray, requireEnv, writeJson } from "../shared/r2";
export { getR2Client, requireEnv };

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

export function buildPublicUrl(key: string) {
  const publicBase = process.env.R2_PUBLIC_URL;
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;

  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_BUCKET");
  return `https://${bucket}.${accountId}.r2.dev/${key}`;
}

export async function readMediaIndex(client: S3Client, bucket: string): Promise<MediaMeta[]> {
  return readJsonArray(client, bucket, MEDIA_INDEX_KEY);
}

export async function readDraftIndex(client: S3Client, bucket: string): Promise<DraftMeta[]> {
  return readJsonArray(client, bucket, DRAFT_INDEX_KEY);
}

export async function writeMediaIndex(client: S3Client, bucket: string, data: MediaMeta[]) {
  await writeJson(client, bucket, MEDIA_INDEX_KEY, data);
}
