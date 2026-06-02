"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, Film, GripVertical, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reorderReelsAction } from "./actions";
import { DeleteReelButton } from "./delete-reel-button";

export type ReelSummary = {
  id: string;
  title: string;
  posterUrl: string | null;
  videoUrl: string | null;
  hasPromo: boolean;
  published: boolean;
};

export function ReelsBoard({ reels }: { reels: ReelSummary[] }) {
  const [order, setOrder] = useState<ReelSummary[]>(reels);
  const [pending, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const persist = (next: ReelSummary[]) => {
    startTransition(async () => {
      const res = await reorderReelsAction(next.map((r) => r.id));
      if (res && "error" in res) toast.error(res.error);
      else toast.success("Order saved");
    });
  };

  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from == null || from === target) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      persist(next);
      return next;
    });
  };

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Reels
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {pending ? "Saving order…" : "Drag to reorder"}
        </span>
      </div>

      <ul>
        {order.map((r, idx) => (
          <li
            key={r.id}
            draggable
            onDragStart={() => (dragIndex.current = idx)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(idx);
            }}
            onDrop={() => onDrop(idx)}
            onDragEnd={() => {
              dragIndex.current = null;
              setOverIndex(null);
            }}
            className={cn(
              "group/row hover:bg-accent/40 flex items-center gap-3 px-3 py-3 transition-colors",
              idx < order.length - 1 && "border-border border-b",
              overIndex === idx && "bg-accent/60",
            )}
          >
            <span
              className="text-muted-foreground/50 hover:text-foreground cursor-grab px-1 active:cursor-grabbing"
              aria-hidden
              title="Drag to reorder"
            >
              <GripVertical className="size-4" />
            </span>

            <Thumb poster={r.posterUrl} video={r.videoUrl} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Link
                  href={`/admin/storefront/reels/${r.id}`}
                  className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
                >
                  {r.title}
                </Link>
                {r.hasPromo && (
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                    <Link2 className="size-3" />
                    Promo
                  </span>
                )}
                {!r.published && (
                  <span className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                    Draft
                  </span>
                )}
                {!r.videoUrl && (
                  <span className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                    No video
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8"
                title="Edit reel"
              >
                <Link href={`/admin/storefront/reels/${r.id}`}>
                  <ChevronRight className="size-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </Button>
              <DeleteReelButton id={r.id} name={r.title} variant="icon" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Thumb({
  poster,
  video,
}: {
  poster: string | null;
  video: string | null;
}) {
  return (
    <div className="from-muted/40 to-muted ring-border/60 relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ring-1">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="size-full object-cover" />
      ) : video ? (
        <video src={`${video}#t=0.1`} className="size-full object-cover" muted playsInline />
      ) : (
        <div className="text-muted-foreground/60 grid size-full place-items-center">
          <Film className="size-4" />
        </div>
      )}
    </div>
  );
}
