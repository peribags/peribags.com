import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";
import { getR2Client, r2Bucket, r2PublicUrl } from "@/lib/r2";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|ogv|mov)$/i;

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
/** Safety cap on how many objects we enumerate from the bucket. */
const MAX_OBJECTS = 5000;

export type MediaItem = {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
  kind: "image" | "video";
};

/**
 * GET /api/admin/media?type=image|video|all&q=…&limit=10&offset=0
 *
 * Lists previously uploaded files (newest first) with offset pagination and
 * optional file-name search, so admin UIs can load a page at a time instead
 * of everything at once. Returns `{ items, total, hasMore }`.
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "image";
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  try {
    // Enumerate the bucket (it lists lexicographically, so we must gather
    // everything before we can sort newest-first).
    const client = getR2Client();
    const bucket = r2Bucket();
    const all: MediaItem[] = [];
    let token: string | undefined;

    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          MaxKeys: 1000,
          ContinuationToken: token,
        }),
      );
      for (const o of res.Contents ?? []) {
        const key = o.Key ?? "";
        const kind: MediaItem["kind"] | null = IMAGE_EXT.test(key)
          ? "image"
          : VIDEO_EXT.test(key)
            ? "video"
            : null;
        if (!key || !kind) continue;
        if (type === "image" && kind !== "image") continue;
        if (type === "video" && kind !== "video") continue;
        if (q && !key.toLowerCase().includes(q)) continue;
        all.push({
          key,
          url: r2PublicUrl(key),
          size: o.Size ?? 0,
          lastModified: o.LastModified?.toISOString() ?? null,
          kind,
        });
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token && all.length < MAX_OBJECTS);

    all.sort((a, b) =>
      (b.lastModified ?? "").localeCompare(a.lastModified ?? ""),
    );

    const items = all.slice(offset, offset + limit);
    return Response.json({
      items,
      total: all.length,
      hasMore: offset + limit < all.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list media";
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/media?key=<r2-key>
 * Permanently removes a file from the bucket. Note: anything still
 * referencing the key (products, banner, reels…) will show a broken image.
 */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = (searchParams.get("key") ?? "").trim();
  // Keys are always "<folder>/<name>.<ext>" — reject anything else.
  if (!key || key.startsWith("/") || key.includes("..")) {
    return Response.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    await getR2Client().send(
      new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key }),
    );
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return Response.json({ error: message }, { status: 500 });
  }
}
