// One-off: apply a CORS policy to the R2 bucket so the browser can PUT
// directly to presigned upload URLs. Run: node scripts/set-r2-cors.mjs
import { readFileSync } from "node:fs";
import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from "@aws-sdk/client-s3";

// Minimal .env.local loader.
const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error("Missing R2_* env vars in .env.local");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const AllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.peribags.com",
  "https://peribags.com",
];

await client.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedMethods: ["GET", "PUT", "HEAD"],
          AllowedOrigins,
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log("✓ CORS applied to bucket:", R2_BUCKET);
const res = await client.send(new GetBucketCorsCommand({ Bucket: R2_BUCKET }));
console.log(JSON.stringify(res.CORSRules, null, 2));
