import "server-only";

import type { Route } from "next";
import { createAnonClient } from "@/lib/supabase/anon";
import { type ColorVariants, extractColorVariants } from "@/lib/color-swatches";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";

// ─────────────────────────────────────────────────────────────────────────────
// Shapes
// ─────────────────────────────────────────────────────────────────────────────

export type ProductSpec = { label: string; value: string };

export type ProductDetailCategory = {
  id: string;
  slug: string;
  name: string;
};

export type ProductDetailOptionValue = {
  name: string;
  /** Resolved swatch image URL shown in the selector, when set. */
  swatchUrl: string | null;
};

/** An option group (Color, Size, …) with its selectable values. */
export type ProductDetailOption = {
  name: string;
  values: ProductDetailOptionValue[];
};

/** One combination of option values (Shopify-style), e.g. Red / S. */
export type ProductDetailVariant = {
  id: string;
  /** Value names aligned with `options` order, e.g. ["Red","S"]. */
  optionValues: string[];
  /** Display title, e.g. "Red / S". */
  title: string;
  sku: string | null;
  /** Null → inherits the product price. */
  pricePaise: number | null;
  /** Resolved image URLs. Empty → the product gallery is used. */
  gallery: string[];
  inStock: boolean;
};

/**
 * Full product detail used by the storefront product page. Sourced directly
 * from `products` + `product_categories` against the published-only RLS view.
 */
export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  href: Route;
  imageUrl: string;
  gallery: string[];
  /** Short hook shown under the title (from `products.short_description`). */
  shortDescription: string | null;
  /** Long-form description as raw HTML (authored in the admin rich-text editor). */
  description: string;
  /** Ordered `{label, value}` rows from `products.specs`. */
  specs: ProductSpec[];
  pricePaise: number | null;
  inStock: boolean;
  /** First published category (used for the kicker + breadcrumb). */
  category: ProductDetailCategory | null;
  /** All published category ids the product is linked to (used by related). */
  categoryIds: string[];
  /** Option group definitions (Color, Size, …). Empty = single option. */
  options: ProductDetailOption[];
  /** Generated combinations of the option values. */
  variants: ProductDetailVariant[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RelatedProduct = {
  id: string;
  slug: string;
  name: string;
  href: Route;
  imageUrl: string;
  inStock: boolean;
  pricePaise: number | null;
  colorVariants?: ColorVariants | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a published product by slug, joined to its categories. Uncached — hits DB every call.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = createAnonClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, short_description, description, price_paise, images,
       in_stock, specs, options, meta_title, meta_description, created_at, updated_at,
       product_categories ( categories ( id, slug, name, published, sort_order ) ),
       product_variants ( id, option_values, title, sku, price_paise, images, in_stock, sort_order )`,
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) return null;

  const row = data as unknown as ProductRow;

  const imageKeys = Array.isArray(row.images) ? row.images : [];
  const gallery = imageKeys.map((k) => r2PublicUrl(k));

  // Only carry over published categories.
  const linkedCategories: ProductDetailCategory[] = (row.product_categories ?? [])
    .map((pc) => pc.categories)
    .filter(
      (c): c is CategoryEmbed =>
        c != null && typeof c === "object" && c.published === true,
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name }));

  const options = normalizeOptionsJson(row.options);

  const variants: ProductDetailVariant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      optionValues: v.option_values ?? [],
      title: v.title,
      sku: v.sku,
      pricePaise: v.price_paise,
      gallery: (v.images ?? []).map((k) => r2PublicUrl(k)),
      inStock: !!v.in_stock,
    }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    href: `/products/${row.slug}` as Route,
    imageUrl: gallery[0] ?? "",
    gallery,
    shortDescription: row.short_description ?? null,
    description: (row.description ?? "").trim(),
    specs: normalizeSpecs(row.specs),
    pricePaise: row.price_paise,
    inStock: !!row.in_stock,
    category: linkedCategories[0] ?? null,
    categoryIds: linkedCategories.map((c) => c.id),
    options,
    variants,
    metaTitle: row.meta_title ?? null,
    metaDescription: row.meta_description ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Find related products — published, in any of the same categories, not the
 * current product itself. Deduped + ordered by sort then recency. Uncached.
 */
export async function getRelatedProducts(
  currentProductId: string,
  categoryIds: string[],
  limit = 4,
): Promise<RelatedProduct[]> {
  if (categoryIds.length === 0 || limit <= 0) return [];
  const supabase = createAnonClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, images, price_paise, in_stock, options, sort_order, created_at, product_categories!inner ( category_id )",
    )
    .eq("published", true)
    .neq("id", currentProductId)
    .in("product_categories.category_id", categoryIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    // overshoot to leave room for the dedupe pass when a product matches
    // more than one of the candidate categories
    .limit(limit * 4);

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const seen = new Set<string>();
  const out: RelatedProduct[] = [];
  for (const r of (data ?? []) as unknown as RelatedRow[]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    const key = r.images?.[0];
    out.push({
      id: r.id,
      slug: r.slug,
      name: r.name,
      href: `/products/${r.slug}` as Route,
      imageUrl: key ? r2PublicUrl(key) : "",
      inStock: !!r.in_stock,
      pricePaise: r.price_paise,
      colorVariants: extractColorVariants(r.options, r2PublicUrl),
    });
    if (out.length >= limit) break;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal types + helpers
// ─────────────────────────────────────────────────────────────────────────────

type CategoryEmbed = {
  id: string;
  slug: string;
  name: string;
  published: boolean;
  sort_order: number | null;
};

type VariantEmbed = {
  id: string;
  option_values: string[] | null;
  title: string;
  sku: string | null;
  price_paise: number | null;
  images: string[] | null;
  in_stock: boolean;
  sort_order: number;
};

/** Normalise the `products.options` jsonb, resolving swatch keys to URLs. */
function normalizeOptionsJson(raw: unknown): ProductDetailOption[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductDetailOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    if (!name) continue;
    const values: ProductDetailOptionValue[] = [];
    if (Array.isArray(obj.values)) {
      for (const v of obj.values) {
        if (!v || typeof v !== "object") continue;
        const vo = v as Record<string, unknown>;
        const vName = typeof vo.name === "string" ? vo.name.trim() : "";
        if (!vName) continue;
        const swatch =
          typeof vo.swatch_image === "string" && vo.swatch_image.trim()
            ? vo.swatch_image.trim()
            : null;
        values.push({
          name: vName,
          swatchUrl: swatch ? r2PublicUrl(swatch) : null,
        });
      }
    }
    if (values.length > 0) out.push({ name, values });
  }
  return out;
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string;
  price_paise: number | null;
  images: string[] | null;
  in_stock: boolean;
  specs: unknown;
  options: unknown;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  product_categories: { categories: CategoryEmbed | null }[] | null;
  product_variants: VariantEmbed[] | null;
};

type RelatedRow = {
  id: string;
  slug: string;
  name: string;
  images: string[] | null;
  price_paise: number | null;
  in_stock: boolean;
  options: unknown;
};

/**
 * Strip HTML tags + decode common entities for plain-text contexts (meta
 * descriptions, JSON-LD, OG card text).
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpecs(raw: unknown): ProductSpec[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductSpec[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const label = typeof obj.label === "string" ? obj.label.trim() : "";
    const value = typeof obj.value === "string" ? obj.value.trim() : "";
    if (!label && !value) continue;
    out.push({ label, value });
  }
  return out;
}
