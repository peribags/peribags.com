"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

function publicUrl(key: string): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

/**
 * Single-image field. The button opens the media library, which covers both
 * picking an existing file and uploading a new one.
 */
export function ImageUpload({
  name,
  defaultValue = "",
  folder,
  className,
}: {
  name: string;
  defaultValue?: string;
  folder?: string;
  className?: string;
}) {
  const [key, setKey] = useState(defaultValue);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const preview = publicUrl(key);

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <input type="hidden" name={name} value={key} />

      {key ? (
        <div className="border-border bg-card relative size-32 overflow-hidden rounded-lg border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground grid size-full place-items-center text-[10px]">
              {key}
            </div>
          )}
          <button
            type="button"
            onClick={() => setKey("")}
            aria-label="Remove image"
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="border-input bg-background hover:bg-accent text-muted-foreground flex size-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs transition-colors"
        >
          <ImagePlus className="size-5" />
          Add image
        </button>
      )}

      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onPick={(keys) => keys[0] && setKey(keys[0])}
        type="image"
        folder={folder}
      />

      {key && (
        <p className="text-muted-foreground max-w-[14rem] truncate font-mono text-[10px]">
          {key}
        </p>
      )}
    </div>
  );
}
