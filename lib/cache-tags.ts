/**
 * Central registry of cache tags used by storefront `unstable_cache` reads
 * and revalidated by admin mutations via `updateTag` (Next.js 16) /
 * `revalidateTag` (legacy alias).
 *
 * Granularity:
 * - Broad tags (banner, sections, reels, ourWork, categories, products) are
 *   invalidated when the corresponding entity changes globally.
 * - Per-entity helpers (product(slug), category(slug)) are invalidated when
 *   a SPECIFIC record changes, so a single product save doesn't bust the
 *   entire site's product caches at once.
 *
 * Admin code should call BOTH levels: when saving product "x":
 *   updateTag(CACHE_TAGS.products)        // refreshes lists / related strips
 *   updateTag(CACHE_TAGS.product(slug))   // refreshes that product's detail
 *
 * IMPORTANT: never combine these with `revalidatePath("/", "layout")`. That
 * call triggers Next.js's ISR regeneration of the page route, which has a
 * known-bad code path on Vercel for this project (produces broken HTML
 * where the storefront header loses `position: fixed`). Tag invalidation
 * alone is safe — it refreshes data without touching the page route cache.
 */
export const CACHE_TAGS = {
  /** Home hero banner — slides + height config. */
  banner: "home-banner",
  /** Dynamic homepage sections (category rows / product showcases). */
  sections: "home-sections",
  /** Homepage reels carousel — items + heading config. */
  reels: "home-reels",
  /** /our-work page items. */
  ourWork: "our-work",
  /** Category tree — header mega menu, category pages, tiles. */
  categories: "categories",
  /** All product data — listings, detail pages, search, related. */
  products: "products",
  /** A single product's detail page. */
  product: (slug: string) => `product:${slug}`,
  /** A single category's listing page. */
  category: (slug: string) => `category:${slug}`,
} as const;
