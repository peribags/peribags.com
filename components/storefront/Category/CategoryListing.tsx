"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ImageIcon, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { CategoryTile } from "@/lib/category-tiles";
import {
  type CatalogueProduct,
  type SortValue,
  colorOptions,
  materialOptions,
  sortOptions,
  subcategoryLabel,
} from "@/lib/catalogue";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type Props = {
  category: CategoryTile;
  description?: string;
  products: CatalogueProduct[];
  subcategories: string[];
};

function formatINR(paise: number | null) {
  if (paise == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function CategoryListing({
  category,
  description,
  products,
  subcategories,
}: Props) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [subcategory, setSubcategory] = useState<string>("all");
  const [materials, setMaterials] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortValue>("featured");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = products;
    if (subcategory !== "all") arr = arr.filter((p) => p.subcategory === subcategory);
    if (materials.size > 0) arr = arr.filter((p) => materials.has(p.material));
    if (colors.size > 0)
      arr = arr.filter((p) => p.colors.some((c) => colors.has(c)));
    if (inStockOnly) arr = arr.filter((p) => p.inStock !== false);

    const sorted = [...arr];
    switch (sort) {
      case "price-low":
        sorted.sort(
          (a, b) => (a.pricePaise ?? Infinity) - (b.pricePaise ?? Infinity),
        );
        break;
      case "price-high":
        sorted.sort(
          (a, b) => (b.pricePaise ?? -Infinity) - (a.pricePaise ?? -Infinity),
        );
        break;
      case "newest":
        sorted.reverse();
        break;
      // featured = source order
    }
    return sorted;
  }, [products, subcategory, materials, colors, inStockOnly, sort]);

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  const activeFilterCount =
    materials.size + colors.size + (inStockOnly ? 1 : 0);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [subcategory, materials, colors, inStockOnly, sort]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: "400px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore]);

  useEffect(() => {
    if (!sortOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-sort-menu]")) setSortOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [sortOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleMaterial = useCallback((m: string) => {
    setMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }, []);

  const toggleColor = useCallback((c: string) => {
    setColors((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setMaterials(new Set());
    setColors(new Set());
    setInStockOnly(false);
  }, []);

  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? "Featured";

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FAF7F1" }}>
        <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-14 md:px-6 md:pt-14 md:pb-20 lg:px-[4vw] lg:pt-16 lg:pb-24">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              <li>
                <Link href="/" className="transition-colors hover:text-zinc-950">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3 text-zinc-400" />
              </li>
              <li>
                <Link href="/category" className="transition-colors hover:text-zinc-950">
                  Catalogue
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3 text-zinc-400" />
              </li>
              <li className="text-zinc-950">{category.name}</li>
            </ol>
          </nav>

          <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10 lg:mt-14">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {category.kicker ?? "The Collection"}
              </p>
              <h1 className="mt-3 text-4xl font-normal leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                {category.name}.
              </h1>
              {description && (
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  {description}
                </p>
              )}
            </div>
            <div className="col-span-12 lg:col-span-4 lg:self-end">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-900/15 pt-6 text-sm lg:max-w-xs lg:justify-self-end">
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Styles</dt>
                <dd className="tabular-nums text-zinc-950">
                  {String(products.length).padStart(2, "0")}
                </dd>
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Season</dt>
                <dd className="text-zinc-950">SS26</dd>
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Made in</dt>
                <dd className="text-zinc-950">India</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subcategory chips (sticky) ────────────────────────────────────── */}
      {subcategories.length > 1 && (
        <section className="sticky top-16 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur lg:top-20">
          <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-[4vw]">
            <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {subcategories.map((sub) => {
                const active = subcategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={cn(
                      "shrink-0 border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors",
                      active
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-950",
                    )}
                  >
                    {subcategoryLabel(sub)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Main: sidebar + grid ─────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-[4vw]">
          <div className="grid gap-x-10 gap-y-0 pb-10 pt-8 md:pb-14 lg:grid-cols-[240px_1fr] lg:pb-20 lg:pt-10">
            {/* ── Sidebar (lg+) ───────────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-36">
                <div className="flex items-baseline justify-between border-b border-zinc-200 pb-3">
                  <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-950">
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 tabular-nums text-zinc-500">
                        ({activeFilterCount})
                      </span>
                    )}
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-6">
                  <FilterContent
                    materials={materials}
                    colors={colors}
                    inStockOnly={inStockOnly}
                    onToggleMaterial={toggleMaterial}
                    onToggleColor={toggleColor}
                    onToggleInStock={() => setInStockOnly((s) => !s)}
                  />
                </div>
              </div>
            </aside>

            {/* ── Main column: bar + grid ─────────────────────────────────── */}
            <div className="min-w-0">
              {/* Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                {/* Mobile filter trigger */}
                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-900 transition-colors hover:border-zinc-900 lg:hidden"
                    >
                      <SlidersHorizontal className="size-3.5" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="ml-1 grid size-5 place-items-center bg-zinc-950 text-[10px] tabular-nums text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full max-w-md bg-white p-0"
                    showCloseButton={false}
                  >
                    <MobileFilterSheet
                      onClose={() => setFilterOpen(false)}
                      materials={materials}
                      colors={colors}
                      inStockOnly={inStockOnly}
                      onToggleMaterial={toggleMaterial}
                      onToggleColor={toggleColor}
                      onToggleInStock={() => setInStockOnly((s) => !s)}
                      onReset={resetFilters}
                      resultCount={filtered.length}
                    />
                  </SheetContent>
                </Sheet>

                {/* Count — desktop center, hidden on small */}
                <p className="hidden text-xs font-medium uppercase tracking-[0.18em] tabular-nums text-zinc-600 sm:block">
                  {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "Style" : "Styles"}
                </p>

                {/* Sort */}
                <div data-sort-menu className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((s) => !s)}
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                    className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-900 transition-colors hover:border-zinc-900"
                  >
                    <span className="hidden sm:inline">Sort:</span> {sortLabel}
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-300",
                        sortOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {sortOpen && (
                    <ul
                      role="listbox"
                      className="absolute right-0 top-[calc(100%+8px)] z-20 w-60 border border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,15,15,0.18)]"
                    >
                      {sortOptions.map((opt) => {
                        const active = opt.value === sort;
                        return (
                          <li key={opt.value}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={active}
                              onClick={() => {
                                setSort(opt.value);
                                setSortOpen(false);
                              }}
                              className={cn(
                                "block w-full px-4 py-3 text-left text-sm tracking-tight transition-colors",
                                active
                                  ? "bg-zinc-50 text-zinc-950"
                                  : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                              )}
                            >
                              {opt.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Grid */}
              {visible.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : (
                <>
                  <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 md:gap-y-12 lg:gap-x-6 lg:gap-y-14 xl:grid-cols-4">
                    {visible.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  <div ref={sentinelRef} className="mt-16 flex justify-center">
                    {hasMore ? (
                      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
                        <span className="block size-1.5 animate-pulse rounded-full bg-zinc-400" />
                        Loading more
                      </div>
                    ) : (
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
                        End of catalogue · {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "style" : "styles"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter content — used in both the desktop sidebar and the mobile sheet
// ─────────────────────────────────────────────────────────────────────────────

function FilterContent({
  materials,
  colors,
  inStockOnly,
  onToggleMaterial,
  onToggleColor,
  onToggleInStock,
}: {
  materials: Set<string>;
  colors: Set<string>;
  inStockOnly: boolean;
  onToggleMaterial: (m: string) => void;
  onToggleColor: (c: string) => void;
  onToggleInStock: () => void;
}) {
  return (
    <div className="space-y-10">
      {/* Material */}
      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Material
        </h3>
        <ul className="mt-4 space-y-3">
          {materialOptions.map((m) => {
            const active = materials.has(m);
            return (
              <li key={m}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-900">
                  <span
                    className={cn(
                      "grid size-5 place-items-center border transition-colors",
                      active ? "border-zinc-950 bg-zinc-950" : "border-zinc-300",
                    )}
                  >
                    {active && (
                      <svg viewBox="0 0 16 16" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m4 8 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggleMaterial(m)}
                    className="sr-only"
                  />
                  {m}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Colour */}
      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Colour
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const active = colors.has(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onToggleColor(c.name)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 border px-3 py-2 text-xs tracking-tight transition-colors",
                  active
                    ? "border-zinc-950 text-zinc-950"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-950",
                )}
              >
                <span
                  className="block size-3 rounded-full border border-zinc-900/15"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* In-stock toggle */}
      <section>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Availability
            </h3>
            <p className="mt-2 text-sm text-zinc-900">In stock only</p>
          </div>
          <button
            type="button"
            onClick={onToggleInStock}
            aria-pressed={inStockOnly}
            className={cn(
              "relative h-6 w-11 shrink-0 transition-colors",
              inStockOnly ? "bg-zinc-950" : "bg-zinc-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 bg-white transition-transform",
                inStockOnly ? "translate-x-[1.375rem]" : "translate-x-0.5",
              )}
            />
          </button>
        </label>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile sheet wrapper
// ─────────────────────────────────────────────────────────────────────────────

function MobileFilterSheet({
  onClose,
  materials,
  colors,
  inStockOnly,
  onToggleMaterial,
  onToggleColor,
  onToggleInStock,
  onReset,
  resultCount,
}: {
  onClose: () => void;
  materials: Set<string>;
  colors: Set<string>;
  inStockOnly: boolean;
  onToggleMaterial: (m: string) => void;
  onToggleColor: (c: string) => void;
  onToggleInStock: () => void;
  onReset: () => void;
  resultCount: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-950">
          Filter
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="grid size-10 place-items-center text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <FilterContent
          materials={materials}
          colors={colors}
          inStockOnly={inStockOnly}
          onToggleMaterial={onToggleMaterial}
          onToggleColor={onToggleColor}
          onToggleInStock={onToggleInStock}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 bg-zinc-950 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800"
        >
          Show {resultCount} {resultCount === 1 ? "result" : "results"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product card
// ─────────────────────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: CatalogueProduct }) {
  const inStock = product.inStock ?? true;
  const price = formatINR(product.pricePaise);

  return (
    <Link href={product.href} className="group/card block">
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ backgroundColor: "#F5F1EA" }}
      >
        {product.imageUrl ? (
          <div className="absolute inset-0 grid place-items-center p-5 md:p-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={cn(
                "max-h-full max-w-full object-contain transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]",
                !inStock && "opacity-70",
              )}
            />
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400">
            <ImageIcon className="size-8" aria-hidden />
          </div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-900">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-sm font-normal tracking-tight text-zinc-950 sm:text-base">
          {product.name}
        </h3>
        {price ? (
          <p className="mt-1 text-sm tabular-nums text-zinc-600">{price}</p>
        ) : (
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            On request
          </p>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-20 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
        Nothing matches
      </p>
      <h3 className="mt-3 text-2xl font-normal tracking-tight text-zinc-950">
        Try widening your filters.
      </h3>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center border border-zinc-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-900 transition-colors hover:bg-zinc-950 hover:text-white"
      >
        Reset filters
      </button>
    </div>
  );
}
