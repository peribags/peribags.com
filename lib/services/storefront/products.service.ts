import "server-only";

import type { Route } from "next";
import { createAnonClient } from "@/lib/supabase/anon";
import { extractColorVariants } from "@/lib/color-swatches";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";
import type { CatalogueProduct } from "@/lib/catalogue";

// ─────────────────────────────────────────────────────────────────────────────
// Shapes returned to the storefront category page
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryListingCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  imageUrl: string | null;
};

export type SubcategoryRef = {
  id: string;
  slug: string;
  name: string;
};

export type CategoryListingData = {
  category: CategoryListingCategory;
  /** Direct child categories of `category` — used to populate the subcategory filter. */
  subcategories: SubcategoryRef[];
  /** All published products in `category` and its direct children, deduped. */
  products: CatalogueProduct[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a category by slug along with its direct child categories and every
 * published product reachable from either. Returns `null` when the category
 * doesn't exist (or isn't published). Uncached — hits DB every call.
 */
export async function getCategoryListingData(
  slug: string,
): Promise<CategoryListingData | null> {
  const supabase = createAnonClient();

  // 1. Locate the category.
  const { data: catRow, error: catErr } = await supabase
    .from("categories")
    .select(
      "id, slug, name, description, image_url, meta_title, meta_description",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (catErr) throw new ServiceError(catErr.message, "DB_ERROR", catErr);
  if (!catRow) return null;

  const category: CategoryListingCategory = {
    id: catRow.id as string,
    slug: catRow.slug as string,
    name: catRow.name as string,
    description: (catRow.description as string | null) ?? null,
    metaTitle: (catRow.meta_title as string | null) ?? null,
    metaDescription: (catRow.meta_description as string | null) ?? null,
    imageUrl: catRow.image_url
      ? r2PublicUrl(catRow.image_url as string)
      : null,
  };

  // 2. Direct child categories.
  const { data: childRows, error: childErr } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("parent_id", category.id)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (childErr) throw new ServiceError(childErr.message, "DB_ERROR", childErr);

  const subcategories: SubcategoryRef[] = (childRows ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    name: c.name as string,
  }));

  // 3. Discover every product id mapped to this category or any direct child.
  const reachableCategoryIds = [
    category.id,
    ...subcategories.map((s) => s.id),
  ];
  const { data: linkRows, error: linkErr } = await supabase
    .from("product_categories")
    .select("product_id")
    .in("category_id", reachableCategoryIds);
  if (linkErr) throw new ServiceError(linkErr.message, "DB_ERROR", linkErr);

  const productIds = Array.from(
    new Set((linkRows ?? []).map((l) => l.product_id as string)),
  );
  if (productIds.length === 0) {
    return { category, subcategories, products: [] };
  }

  // 4. Fetch the actual products + every category link they carry, so the
  //    filter UI can know which (current-page) child slugs each product
  //    belongs to.
  const { data: prodRows, error: prodErr } = await supabase
    .from("products")
    .select(
      "id, slug, name, images, price_paise, in_stock, specs, options, sort_order, created_at, product_categories ( category_id )",
    )
    .eq("published", true)
    .in("id", productIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (prodErr) throw new ServiceError(prodErr.message, "DB_ERROR", prodErr);

  const childIdToSlug = new Map<string, string>();
  for (const c of subcategories) childIdToSlug.set(c.id, c.slug);

  const products: CatalogueProduct[] = (prodRows ?? []).map((row) => {
    const r = row as ProductRowWithLinks;
    const heroKey = r.images?.[0];
    const subcategorySlugs = (r.product_categories ?? [])
      .map((pc) => childIdToSlug.get(pc.category_id))
      .filter((s): s is string => s != null);

    return {
      id: r.id,
      name: r.name,
      href: `/products/${r.slug}` as Route,
      imageUrl: heroKey ? r2PublicUrl(heroKey) : "",
      pricePaise: r.price_paise,
      inStock: r.in_stock,
      subcategorySlugs: Array.from(new Set(subcategorySlugs)),
      specifications: normalizeSpecs(r.specs),
      colorVariants: extractColorVariants(r.options, r2PublicUrl),
    };
  });

  return { category, subcategories, products };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

type ProductRowWithLinks = {
  id: string;
  slug: string;
  name: string;
  images: string[] | null;
  price_paise: number | null;
  in_stock: boolean;
  specs: unknown;
  options: unknown;
  product_categories: { category_id: string }[] | null;
};

/**
 * Convert the DB's `specs` JSONB (an ordered array of `{label, value}` rows)
 * into the shape the filter UI consumes: `Record<label, value[]>`. Duplicate
 * values are collapsed; empty rows are dropped.
 */
function normalizeSpecs(raw: unknown): Record<string, string[]> {
  if (!Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const label = typeof obj.label === "string" ? obj.label.trim() : "";
    const value = typeof obj.value === "string" ? obj.value.trim() : "";
    if (!label || !value) continue;
    if (!out[label]) out[label] = [];
    if (!out[label].includes(value)) out[label].push(value);
  }
  return out;
}
