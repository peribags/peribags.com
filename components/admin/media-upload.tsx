"use client";

import { useRef, useState } from "react";
import { Film, ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BannerMediaType } from "@/types";

function publicUrl(key: string): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/ogg,video/quicktime";

/**
 * Single media (image OR video) uploader. Renders two hidden inputs so a
 * server action can read both the stored key and its type:
 *   `formData.get(name)`      → R2 key
 *   `formData.get(typeName)`  → "image" | "video"
 */
export function MediaUpload({
  name,
  typeName,
  defaultValue = "",
  defaultType = "image",
  folder = "home-banner",
  className,
}: {
  name: string;
  typeName: string;
  defaultValue?: string;
  defaultType?: BannerMediaType;
  folder?: string;
  className?: string;
}) {
  const [key, setKey] = useState(defaultValue);
  const [mediaType, setMediaType] = useState<BannerMediaType>(defaultType);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Upload failed");

      setKey(body.key as string);
      setMediaType(
        (body.mediaType as BannerMediaType) ??
          (file.type.startsWith("video/") ? "video" : "image"),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = publicUrl(key);

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <input type="hidden" name={name} value={key} />
      <input type="hidden" name={typeName} value={mediaType} />

      {key ? (
        <div className="border-border bg-card relative aspect-video w-full overflow-hidden rounded-lg border">
          {mediaType === "video" ? (
            <video
              src={preview}
              className="size-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground grid size-full place-items-center text-[10px]">
              {key}
            </div>
          )}

          <span className="bg-foreground text-background absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
            {mediaType === "video" ? (
              <Film className="size-2.5" />
            ) : (
              <ImageIcon className="size-2.5" />
            )}
            {mediaType}
          </span>

          <button
            type="button"
            onClick={() => {
              setKey("");
              setMediaType("image");
            }}
            aria-label="Remove media"
            className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-input bg-background hover:bg-accent text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs transition-colors disabled:opacity-60"
        >
          <Upload className="size-5" />
          {uploading ? "Uploading…" : "Upload image or video"}
          <span className="text-muted-foreground/70 text-[10px]">
            JPG, PNG, WebP, GIF up to 8 MB · MP4, WebM up to 64 MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && <p className="text-destructive text-xs">{error}</p>}
      {key && (
        <p className="text-muted-foreground max-w-full truncate font-mono text-[10px]">
          {key}
        </p>
      )}
    </div>
  );
}
