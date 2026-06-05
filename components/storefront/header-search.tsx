"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowUpRight,
  ImageIcon,
  Loader2,
  Search as SearchIcon,
  X,
} from "lucide-react";
import type { CategoryTile } from "@/lib/category-tiles";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  query: string;
  tiles: CategoryTile[];
  onClose: () => void;
  onQueryChange: (q: string) => void;
};

// Mirrors the /api/search response shape.
type CategoryHit = {
  id: string;
  name: string;
  href: string;
  imageUrl?: string;
};

type ProductHit = {
  id: string;
  name: string;
  href: string;
  imageUrl?: string;
  pricePaise: number | null;
  inStock: boolean;
};

type Results = { categories: CategoryHit[]; products: ProductHit[] };

const MIN_QUERY = 2;
const DEBOUNCE_MS = 200;

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

  // Backend results, tagged with the query they answer so we can tell fresh
  // results from stale ones without having to clear state synchronously.
  const [results, setResults] = useState<Results & { forQuery: string }>({
    forQuery: "",
    categories: [],
    products: [],
  });
  // Session cache: repeated queries (e.g. backspacing) answer instantly.
  const cacheRef = useRef(new Map<string, Results>());

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

  // Debounced backend search — aborts in-flight requests when the query moves
  // on, and serves repeats from the session cache.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const key = q.toLowerCase();
      const cached = cacheRef.current.get(key);
      if (cached) {
        setResults({ forQuery: q, ...cached });
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as Results;
        cacheRef.current.set(key, data);
        setResults({ forQuery: q, ...data });
      } catch {
        // Aborted or failed — keep whatever we showed last.
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const q = query.trim();
  const hasQuery = q.length >= MIN_QUERY;
  const fresh = results.forQuery === q;
  const searching = hasQuery && !fresh;

  const matchedCategories = hasQuery && fresh ? results.categories : [];
  const matchedProducts = hasQuery && fresh ? results.products : [];
  const empty =
    hasQuery &&
    fresh &&
    matchedCategories.length === 0 &&
    matchedProducts.length === 0;

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
            {searching ? (
              <Loader2
                className="size-5 shrink-0 animate-spin text-zinc-500"
                aria-hidden
              />
            ) : (
              <SearchIcon
                className="size-5 shrink-0 text-zinc-500"
                aria-hidden
              />
            )}
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search bags, categories…"
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

            {searching && (
              <p className="text-sm text-zinc-500">
                Searching for{" "}
                <span className="font-medium text-zinc-900">
                  &ldquo;{q}&rdquo;
                </span>
                …
              </p>
            )}

            {hasQuery && fresh && !empty && (
              <div className="grid grid-cols-12 gap-8 lg:gap-12">
                {matchedCategories.length > 0 && (
                  <div
                    className={cn(
                      matchedProducts.length > 0
                        ? "col-span-12 lg:col-span-4"
                        : "col-span-12",
                    )}
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Categories
                    </p>
                    <ul className="mt-4 space-y-2">
                      {matchedCategories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href as Route}
                            onClick={onClose}
                            className="group/c inline-flex items-center gap-1.5 text-base font-medium tracking-tight text-zinc-900 transition-colors hover:text-zinc-600"
                          >
                            {/* <Highlight text={c.name} query={q} /> */}
                            {c.name}
                            <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/c:translate-x-0 group-hover/c:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchedProducts.length > 0 && (
                  <div
                    className={cn(
                      matchedCategories.length > 0
                        ? "col-span-12 lg:col-span-8"
                        : "col-span-12",
                    )}
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Products ({matchedProducts.length})
                    </p>
                    <ul className="mt-4 divide-y divide-zinc-100">
                      {matchedProducts.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={p.href as Route}
                            onClick={onClose}
                            className="group/p flex items-center gap-4 py-3 transition-colors hover:bg-zinc-50"
                          >
                            <div className="relative size-16 shrink-0 overflow-hidden bg-zinc-100">
                              {p.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="grid size-full place-items-center text-zinc-400">
                                  <ImageIcon className="size-5" aria-hidden />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium tracking-tight text-zinc-950">
                                <Highlight text={p.name} query={q} />
                              </p>
                              <p className="mt-0.5 text-sm tabular-nums text-zinc-600">
                                {formatINR(p.pricePaise) ?? "Price on request"}
                                {!p.inStock && (
                                  <span className="ml-2 text-xs uppercase tracking-wide text-zinc-400">
                                    Out of stock
                                  </span>
                                )}
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
                  No results for{" "}
                  <span className="font-medium text-zinc-950">
                    &ldquo;{query}&rdquo;
                  </span>
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

/** Bolds the first case-insensitive occurrence of `query` inside `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-inherit">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
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
