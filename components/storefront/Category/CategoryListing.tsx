"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
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

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryListing({
  category,
  description,
  products,
  subcategories,
}: Props) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [subcategory, setSubcategory] = useState<string>("all");
  const [materials, setMaterials] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [sort, setSort] = useState<SortValue>("featured");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = products;
    if (subcategory !== "all")
      arr = arr.filter((p) => p.subcategory === subcategory);
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
    }
    return sorted;
  }, [products, subcategory, materials, colors, inStockOnly, sort]);

  const visible = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );
  const hasMore = visible.length < filtered.length;

  const activeFilterCount =
    (subcategory !== "all" ? 1 : 0) +
    materials.size +
    colors.size +
    (inStockOnly ? 1 : 0);

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
  const toggleSet = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (v: string) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        return next;
      });
    },
    [],
  );

  const toggleMaterial = toggleSet(setMaterials);
  const toggleColor = toggleSet(setColors);

  const resetFilters = useCallback(() => {
    setSubcategory("all");
    setMaterials(new Set());
    setColors(new Set());
    setInStockOnly(false);
  }, []);

  const sortLabel =
    sortOptions.find((o) => o.value === sort)?.label ?? "Featured";

  const filterPanel = (
    <AccordionFilter
      subcategory={subcategory}
      subcategories={subcategories}
      onSubcategory={setSubcategory}
      materials={materials}
      onToggleMaterial={toggleMaterial}
      colors={colors}
      onToggleColor={toggleColor}
      inStockOnly={inStockOnly}
      onToggleInStock={() => setInStockOnly((s) => !s)}
    />
  );

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-20 lg:px-[4vw] lg:pt-14 lg:pb-24">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500">
            <li>
              <Link href="/" className="transition-colors hover:text-zinc-900">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-zinc-400" />
            </li>
            <li>
              <Link
                href="/category"
                className="transition-colors hover:text-zinc-900"
              >
                Categories
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-zinc-400" />
            </li>
            <li className="text-zinc-900">{category.name}</li>
          </ol>
        </nav>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          className="mt-6 flex flex-col gap-3 border-b border-zinc-200 pb-6 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-8"
          data-aos="fade-up"
        >
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              {category.name}
            </h1>
            {description && (
              <p className="mt-2 max-w-lg tracking-wide text-sm! font-light text-zinc-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
          <p className="text-xs tabular-nums text-zinc-500 md:text-sm">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </header>

        {/* ── Toolbar (mobile filter trigger + sort, sticky on mobile) ────── */}
        <div className="sticky top-0 z-10 -mx-4 mt-4 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:static lg:mx-0 lg:mt-6 lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          {/* Mobile filter trigger */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 transition-colors hover:border-zinc-900 lg:hidden"
              >
                <SlidersHorizontal className="size-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-zinc-950 text-[10px] tabular-nums text-white">
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
                onReset={resetFilters}
                resultCount={filtered.length}
                activeFilterCount={activeFilterCount}
              >
                {filterPanel}
              </MobileFilterSheet>
            </SheetContent>
          </Sheet>

          {/* Spacer on lg (filters shown in sidebar) */}
          <span className="hidden lg:block" />

          {/* Sort */}
          <div data-sort-menu className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((s) => !s)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 transition-colors hover:border-zinc-900"
            >
              <span className="hidden text-zinc-500 sm:inline">Sort by:</span>{" "}
              {sortLabel}
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
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-60 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,15,15,0.18)]"
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
                          "block w-full px-4 py-2.5 text-left text-sm transition-colors",
                          active
                            ? "bg-zinc-50 font-medium text-zinc-950"
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

        {/* ── Main grid: sidebar + products ──────────────────────────────── */}
        <div className="mt-6 grid gap-x-10 gap-y-0 md:mt-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (lg+) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-baseline justify-between border-b border-zinc-200 pb-3">
                <h2 className="text-sm font-medium tracking-tight text-zinc-950">
                  Filters
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
                    className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                {filterPanel}
              </div>
            </div>
          </aside>

          {/* Right column */}
          <div className="min-w-0">
            {visible.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div
                  className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 md:gap-y-12 lg:gap-x-6 xl:grid-cols-4"
                  data-aos="fade-up"
                  data-aos-delay="120"
                >
                  {visible.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div ref={sentinelRef} className="mt-14 flex justify-center">
                  {hasMore ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="block size-1.5 animate-pulse rounded-full bg-zinc-400" />
                      Loading more
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Showing all {filtered.length}{" "}
                      {filtered.length === 1 ? "product" : "products"}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion filter — one section open at a time
// ─────────────────────────────────────────────────────────────────────────────

type AccordionId = "subcategory" | "material" | "color" | "availability";

function AccordionFilter({
  subcategory,
  subcategories,
  onSubcategory,
  materials,
  onToggleMaterial,
  colors,
  onToggleColor,
  inStockOnly,
  onToggleInStock,
}: {
  subcategory: string;
  subcategories: string[];
  onSubcategory: (s: string) => void;
  materials: Set<string>;
  onToggleMaterial: (m: string) => void;
  colors: Set<string>;
  onToggleColor: (c: string) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
}) {
  // One open at a time. Default to "subcategory" so the panel doesn't load blank.
  const [open, setOpen] = useState<AccordionId | null>(
    subcategories.length > 1 ? "subcategory" : "material",
  );
  const toggle = (id: AccordionId) =>
    setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="divide-y divide-zinc-200">
      {subcategories.length > 1 && (
        <AccordionSection
          id="subcategory"
          title="Category"
          summary={
            subcategory === "all" ? "All" : subcategoryLabel(subcategory)
          }
          isOpen={open === "subcategory"}
          onToggle={() => toggle("subcategory")}
        >
          <ul className="space-y-2.5">
            {subcategories.map((sub) => {
              const active = subcategory === sub;
              return (
                <li key={sub}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
                    <input
                      type="radio"
                      name="subcategory"
                      checked={active}
                      onChange={() => onSubcategory(sub)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                        active
                          ? "border-zinc-950"
                          : "border-zinc-300",
                      )}
                    >
                      {active && (
                        <span className="block size-2 rounded-full bg-zinc-950" />
                      )}
                    </span>
                    {subcategoryLabel(sub)}
                  </label>
                </li>
              );
            })}
          </ul>
        </AccordionSection>
      )}

      <AccordionSection
        id="material"
        title="Material"
        summary={materials.size === 0 ? "Any" : `${materials.size} selected`}
        isOpen={open === "material"}
        onToggle={() => toggle("material")}
      >
        <ul className="space-y-2.5">
          {materialOptions.map((m) => (
            <li key={m}>
              <CheckRow
                label={m}
                active={materials.has(m)}
                onChange={() => onToggleMaterial(m)}
              />
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection
        id="color"
        title="Colour"
        summary={colors.size === 0 ? "Any" : `${colors.size} selected`}
        isOpen={open === "color"}
        onToggle={() => toggle("color")}
      >
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const active = colors.has(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onToggleColor(c.name)}
                aria-pressed={active}
                title={c.name}
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 transition-all",
                  active
                    ? "border-zinc-950"
                    : "border-transparent hover:border-zinc-300",
                )}
              >
                <span
                  className="block size-6 rounded-full border border-zinc-900/15"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}
        </div>
      </AccordionSection>

      <AccordionSection
        id="availability"
        title="Availability"
        summary={inStockOnly ? "In stock only" : "All items"}
        isOpen={open === "availability"}
        onToggle={() => toggle("availability")}
      >
        <label className="flex cursor-pointer items-center justify-between gap-4 text-sm text-zinc-700">
          In stock only
          <button
            type="button"
            onClick={onToggleInStock}
            aria-pressed={inStockOnly}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              inStockOnly ? "bg-zinc-950" : "bg-zinc-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                inStockOnly ? "translate-x-[1.375rem]" : "translate-x-0.5",
              )}
            />
          </button>
        </label>
      </AccordionSection>
    </div>
  );
}

