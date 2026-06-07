import "server-only";

import type { Route } from "next";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createAnonClient } from "@/lib/supabase/anon";
import { extractColorVariants } from "@/lib/color-swatches";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";
import type { CategoryTile } from "@/lib/category-tiles";
import type { NewArrivalCard } from "@/lib/new-arrivals";
import type { HomeSectionType } from "@/types";

type SectionRow = {
  id: string;
  type: string;
  kicker: string | null;
  heading: string | null;
  description: string | null;
  background: string | null;
  product_source: string;
  item_limit: number | null;
  view_all_href: string | null;
  view_all_label: string | null;
  sort_order: number;
  home_section_categories?: { category_id: string; sort_order: number }[] | null;
  home_section_products?: { product_id: string; sort_order: number }[] | null;
};

export type ResolvedHomeSection = {
  id: string;
  type: HomeSectionType;
  kicker?: string;
  heading?: string;
  description?: string;
  background?: string;
  viewAllHref?: Route;
  viewAllLabel?: string;
  limit?: number;
  /** Populated for category sections. */
  tiles: CategoryTile[];
  /** Populated for product sections. */
  products: NewArrivalCard[];
};

const orderIds = (
  links: { sort_order: number }[] | null | undefined,
  key: "category_id" | "product_id",
): string[] =>
  (links ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((l) => (l as Record<string, unknown>)[key] as string);

/**
 * Resolved, ready-to-render homepage sections, in display order.
 * Tagged with `sections` + `categories` + `products` because output embeds all three.
 */
export const getPublishedHomeSections = unstable_cache(
  async (): Promise<ResolvedHomeSection[]> => {
    const supabase = createAnonClient();

  const { data, error } = await supabase
    .from("home_sections")
    .select(
      "*, home_section_categories ( category_id, sort_order ), home_section_products ( product_id, sort_order )",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const sections = (data ?? []) as unknown as SectionRow[];
  const out: ResolvedHomeSection[] = [];

  for (const s of sections) {
    const base = {
      id: s.id,
      type: (s.type === "category" ? "category" : "product") as HomeSectionType,
      kicker: s.kicker ?? undefined,
      heading: s.heading ?? undefined,
      description: s.description ?? undefined,
      background: s.background ?? undefined,
      viewAllHref: (s.view_all_href ?? undefined) as Route | undefined,
      viewAllLabel: s.view_all_label ?? undefined,
      limit: s.item_limit ?? undefined,
    };

    if (base.type === "category") {
      const ids = orderIds(s.home_section_categories, "category_id");
      const tiles = await resolveCategoryTiles(supabase, ids);
      out.push({ ...base, tiles, products: [] });
    } else {
      const products =
        s.product_source === "categories"
          ? await resolveProductsByCategories(
              supabase,
              orderIds(s.home_section_categories, "category_id"),
              s.item_limit,
            )
          : await resolveManualProducts(
              supabase,
              orderIds(s.home_section_products, "product_id"),
            );
      out.push({ ...base, tiles: [], products });
    }
  }

  return out;
  },
  ["storefront-home-sections"],
  { tags: [CACHE_TAGS.sections, CACHE_TAGS.categories, CACHE_TAGS.products] },
);

// ────────────────────────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createAnonClient>;

async function resolveCategoryTiles(
  supabase: SupabaseClient,
  ids: string[],
): Promise<CategoryTile[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, image_url")
    .eq("published", true)
    .in("id", ids);

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const byId = new Map(
    (data ?? []).map((c) => [
      c.id as string,
      {
        id: c.id as string,
        name: c.name as string,
        href: `/category/${c.slug as string}` as Route,
        imageUrl: c.image_url ? r2PublicUrl(c.image_url as string) : undefined,
      } satisfies CategoryTile,
    ]),
  );

  // Preserve the admin-defined order; drop unpublished / missing.
  return ids.map((id) => byId.get(id)).filter(Boolean) as CategoryTile[];
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  images: string[] | null;
  price_paise: number | null;
  in_stock: boolean;
  options: unknown;
};

function toCard(p: ProductRow): NewArrivalCard {
  const key = p.images?.[0];
  return {
    id: p.id,
    name: p.name,
    href: `/products/${p.slug}` as Route,
    imageUrl: key ? r2PublicUrl(key) : undefined,
    pricePaise: p.price_paise,
    inStock: p.in_stock,
    colorVariants: extractColorVariants(p.options, r2PublicUrl),
  };
}

async function resolveManualProducts(
  supabase: SupabaseClient,
  ids: string[],
): Promise<NewArrivalCard[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, images, price_paise, in_stock, options")
    .eq("published", true)
    .in("id", ids);

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const byId = new Map(
    (data ?? []).map((p) => [p.id as string, toCard(p as ProductRow)]),
  );
  return ids.map((id) => byId.get(id)).filter(Boolean) as NewArrivalCard[];
}

async function resolveProductsByCategories(
  supabase: SupabaseClient,
  categoryIds: string[],
  limit: number | null,
): Promise<NewArrivalCard[]> {
  if (categoryIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, images, price_paise, in_stock, options, product_categories!inner ( category_id )",
    )
    .eq("published", true)
    .in("product_categories.category_id", categoryIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  // A product in several selected categories can appear more than once — dedupe.
  const seen = new Set<string>();
  const cards: NewArrivalCard[] = [];
  for (const p of (data ?? []) as unknown as ProductRow[]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    cards.push(toCard(p));
  }
  return limit != null ? cards.slice(0, limit) : cards;
}
