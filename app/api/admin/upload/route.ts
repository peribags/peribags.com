import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";
import { getR2Client, r2Bucket, r2PublicUrl } from "@/lib/r2";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "uploads");
  const folder = folderRaw.replace(/[^a-z0-9\-/_]/gi, "").replace(/^\/+|\/+$/g, "");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return Response.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 },
    );
  }

  const key = `${folder || "uploads"}/${Date.now()}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: r2Bucket(),
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ key, url: r2PublicUrl(key) }, { status: 201 });
}
