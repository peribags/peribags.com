"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, FolderTree, GripVertical, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeSectionType } from "@/types";
import { reorderSectionsAction } from "./actions";
import { DeleteSectionButton } from "./delete-section-button";

export type SectionSummary = {
  id: string;
  type: HomeSectionType;
  title: string;
  itemCount: number;
  published: boolean;
};

export function SectionsBoard({ sections }: { sections: SectionSummary[] }) {
  const [order, setOrder] = useState<SectionSummary[]>(sections);
  const [pending, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const persist = (next: SectionSummary[]) => {
    startTransition(async () => {
      const res = await reorderSectionsAction(next.map((s) => s.id));
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
          Sections
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {pending ? "Saving order…" : "Drag to reorder"}
        </span>
      </div>

      <ul>
        {order.map((s, idx) => (
          <li
            key={s.id}
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

            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg",
                s.type === "category"
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "bg-violet-500/10 text-violet-600 dark:text-violet-300",
              )}
            >
              {s.type === "category" ? (
                <FolderTree className="size-4" />
              ) : (
                <Package className="size-4" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <Link
                  href={`/admin/storefront/home-sections/${s.id}`}
                  className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
                >
                  {s.title}
                </Link>
                <Badge tone={s.type === "category" ? "sky" : "violet"}>
                  {s.type}
                </Badge>
                {!s.published && <Badge tone="amber">Draft</Badge>}
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {s.itemCount} {s.itemCount === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8"
                title="Edit section"
              >
                <Link href={`/admin/storefront/home-sections/${s.id}`}>
                  <ChevronRight className="size-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </Button>
              <DeleteSectionButton id={s.id} name={s.title} variant="icon" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "sky" | "violet" | "amber";
  children: React.ReactNode;
}) {
  const styles = {
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    violet:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    amber:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        styles,
      )}
    >
      {children}
    </span>
  );
}
