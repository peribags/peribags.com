import type { Route } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Catalogue product as consumed by the storefront category listing. Sourced
 * from `lib/services/storefront/products.service.ts` against the live DB.
 */
export type CatalogueProduct = {
  id: string;
  name: string;
  href: Route;
  imageUrl: string;
  pricePaise: number | null;
  inStock: boolean;
  /** Slugs of the direct child categories this product belongs to under the
   *  currently-viewed parent category. Used by the subcategory filter. */
  subcategorySlugs: string[];
  /** Label → values map, derived from the product's `specs` rows. */
  specifications: Record<string, string[]>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sort + display helpers
// ─────────────────────────────────────────────────────────────────────────────

export type SortValue = "featured" | "newest" | "price-low" | "price-high";

export const sortOptions: { value: SortValue; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

/** Title-case a kebab-case slug. Used as a fallback when no display name exists. */
export function subcategoryLabel(slug: string) {
  return slug
    .split("-")
    .map((s) => (s[0] ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter URL helpers — framework-agnostic, used by the client listing
// ─────────────────────────────────────────────────────────────────────────────

/** Slugify a spec key for use as a URL query param name. */
export function specKeyToParam(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Read a comma-separated multi-value param. */
export function readMulti(
  params: URLSearchParams | ReadonlyParams,
  key: string,
): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Write or delete a multi-value param in place. */
export function writeMulti(
  params: URLSearchParams,
  key: string,
  values: string[],
): void {
  if (values.length === 0) params.delete(key);
  else params.set(key, values.join(","));
}

// Narrow type alias — Next.js's `ReadonlyURLSearchParams` exposes the same
// `get` surface, so we accept either without importing from `next/navigation`.
type ReadonlyParams = { get(name: string): string | null };
