import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

/**
 * S3-compatible client pointed at Cloudflare R2.
 * Lazily instantiated so the module can be imported even when env vars are
 * missing (e.g. during a build that doesn't actually upload).
 */
export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local.",
    );
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export function r2Bucket(): string {
  const b = process.env.R2_BUCKET;
  if (!b) throw new Error("R2_BUCKET is not set");
  return b;
}

/** Public URL for a stored key. Reads NEXT_PUBLIC_R2_PUBLIC_BASE_URL. */
export function r2PublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
