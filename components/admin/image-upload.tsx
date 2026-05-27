"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

function publicUrl(key: string): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (folder) fd.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? "Upload failed");
      }
      setKey(body.key as string);
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

      {key ? (
        <div className="border-border bg-card relative size-32 overflow-hidden rounded-lg border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-full object-cover"
            />
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
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-input bg-background hover:bg-accent text-muted-foreground flex size-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs transition-colors disabled:opacity-60"
        >
          <Upload className="size-5" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && <p className="text-destructive text-xs">{error}</p>}
      {key && (
        <p className="text-muted-foreground max-w-[14rem] truncate font-mono text-[10px]">
          {key}
        </p>
      )}
    </div>
  );
}
