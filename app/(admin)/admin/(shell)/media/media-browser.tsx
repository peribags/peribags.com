"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Film,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 10;

export function MediaBrowser() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  // Drops stale responses + remembers which query the loaded items belong to.
  const reqSeq = useRef(0);
  const loadedQuery = useRef<string | null>(null);

  const fetchPage = async (q: string, offset: number, replace: boolean) => {
    const seq = ++reqSeq.current;
    const params = new URLSearchParams({
      type: "all",
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

  // First page + re-query on search (debounced). All setState happens inside
  // the timer / fetch callbacks.
  useEffect(() => {
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
  }, [query, items]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      await fetchPage(query.trim(), items?.length ?? 0, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  async function handleFiles(files: FileList) {
    if (files.length === 0) return;
    setUploading((c) => c + files.length);

    const uploads = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "uploads");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Upload failed");
      return {
        key: body.key as string,
        url: body.url as string,
        size: file.size,
        lastModified: new Date().toISOString(),
        kind: (body.mediaType === "video"
          ? "video"
          : "image") as MediaItem["kind"],
      } satisfies MediaItem;
    });

    const settled = await Promise.allSettled(uploads);
    const added: MediaItem[] = [];
    for (const r of settled) {
      if (r.status === "fulfilled") added.push(r.value);
      else toast.error(r.reason?.message ?? "Upload failed");
      setUploading((c) => c - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    if (added.length > 0) {
      setItems((prev) => [...added, ...(prev ?? [])]);
      setTotal((t) => t + added.length);
      toast.success(
        added.length === 1 ? "File uploaded" : `${added.length} files uploaded`,
      );
    }
  }

  const doDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/media?key=${encodeURIComponent(selected.key)}`,
        { method: "DELETE" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Failed to delete");
      setItems((prev) => (prev ?? []).filter((i) => i.key !== selected.key));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(false);
      setSelected(null);
      toast.success("File deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Couldn't copy URL");
    }
  };

  // Search is server-side now — `items` already reflects the current query.
  const visible = items ?? [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-input bg-background flex h-10 min-w-56 flex-1 items-center gap-2 rounded-lg border px-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by file name…"
            className="placeholder:text-muted-foreground/70 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={uploading > 0}
          onClick={() => fileRef.current?.click()}
        >
          {uploading > 0 ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <span className="text-muted-foreground text-xs tabular-nums">
          {items === null ? "Loading…" : `${visible.length} of ${total} files`}
        </span>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Grid */}
      {items === null ? (
        <div className="text-muted-foreground grid h-48 place-items-center text-sm">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Loading media…
          </span>
        </div>
      ) : visible.length === 0 ? (
        <div className="border-border text-muted-foreground grid h-48 place-items-center rounded-2xl border border-dashed text-sm">
          {query.trim() ? "No files match." : "Nothing uploaded yet."}
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {visible.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                title={item.key}
                className="group/item bg-muted/40 ring-border hover:ring-foreground/40 relative block aspect-square w-full overflow-hidden rounded-xl ring-1 transition-all"
              >
                {item.kind === "video" ? (
                  <>
                    <video
                      src={`${item.url}#t=0.1`}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-white">
                      <Film className="size-2.5" />
                    </span>
                  </>
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
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-left text-[9px] text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                  {item.key.split("/").pop()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={loadMore}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      {/* ── Details dialog ── */}
      <Dialog
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      >
        <DialogContent className="flex h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-4 sm:max-w-[90vw]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate pr-8 text-base">
                  {selected.key.split("/").pop()}
                </DialogTitle>
              </DialogHeader>

              {/* Fills the remaining dialog height — preview left, details right */}
              <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row">
                {/* Preview — takes all available space. The media element is
                    sized to exactly fill the pane (h-full w-full) and
                    object-contain letterboxes the content, so it can never
                    overflow the dialog. */}
                <div className="bg-muted/40 ring-border min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl ring-1">
                  {selected.kind === "video" ? (
                    <video
                      src={selected.url}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.url}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                {/* Details */}
                <dl className="shrink-0 space-y-3 overflow-y-auto text-sm lg:w-80">
                  <DetailRow label="Type">
                    <span className="capitalize">{selected.kind}</span>
                  </DetailRow>
                  <DetailRow label="Size">
                    {formatBytes(selected.size)}
                  </DetailRow>
                  <DetailRow label="Uploaded">
                    {formatDate(selected.lastModified)}
                  </DetailRow>
                  <DetailRow label="Key">
                    <span className="font-mono text-[11px] break-all">
                      {selected.key}
                    </span>
                  </DetailRow>
                  <DetailRow label="URL">
                    <span className="text-muted-foreground block text-[11px] break-all">
                      {selected.url}
                    </span>
                  </DetailRow>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyUrl(selected.url)}
                    >
                      <Copy className="size-3.5" />
                      Copy URL
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-destructive hover:text-destructive hover:bg-destructive/10",
                      )}
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete file
                    </Button>
                  </div>
                </dl>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground font-medium break-all">
                {selected?.key}
              </span>{" "}
              will be permanently removed from storage. Anything still using it
              — products, banner slides, reels, sections — will show a broken
              image. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={deleting}
              onClick={doDelete}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/40 text-white"
            >
              {deleting ? (
                "Deleting…"
              ) : (
                <>
                  <Check className="size-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </dt>
      <dd className="text-foreground mt-0.5">{children}</dd>
    </div>
  );
}
