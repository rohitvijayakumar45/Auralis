import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getConfig } from "../config.js";

const config = getConfig();
export const s3 = new S3Client({ region: config.aws.region });

export async function createUploadUrl(input: {
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: config.s3.originalsBucket,
    Key: input.key,
    ContentType: input.contentType
  });

  return getSignedUrl(s3, command, { expiresIn: config.s3.uploadTtlSeconds });
}

export async function createDownloadUrl(key: string, thumbnail = false) {
  const command = new GetObjectCommand({
    Bucket: thumbnail ? config.s3.thumbnailsBucket : config.s3.originalsBucket,
    Key: key
  });
  return getSignedUrl(s3, command, { expiresIn: config.s3.downloadTtlSeconds });
}
