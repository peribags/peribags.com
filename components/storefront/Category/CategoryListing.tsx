"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { CategoryTile } from "@/lib/category-tiles";
import {
  type CatalogueProduct,
  type SortValue,
  readMulti,
  sortOptions,
  specKeyToParam,
  writeMulti,
} from "@/lib/catalogue";
import { ShowcaseProductCard } from "@/components/storefront/Product/ShowcaseProductCard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type AvailabilityValue = "in-stock" | "out-of-stock";

export type SubcategoryOption = {
  slug: string;
  name: string;
};

type Props = {
  category: CategoryTile;
  description?: string;
  products: CatalogueProduct[];
  subcategories: SubcategoryOption[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Derive filter facets from the product list. Keys + values are computed
// once per product set so the panel reflects whatever data the API returns.
// ─────────────────────────────────────────────────────────────────────────────

type SpecFacet = {
  key: string;
  paramKey: string;
  values: string[];
};

function buildSpecFacets(products: CatalogueProduct[]): SpecFacet[] {
  const map = new Map<string, Set<string>>();
  for (const p of products) {
    for (const [k, vs] of Object.entries(p.specifications)) {
      if (!map.has(k)) map.set(k, new Set());
      const bucket = map.get(k)!;
      for (const v of vs) bucket.add(v);
    }
  }
  return Array.from(map.entries())
    .map(([key, valuesSet]) => ({
      key,
      paramKey: specKeyToParam(key),
      values: Array.from(valuesSet).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

// ─────────────────────────────────────────────────────────────────────────────
// URL ↔ state
// ─────────────────────────────────────────────────────────────────────────────

type FilterState = {
  subcategory: string[];
  /** Map of spec display key → selected values. */
  specs: Record<string, string[]>;
  availability: AvailabilityValue[];
  sort: SortValue;
};

function readFiltersFromUrl(
  params: URLSearchParams | ReturnType<typeof useSearchParams>,
  specFacets: SpecFacet[],
): FilterState {
  const specs: Record<string, string[]> = {};
  for (const facet of specFacets) {
    const values = readMulti(params, facet.paramKey);
    if (values.length > 0) specs[facet.key] = values;
  }

  const rawSort = params.get("sort") as SortValue | null;
  const sort: SortValue = sortOptions.some((o) => o.value === rawSort)
    ? (rawSort as SortValue)
    : "featured";

  return {
    subcategory: readMulti(params, "subcategory"),
    specs,
    availability: readMulti(params, "availability").filter(
      (v): v is AvailabilityValue => v === "in-stock" || v === "out-of-stock",
    ),
    sort,
  };
}

function writeFiltersToUrl(
  current: URLSearchParams,
  state: FilterState,
  specFacets: SpecFacet[],
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  writeMulti(next, "subcategory", state.subcategory);
  writeMulti(next, "availability", state.availability);
  for (const facet of specFacets) {
    writeMulti(next, facet.paramKey, state.specs[facet.key] ?? []);
  }
  if (state.sort === "featured") next.delete("sort");
  else next.set("sort", state.sort);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryListing({
  category,
  description,
  products,
  subcategories,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const specFacets = useMemo(() => buildSpecFacets(products), [products]);

  // URL is the source of truth for filter state. We re-derive on every render.
  const state = useMemo(
    () => readFiltersFromUrl(searchParams, specFacets),
    [searchParams, specFacets],
  );

  // Local UI state — sort dropdown, mobile sheet, paginated visible count.
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const subSet = new Set(state.subcategory);
    const wantInStock = state.availability.includes("in-stock");
    const wantOutOfStock = state.availability.includes("out-of-stock");
    const hasAvailFilter = wantInStock !== wantOutOfStock;

    let arr = products;
    if (subSet.size > 0)
      arr = arr.filter((p) => p.subcategorySlugs.some((s) => subSet.has(s)));
    if (hasAvailFilter)
      arr = arr.filter((p) => (wantInStock ? p.inStock : !p.inStock));

    for (const [key, selected] of Object.entries(state.specs)) {
      if (selected.length === 0) continue;
      const wanted = new Set(selected);
      arr = arr.filter((p) =>
        (p.specifications[key] ?? []).some((v) => wanted.has(v)),
      );
    }

    const sorted = [...arr];
    switch (state.sort) {
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
  }, [products, state]);

  const visible = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );
  const hasMore = visible.length < filtered.length;

  // ── Infinite scroll sentinel ─────────────────────────────────────────────
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

  // ── Sort dropdown outside-click / Escape ─────────────────────────────────
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

  // ── State mutators — every change rewrites the URL ───────────────────────
  const pushState = useCallback(
    (next: FilterState) => {
      const params = writeFiltersToUrl(
        new URLSearchParams(searchParams.toString()),
        next,
        specFacets,
      );
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams, specFacets],
  );

  const toggleSubcategory = (slug: string) => {
    const set = new Set(state.subcategory);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    pushState({ ...state, subcategory: Array.from(set) });
  };

  const toggleSpec = (key: string, value: string) => {
    const current = state.specs[key] ?? [];
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    const nextSpecs = { ...state.specs };
    if (set.size === 0) delete nextSpecs[key];
    else nextSpecs[key] = Array.from(set);
    pushState({ ...state, specs: nextSpecs });
  };

  const toggleAvailability = (v: AvailabilityValue) => {
    const set = new Set(state.availability);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    pushState({ ...state, availability: Array.from(set) });
  };

  const setSort = (sort: SortValue) => pushState({ ...state, sort });

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  // ── Derived UI bits ──────────────────────────────────────────────────────
  const activeChips = useMemo(
    () => collectActiveChips(state, subcategories),
    [state, subcategories],
  );
  const activeFilterCount = activeChips.length;

  const sortLabel =
    sortOptions.find((o) => o.value === state.sort)?.label ?? "Featured";

  const filterPanel = (
    <AccordionFilter
      subcategory={state.subcategory}
      subcategories={subcategories}
      onToggleSubcategory={toggleSubcategory}
      specFacets={specFacets}
      specs={state.specs}
      onToggleSpec={toggleSpec}
      availability={state.availability}
      onToggleAvailability={toggleAvailability}
    />
  );

  return (
    <section className="bg-white">
      {/* Filtering overlay — full-screen white veil + circular loader while
          the URL transition (filter/sort change) is pending. */}
      <div
        role="status"
        aria-hidden={!isPending}
        className={cn(
          "fixed inset-0 z-50 grid place-items-center bg-white/50  transition-opacity duration-200",
          isPending ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <span
          aria-hidden
          className="size-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950"
        />
        <span className="sr-only">Updating results…</span>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-20 lg:px-[4vw] lg:pt-14 lg:pb-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500">
            <li>
              <Link href="/" className="hover:text-zinc-900">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-zinc-400" />
            </li>
            <li>
              <Link href="/category" className="hover:text-zinc-900">
                Categories
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-zinc-400" />
            </li>
            <li className="text-zinc-900">{category.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mt-6 flex flex-col gap-3 border-b border-zinc-200 pb-6 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-8">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              {category.name}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
          <p className="text-xs tabular-nums text-zinc-500 md:text-sm">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </header>

        {/* Toolbar */}
        <div className=" z-10 -mx-4 mt-4 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:static lg:mx-0 lg:mt-6 lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:border-zinc-900 lg:hidden"
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

          <span className="hidden lg:block" />

          <div data-sort-menu className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((s) => !s)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:border-zinc-900"
            >
              <span className="hidden text-zinc-500 sm:inline">Sort by:</span>{" "}
              {sortLabel}
              <ChevronDown
                className={cn("size-3.5", sortOpen && "rotate-180")}
              />
            </button>
            {sortOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-60 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,15,15,0.18)]"
              >
                {sortOptions.map((opt) => {
                  const active = opt.value === state.sort;
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
                          "block w-full px-4 py-2.5 text-left text-sm",
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

        {/* Main grid: sidebar + products */}
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
              <div className="mt-2 pr-1">{filterPanel}</div>
            </div>
          </aside>

          {/* Right column */}
          <div className="min-w-0">
            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <ActiveChips
                chips={activeChips}
                onRemove={(chip) => {
                  switch (chip.kind) {
                    case "subcategory":
                      toggleSubcategory(chip.value);
                      break;
                    case "availability":
                      toggleAvailability(chip.value as AvailabilityValue);
                      break;
                    case "spec":
                      toggleSpec(chip.specKey!, chip.value);
                      break;
                  }
                }}
                onClearAll={resetFilters}
              />
            )}

            {visible.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div
                  className={cn(
                    "grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4 md:gap-y-12 lg:grid-cols-4 lg:gap-x-6",
                    activeChips.length > 0 ? "mt-6" : "mt-0",
                  )}
                >
                  {visible.map((p) => (
                    <ShowcaseProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div ref={sentinelRef} className="mt-14 flex justify-center">
                  {hasMore ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="block size-1.5 rounded-full bg-zinc-400" />
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
// Active filter chips
// ─────────────────────────────────────────────────────────────────────────────

type ActiveChip =
  | { kind: "subcategory"; label: string; value: string }
  | { kind: "availability"; label: string; value: string }
  | { kind: "spec"; label: string; value: string; specKey: string };

function collectActiveChips(
  state: FilterState,
  subcategories: SubcategoryOption[],
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  const byslug = new Map(subcategories.map((s) => [s.slug, s.name]));
  for (const slug of state.subcategory) {
    const name = byslug.get(slug);
    if (!name) continue;
    chips.push({
      kind: "subcategory",
      label: name,
      value: slug,
    });
  }

  for (const v of state.availability) {
    chips.push({
      kind: "availability",
      label: v === "in-stock" ? "In stock" : "Out of stock",
      value: v,
    });
  }

  for (const [key, values] of Object.entries(state.specs)) {
    for (const value of values) {
      chips.push({
        kind: "spec",
        label: `${key}: ${value}`,
        value,
        specKey: key,
      });
    }
  }

  return chips;
}

function ActiveChips({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: ActiveChip[];
  onRemove: (chip: ActiveChip) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 pb-4">
      {chips.map((chip) => (
        <button
          key={
            chip.kind === "spec"
              ? `spec-${chip.specKey}-${chip.value}`
              : `${chip.kind}-${chip.value}`
          }
          type="button"
          onClick={() => onRemove(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700 hover:border-zinc-900 hover:text-zinc-950"
        >
          {chip.label}
          <X className="size-3" aria-hidden />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion filter
// ─────────────────────────────────────────────────────────────────────────────

type AccordionId = string;

function AccordionFilter({
  subcategory,
  subcategories,
  onToggleSubcategory,
  specFacets,
  specs,
  onToggleSpec,
  availability,
  onToggleAvailability,
}: {
  subcategory: string[];
  subcategories: SubcategoryOption[];
  onToggleSubcategory: (slug: string) => void;
  specFacets: SpecFacet[];
  specs: Record<string, string[]>;
  onToggleSpec: (key: string, value: string) => void;
  availability: AvailabilityValue[];
  onToggleAvailability: (v: AvailabilityValue) => void;
}) {
  const showSubcategory = subcategories.length > 0;

  const initialOpen: AccordionId = showSubcategory
    ? "subcategory"
    : (specFacets[0]?.key ?? "availability");
  const [open, setOpen] = useState<AccordionId | null>(initialOpen);
  const toggle = (id: AccordionId) =>
    setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="divide-y divide-zinc-200">
      {showSubcategory && (
        <AccordionSection
          title="Category"
          summary={
            subcategory.length === 0 ? "All" : `${subcategory.length} selected`
          }
          isOpen={open === "subcategory"}
          onToggle={() => toggle("subcategory")}
        >
          <ul className="space-y-2.5">
            {subcategories.map((sub) => (
              <li key={sub.slug}>
                <CheckRow
                  label={sub.name}
                  active={subcategory.includes(sub.slug)}
                  onChange={() => onToggleSubcategory(sub.slug)}
                />
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {specFacets.map((facet) => {
        const selected = specs[facet.key] ?? [];
        return (
          <AccordionSection
            key={facet.key}
            title={facet.key}
            summary={
              selected.length === 0 ? "Any" : `${selected.length} selected`
            }
            isOpen={open === facet.key}
            onToggle={() => toggle(facet.key)}
          >
            <ul className="space-y-2.5">
              {facet.values.map((v) => (
                <li key={v}>
                  <CheckRow
                    label={v}
                    active={selected.includes(v)}
                    onChange={() => onToggleSpec(facet.key, v)}
                  />
                </li>
              ))}
            </ul>
          </AccordionSection>
        );
      })}

      <AccordionSection
        title="Availability"
        summary={
          availability.length === 0 ? "All" : `${availability.length} selected`
        }
        isOpen={open === "availability"}
        onToggle={() => toggle("availability")}
      >
        <ul className="space-y-2.5">
          <li>
            <CheckRow
              label="In stock"
              active={availability.includes("in-stock")}
              onChange={() => onToggleAvailability("in-stock")}
            />
          </li>
          <li>
            <CheckRow
              label="Out of stock"
              active={availability.includes("out-of-stock")}
              onChange={() => onToggleAvailability("out-of-stock")}
            />
          </li>
        </ul>
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
              "size-4 text-zinc-500 transition-transform duration-300 ease-out",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>
      {/* Grid-rows trick animates height from 0 → auto without measuring. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "pt-4 transition-opacity duration-300 ease-out",
              isOpen ? "opacity-100" : "opacity-0",
            )}
          >
            {children}
          </div>
        </div>
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
          "grid size-4 shrink-0 place-items-center rounded-sm border",
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
// Mobile sheet
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
          className="grid size-9 place-items-center rounded-full text-zinc-900 hover:bg-zinc-100"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>

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
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Show {resultCount} {resultCount === 1 ? "result" : "results"}
        </button>
      </div>
    </div>
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
        className="mt-6 inline-flex items-center rounded-full border border-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-950 hover:text-white"
      >
        Clear all filters
      </button>
    </div>
  );
}
