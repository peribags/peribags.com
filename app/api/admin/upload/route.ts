import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/auth";
import { getR2Client, r2Bucket, r2PublicUrl } from "@/lib/r2";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_BYTES = 256 * 1024 * 1024; // 256 MB — uploads bypass Vercel via presigned URL
const PRESIGN_TTL_SEC = 600; // 10 min to complete the upload

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const VIDEO_EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
};

const EXT_BY_MIME: Record<string, string> = {
  ...IMAGE_EXT_BY_MIME,
  ...VIDEO_EXT_BY_MIME,
};

/**
 * Presigned-upload generator. The browser POSTs file metadata here, we
 * validate (admin + size + type) and return a short-lived PUT URL the
 * browser uploads directly to. This way the file bytes never touch the
 * Vercel function, sidestepping the 4.5 MB request body limit on Hobby.
 *
 * Request:  { filename, contentType, size, folder? }
 * Response: { uploadUrl, key, url, mediaType }
 *
 * Client flow:
 *   1. POST metadata here → receive { uploadUrl, key, ... }
 *   2. PUT the file bytes directly to uploadUrl (with the same Content-Type)
 *   3. Use `key` / `url` for the resulting MediaItem
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    filename?: unknown;
    contentType?: unknown;
    size?: unknown;
    folder?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : 0;
  const folderRaw = typeof body.folder === "string" ? body.folder : "uploads";

  if (!contentType) {
    return Response.json({ error: "Missing contentType" }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0) {
    return Response.json({ error: "Missing or invalid size" }, { status: 400 });
  }

  const ext = EXT_BY_MIME[contentType];
  if (!ext) {
    return Response.json(
      { error: `Unsupported file type: ${contentType}` },
      { status: 415 },
    );
  }

  const isVideo = contentType.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return Response.json(
      { error: `File too large (max ${limitMb} MB)` },
      { status: 413 },
    );
  }

  const folder = folderRaw
    .replace(/[^a-z0-9\-/_]/gi, "")
    .replace(/^\/+|\/+$/g, "");
  const key = `${folder || "uploads"}/${Date.now()}-${randomUUID()}.${ext}`;

  let uploadUrl: string;
  try {
    // Cast through `any` — the SDK packages declare slightly different
    // smithy-types generics. Runtime behaviour is identical; this is purely
    // a TypeScript-side workaround.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadUrl = await (getSignedUrl as any)(
      getR2Client(),
      new PutObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
      { expiresIn: PRESIGN_TTL_SEC },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign failed";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json(
    {
      uploadUrl,
      key,
      url: r2PublicUrl(key),
      mediaType: isVideo ? "video" : "image",
    },
    { status: 201 },
  );
}
