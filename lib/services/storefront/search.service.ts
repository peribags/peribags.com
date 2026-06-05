import "server-only";

import type { Route } from "next";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";

export type SearchCategoryHit = {
  id: string;
  name: string;
  href: Route;
  imageUrl?: string;
};

export type SearchProductHit = {
  id: string;
  name: string;
  href: Route;
  imageUrl?: string;
  pricePaise: number | null;
  inStock: boolean;
};

export type SearchResults = {
  categories: SearchCategoryHit[];
  products: SearchProductHit[];
};

type Row = {
  kind: string;
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_paise: number | null;
  in_stock: boolean | null;
  rank: number;
};

const MIN_QUERY = 2;

/**
 * Fuzzy catalog search over published categories + products, ranked by the
 * `search_catalog` Postgres function (pg_trgm similarity + full-text).
 *
 * Cached per query under the `products` + `categories` tags — repeated
 * searches skip the database entirely until catalog data changes.
 */
export async function searchCatalog(q: string): Promise<SearchResults> {
  const term = q.trim();
  if (term.length < MIN_QUERY) return { categories: [], products: [] };
  return unstable_cache(
    () => searchCatalogUncached(term),
    ["storefront-search", term.toLowerCase()],
    { tags: [CACHE_TAGS.products, CACHE_TAGS.categories] },
  )();
}

async function searchCatalogUncached(term: string): Promise<SearchResults> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("search_catalog", {
    q: term,
    max_categories: 6,
    max_products: 12,
  });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const categories: SearchCategoryHit[] = [];
  const products: SearchProductHit[] = [];

  for (const r of (data ?? []) as Row[]) {
    if (r.kind === "category") {
      categories.push({
        id: r.id,
        name: r.name,
        href: `/category/${r.slug}` as Route,
        imageUrl: r.image_url ? r2PublicUrl(r.image_url) : undefined,
      });
    } else {
      products.push({
        id: r.id,
        name: r.name,
        href: `/products/${r.slug}` as Route,
        imageUrl: r.image_url ? r2PublicUrl(r.image_url) : undefined,
        pricePaise: r.price_paise,
        inStock: r.in_stock ?? true,
      });
    }
  }

  return { categories, products };
}
