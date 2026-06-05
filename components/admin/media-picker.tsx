"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Search, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MediaItem = {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
  kind: "image" | "video";
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen R2 keys (1 entry unless `multiple`). */
  onPick: (keys: string[]) => void;
  multiple?: boolean;
  /** Which kinds to show / accept. */
  type?: "image" | "video" | "all";
  /** Folder used when uploading new files from inside the picker. */
  folder?: string;
};

const PAGE_SIZE = 10;

const ACCEPT: Record<NonNullable<Props["type"]>, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/webm,video/ogg,video/quicktime",
  all: "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/ogg,video/quicktime",
};

/**
 * Media library dialog — browse uploads 10 at a time (Load more for the
 * next page), search by file name, pick one (or many) item(s), or upload
 * fresh files which are auto-selected.
 */
export function MediaPicker({
  open,
  onClose,
  onPick,
  multiple = false,
  type = "image",
  folder = "uploads",
}: Props) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  // Drops stale responses + remembers which query the loaded items belong to.
  const reqSeq = useRef(0);
  const loadedQuery = useRef<string | null>(null);

  const fetchPage = async (q: string, offset: number, replace: boolean) => {
    const seq = ++reqSeq.current;
    const params = new URLSearchParams({
      type,
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/media?${params.toString()}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Failed to load media");
    if (seq !== reqSeq.current) return; // a newer request superseded this one
    setItems((prev) =>
      replace ? (body.items as MediaItem[]) : [...(prev ?? []), ...body.items],
    );
    setTotal(body.total as number);
    setHasMore(body.hasMore as boolean);
  };

  // First page on open + re-query on search (debounced). All setState happens
  // inside the timer / fetch callbacks.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (items !== null && loadedQuery.current === q) return;
    const isFirst = items === null;
    const t = setTimeout(
      () => {
        loadedQuery.current = q;
        fetchPage(q, 0, true).catch((e) =>
          setError(e instanceof Error ? e.message : "Failed to load media"),
        );
      },
      isFirst ? 0 : 300,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, items]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(query.trim(), items?.length ?? 0, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoadingMore(false);
    }
  };

  const choose = (key: string) => {
    if (!multiple) {
      onPick([key]);
      handleClose();
      return;
    }
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleClose = () => {
    setSelected([]);
    setQuery("");
    onClose();
  };

  const confirm = () => {
    if (selected.length > 0) onPick(selected);
    handleClose();
  };

  async function handleFiles(files: FileList) {
    if (files.length === 0) return;
    setError(null);
    setUploading((c) => c + files.length);

    const uploads = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Upload failed");
      return {
        key: body.key as string,
        url: body.url as string,
        size: file.size,
        lastModified: new Date().toISOString(),
        kind: (body.mediaType === "video" ? "video" : "image") as MediaItem["kind"],
      } satisfies MediaItem;
    });

    const settled = await Promise.allSettled(uploads);
    const added: MediaItem[] = [];
    for (const r of settled) {
      if (r.status === "fulfilled") added.push(r.value);
      else setError(r.reason?.message ?? "Upload failed");
      setUploading((c) => c - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    if (added.length === 0) return;

    setItems((prev) => [...added, ...(prev ?? [])]);
    setTotal((t) => t + added.length);
    if (!multiple) {
      // Single mode: a fresh upload IS the pick.
      onPick([added[0].key]);
      handleClose();
    } else {
      setSelected((prev) => [...prev, ...added.map((a) => a.key)]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="border-border border-b px-5 py-4">
          <DialogTitle className="text-base">Media library</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="border-border flex items-center gap-2 border-b px-5 py-3">
          <div className="border-input bg-background flex h-9 flex-1 items-center gap-2 rounded-lg border px-3">
            <Search className="text-muted-foreground size-3.5 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by file name…"
              className="placeholder:text-muted-foreground/70 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading > 0}
            onClick={() => fileRef.current?.click()}
          >
            {uploading > 0 ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload new
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple={multiple}
            accept={ACCEPT[type]}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />
        </div>

        {/* Grid */}
        <div className="min-h-48 flex-1 overflow-y-auto p-4">
          {error && <p className="text-destructive mb-3 text-xs">{error}</p>}

          {items === null ? (
            <div className="text-muted-foreground grid h-40 place-items-center text-sm">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading media…
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground grid h-40 place-items-center text-sm">
              {query.trim() ? "No files match." : "Nothing uploaded yet."}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {items.map((item) => {
                  const isSelected = selected.includes(item.key);
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => choose(item.key)}
                        title={item.key}
                        className={cn(
                          "group/item bg-muted/40 relative block aspect-square w-full overflow-hidden rounded-lg ring-2 transition-all",
                          isSelected
                            ? "ring-foreground"
                            : "ring-transparent hover:ring-border",
                        )}
                      >
                        {item.kind === "video" ? (
                          <video
                            src={`${item.url}#t=0.1`}
                            muted
                            playsInline
                            preload="metadata"
                            className="size-full object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover"
                          />
                        )}
                        {isSelected && (
                          <span className="bg-foreground text-background absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full">
                            <Check className="size-3" />
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-left text-[9px] text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                          {item.key.split("/").pop()}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {items.length} of {total}
                </span>
                {hasMore && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingMore}
                    onClick={loadMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    Load more
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer (multi-select) */}
        {multiple && (
          <div className="border-border flex items-center justify-between border-t px-5 py-3">
            <span className="text-muted-foreground text-xs tabular-nums">
              {selected.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={selected.length === 0}
                onClick={confirm}
              >
                Add {selected.length > 0 ? selected.length : ""} selected
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
