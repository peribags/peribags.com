"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Search as SearchIcon, X } from "lucide-react";
import type { CategoryTile } from "@/lib/category-tiles";
import { newArrivals } from "@/lib/new-arrivals";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  query: string;
  tiles: CategoryTile[];
  onClose: () => void;
  onQueryChange: (q: string) => void;
};

function formatINR(paise: number | null) {
  if (paise == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function HeaderSearchModal({
  open,
  query,
  tiles,
  onClose,
  onQueryChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input shortly after opening (after the transition starts).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // Body scroll lock.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const matchedCategories = useMemo(() => {
    if (!hasQuery) return [];
    return tiles.filter((c) => c.name.toLowerCase().includes(q));
  }, [hasQuery, q, tiles]);

  const matchedProducts = useMemo(() => {
    if (!hasQuery) return [];
    return newArrivals.filter((p) => p.name.toLowerCase().includes(q));
  }, [hasQuery, q]);

  const empty = hasQuery && matchedCategories.length === 0 && matchedProducts.length === 0;

  return (
    <div
      aria-hidden={!open}
      style={{ pointerEvents: open ? "auto" : "none" }}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        style={{
          transitionProperty: "opacity",
          transitionDuration: "300ms",
          transitionTimingFunction: "ease-out",
          opacity: open ? 1 : 0,
        }}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
      />

      {/* Panel — slides down from top */}
      <div
        style={{
          transitionProperty: "opacity, translate",
          transitionDuration: "400ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: open ? 1 : 0,
          translate: open ? "0 0" : "0 -1.25rem",
        }}
        className="absolute inset-x-0 top-0 max-h-[90vh] overflow-y-auto bg-white shadow-[0_24px_48px_-24px_rgba(15,15,15,0.18)]"
      >
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-[4vw] lg:py-8">
          {/* Search bar */}
          <div className="flex items-center gap-4 border-b border-zinc-300 pb-4">
            <SearchIcon className="size-5 shrink-0 text-zinc-500" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search bags, categories, colours…"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-lg tracking-tight text-zinc-950 outline-none placeholder:text-zinc-400 lg:text-xl"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid size-10 shrink-0 place-items-center text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Results / suggestions */}
          <div className="pb-10 pt-8">
            {!hasQuery && <Suggestions tiles={tiles} onItemClick={onClose} />}

            {hasQuery && !empty && (
              <div className="grid grid-cols-12 gap-8 lg:gap-12">
                {matchedCategories.length > 0 && (
                  <div className={cn(matchedProducts.length > 0 ? "col-span-12 lg:col-span-4" : "col-span-12")}>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Categories
                    </p>
                    <ul className="mt-4 space-y-2">
                      {matchedCategories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            onClick={onClose}
                            className="group/c inline-flex items-center gap-1.5 text-base font-medium tracking-tight text-zinc-900 transition-colors hover:text-zinc-600"
                          >
                            {c.name}
                            <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/c:translate-x-0 group-hover/c:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchedProducts.length > 0 && (
                  <div className={cn(matchedCategories.length > 0 ? "col-span-12 lg:col-span-8" : "col-span-12")}>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Products ({matchedProducts.length})
                    </p>
                    <ul className="mt-4 divide-y divide-zinc-100">
                      {matchedProducts.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={p.href}
                            onClick={onClose}
                            className="group/p flex items-center gap-4 py-3 transition-colors hover:bg-zinc-50"
                          >
                            <div className="relative size-16 shrink-0 overflow-hidden bg-zinc-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={"/product.jpg"}
                                alt={p.name}
                                loading="lazy"
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium tracking-tight text-zinc-950">
                                {p.name}
                              </p>
                              <p className="mt-0.5 text-sm tabular-nums text-zinc-600">
                                {formatINR(p.pricePaise) ?? "Price on request"}
                              </p>
                            </div>
                            <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-all group-hover/p:-translate-y-0.5 group-hover/p:translate-x-0.5 group-hover/p:text-zinc-950" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {empty && (
              <div className="py-8 text-center">
                <p className="text-base text-zinc-700">
                  No results for <span className="font-medium text-zinc-950">&ldquo;{query}&rdquo;</span>
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try a different word, or browse popular categories below.
                </p>
                <div className="mt-6">
                  <Suggestions tiles={tiles} onItemClick={onClose} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Suggestions({
  tiles,
  onItemClick,
}: {
  tiles: CategoryTile[];
  onItemClick: () => void;
}) {
  if (tiles.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
        Popular Categories
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {tiles.map((c) => (
          <Link
            key={c.id}
            href={c.href}
            onClick={onItemClick}
            className="inline-flex items-center border border-zinc-200 px-4 py-2 text-sm font-medium tracking-tight text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