function AccordionSection({
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  id: AccordionId;
  title: string;
  summary?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-medium tracking-tight text-zinc-950">
          {title}
        </span>
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          {!isOpen && summary && <span>{summary}</span>}
          <ChevronDown
            className={cn(
              "size-4 text-zinc-500 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function CheckRow({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700">
      <input
        type="checkbox"
        checked={active}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors",
          active ? "border-zinc-950 bg-zinc-950" : "border-zinc-300",
        )}
      >
        {active && (
          <svg
            viewBox="0 0 16 16"
            className="size-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              d="m4 8 3 3 5-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile sheet wrapper
// ─────────────────────────────────────────────────────────────────────────────

function MobileFilterSheet({
  onClose,
  onReset,
  resultCount,
  activeFilterCount,
  children,
}: {
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
  activeFilterCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
        <h2 className="text-sm font-medium tracking-tight text-zinc-950">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 tabular-nums text-zinc-500">
              ({activeFilterCount})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="grid size-9 place-items-center rounded-full text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Show {resultCount} {resultCount === 1 ? "result" : "results"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product card — same look as ProductShowcase
// ─────────────────────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: CatalogueProduct }) {
  const inStock = product.inStock ?? true;

  return (
    <Link href={product.href} className="group/card block">
      <div
        className="relative aspect-[3/4.25] overflow-hidden"
        style={{ backgroundColor: "#F5F1EA" }}
      >
        {product.imageUrl ? (
          <div className="absolute inset-0 grid place-items-center">
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

        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]",
            inStock ? "bg-zinc-950 text-white" : "bg-white text-zinc-900",
          )}
        >
          {inStock ? "New" : "Out of stock"}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-3 md:block">
          <div
            style={{
              transitionProperty: "opacity, translate",
              transitionDuration: "400ms",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="translate-y-3 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100"
          >
            <div className="flex items-center justify-between bg-white/95 px-3.5 py-2.5 backdrop-blur">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-950">
                View product
              </span>
              <ArrowUpRight className="size-3.5 text-zinc-950" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-sm font-normal tracking-tight text-zinc-950 sm:text-base">
          <span
            className={cn(
              "relative inline-block",
              "md:after:absolute md:after:inset-x-0 md:after:-bottom-0.5 md:after:h-px md:after:origin-center md:after:scale-x-0 md:after:bg-zinc-950 md:after:transition-transform md:after:duration-500 md:after:ease-out md:after:content-['']",
              "md:group-hover/card:after:scale-x-100",
            )}
          >
            {product.name}
          </span>
        </h3>
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
      <h3 className="text-lg font-medium tracking-tight text-zinc-950">
        No products match your filters.
      </h3>
      <p className="mt-2 text-sm text-zinc-600">
        Try removing a filter or two to see more results.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center rounded-full border border-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-950 hover:text-white"
      >
        Clear all filters
      </button>
    </div>
  );
}
