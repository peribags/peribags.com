/**
 * Central registry of cache tags used by the storefront's cached reads
 * (`unstable_cache`) and revalidated by admin mutations (`revalidateTag`).
 *
 * Storefront data is cached indefinitely and only refreshed when the matching
 * tag is revalidated — i.e. when the data actually changes in the admin.
 */
export const CACHE_TAGS = {
  /** Home hero banner — slides + height config. */
  banner: "home-banner",
  /** Dynamic homepage sections (category rows / product showcases). */
  sections: "home-sections",
  /** Homepage reels carousel — items + heading config. */
  reels: "home-reels",
  /** Category tree — header mega menu, category pages, tiles. */
  categories: "categories",
  /** All product data — listings, detail pages, search, related. */
  products: "products",
  /** A single product's detail page. */
  product: (slug: string) => `product:${slug}`,
} as const;
