import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, readJsonArray, readJsonObject, requireEnv, writeJson } from "../shared/r2";

export { getR2Client, requireEnv };

export type DraftMeta = {
  id: string;
  title: string;
  filename: string;
  updatedAt: string;
};

export type Draft = DraftMeta & {
  markdown: string;
};

export const DRAFT_INDEX_KEY = "drafts/index.json";
export const DRAFT_PREFIX = "drafts/";

export async function readDraftIndex(bucket: string) {
  const client = getR2Client();
  return readJsonArray<DraftMeta>(client, bucket, DRAFT_INDEX_KEY);
}

export async function writeDraftIndex(bucket: string, data: DraftMeta[]) {
  const client = getR2Client();
  await writeJson(client, bucket, DRAFT_INDEX_KEY, data);
}

export async function readDraftById(bucket: string, id: string) {
  const client = getR2Client();
  return readJsonObject<Draft>(client, bucket, `${DRAFT_PREFIX}${id}.json`);
}

export async function writeDraftById(bucket: string, id: string, draft: Draft) {
  const client = getR2Client();
  await writeJson(client, bucket, `${DRAFT_PREFIX}${id}.json`, draft);
}

export async function deleteDraftById(bucket: string, id: string) {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: `${DRAFT_PREFIX}${id}.json`
    })
  );
}
