"use client";

import { useMemo, useRef, useState } from "react";
import { GripVertical, ImageIcon, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PickerOption = {
  id: string;
  label: string;
  /** Secondary line (e.g. slug, path). */
  sublabel?: string;
  /** Resolved thumbnail URL. */
  imageUrl?: string;
};

/**
 * A reusable "select + order" control. Renders one hidden input per selected
 * id (in order) under `name`, so a server action reads them with
 * `formData.getAll(name)`. Selected rows can be dragged to reorder.
 */
export function OrderedPicker({
  name,
  options,
  defaultValue = [],
  searchPlaceholder = "Search…",
  emptyHint = "Nothing selected yet.",
  thumbs = false,
}: {
  name: string;
  options: PickerOption[];
  defaultValue?: string[];
  searchPlaceholder?: string;
  emptyHint?: string;
  /** Show image thumbnails in the rows. */
  thumbs?: boolean;
}) {
  const optionById = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options],
  );

  const [selected, setSelected] = useState<string[]>(() =>
    defaultValue.filter((id) => optionById.has(id)),
  );
  const [query, setQuery] = useState("");
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const selectedSet = new Set(selected);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => !selectedSet.has(o.id))
      .filter(
        (o) =>
          !q ||
          o.label.toLowerCase().includes(q) ||
          o.sublabel?.toLowerCase().includes(q),
      )
      .slice(0, 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query, selected]);

  const add = (id: string) => setSelected((p) => (p.includes(id) ? p : [...p, id]));
  const remove = (id: string) => setSelected((p) => p.filter((x) => x !== id));

  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from == null || from === target) return;
    setSelected((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Hidden inputs carry the ordered selection to the server action. */}
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {/* Selected — draggable, ordered */}
      {selected.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-xs">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {selected.map((id, idx) => {
            const o = optionById.get(id);
            if (!o) return null;
            return (
              <li
                key={id}
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
                  "group/row border-border bg-card flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors",
                  overIndex === idx && "border-foreground/40 bg-accent/50",
                )}
              >
                <span
                  className="text-muted-foreground/60 hover:text-foreground cursor-grab active:cursor-grabbing"
                  aria-hidden
                >
                  <GripVertical className="size-4" />
                </span>

                <span className="text-muted-foreground w-5 shrink-0 text-center text-[11px] tabular-nums">
                  {idx + 1}
                </span>

                {thumbs && (
                  <span className="from-muted/40 to-muted ring-border/60 relative size-9 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ring-1">
                    {o.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={o.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground/60 grid size-full place-items-center">
                        <ImageIcon className="size-4" />
                      </span>
                    )}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="text-foreground block truncate text-sm font-medium">
                    {o.label}
                  </span>
                  {o.sublabel && (
                    <span className="text-muted-foreground block truncate font-mono text-[10px]">
                      {o.sublabel}
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Remove ${o.label}`}
                  className="text-muted-foreground hover:text-destructive grid size-7 shrink-0 place-items-center rounded-md transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add picker */}
      <div className="border-border bg-muted/20 rounded-xl border">
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <Search className="text-muted-foreground size-3.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="placeholder:text-muted-foreground/70 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-52 overflow-y-auto p-1.5">
          {matches.length === 0 ? (
            <p className="text-muted-foreground px-2 py-3 text-center text-xs">
              {query ? "No matches." : "All options added."}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {matches.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => add(o.id)}
                    className="hover:bg-accent flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
                  >
                    {thumbs && (
                      <span className="from-muted/40 to-muted ring-border/60 relative size-8 shrink-0 overflow-hidden rounded-md bg-gradient-to-br ring-1">
                        {o.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={o.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground/60 grid size-full place-items-center">
                            <ImageIcon className="size-3.5" />
                          </span>
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block truncate text-sm">
                        {o.label}
                      </span>
                      {o.sublabel && (
                        <span className="text-muted-foreground block truncate font-mono text-[10px]">
                          {o.sublabel}
                        </span>
                      )}
                    </span>
                    <Plus className="text-muted-foreground size-3.5 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
