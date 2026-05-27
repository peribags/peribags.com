import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import {
  rangeFor,
  type Page,
  type Pagination,
} from "@/lib/services/shared/pagination";
import type {
  Product,
  ProductCreateInput,
  ProductSpec,
  ProductUpdateInput,
} from "@/types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string;
  price_paise: number | null;
  images: string[];
  specs: unknown;
  meta_title: string | null;
  meta_description: string | null;
  in_stock: boolean;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_categories?: { category_id: string }[] | null;
};

const SELECT_WITH_CATEGORIES =
  "*, product_categories ( category_id )";

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

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    pricePaise: row.price_paise,
    images: row.images ?? [],
    specs: normalizeSpecs(row.specs),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    inStock: row.in_stock,
    published: row.published,
    featured: row.featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryIds: (row.product_categories ?? []).map((pc) => pc.category_id),
  };
}

function toRow(input: ProductCreateInput | ProductUpdateInput) {
  const row: Record<string, unknown> = {};
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.name !== undefined) row.name = input.name;
  if (input.shortDescription !== undefined)
    row.short_description = input.shortDescription;
  if (input.description !== undefined) row.description = input.description;
  if (input.pricePaise !== undefined) row.price_paise = input.pricePaise;
  if (input.images !== undefined) row.images = input.images;
  if (input.specs !== undefined) row.specs = normalizeSpecs(input.specs);
  if (input.metaTitle !== undefined) row.meta_title = input.metaTitle;
  if (input.metaDescription !== undefined)
    row.meta_description = input.metaDescription;
  if (input.inStock !== undefined) row.in_stock = input.inStock;
  if (input.published !== undefined) row.published = input.published;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  return row;
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function listProducts(pagination?: Pagination): Promise<Page<Product>> {
  await requireAdmin();
  const supabase = await createClient();
  const p = pagination ?? { page: 1, pageSize: 50 };
  const { from, to } = rangeFor(p);

  const { data, error, count } = await supabase
    .from("products")
    .select(SELECT_WITH_CATEGORIES, { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    rows: (data ?? []).map((r) => fromRow(r as unknown as ProductRow)),
    total: count ?? 0,
    page: p.page,
    pageSize: p.pageSize,
  };
}

export async function getProduct(id: string): Promise<Product> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(SELECT_WITH_CATEGORIES)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Product not found", "NOT_FOUND");
  return fromRow(data as unknown as ProductRow);
}

export async function createProduct(
  input: ProductCreateInput,
): Promise<Product> {
  await requireAdmin();
  if (!input.slug || !input.name) {
    throw new ServiceError("slug and name are required", "VALIDATION");
  }
  if (input.pricePaise != null && input.pricePaise < 0) {
    throw new ServiceError("Price cannot be negative", "VALIDATION");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert(toRow(input))
    .select(SELECT_WITH_CATEGORIES)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ServiceError("A product with this slug already exists", "CONFLICT", error);
    }
    throw new ServiceError(error.message, "DB_ERROR", error);
  }

  if (input.categoryIds && input.categoryIds.length > 0) {
    await syncProductCategories(data.id, input.categoryIds);
    return getProduct(data.id);
  }

  return fromRow(data as unknown as ProductRow);
}

export async function updateProduct(
  id: string,
  patch: ProductUpdateInput,
): Promise<Product> {
  await requireAdmin();
  const supabase = await createClient();

  const row = toRow(patch);
  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        throw new ServiceError(
          "A product with this slug already exists",
          "CONFLICT",
          error,
        );
      }
      throw new ServiceError(error.message, "DB_ERROR", error);
    }
  }

  if (patch.categoryIds !== undefined) {
    await syncProductCategories(id, patch.categoryIds);
  }

  return getProduct(id);
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}

/**
 * Find the next available slug; tries `base`, then `base-2`, `base-3`, …
 * Pass `excludeId` to ignore the row being updated.
 */
export async function uniqueProductSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  await requireAdmin();
  const supabase = await createClient();

  let candidate = base;
  let n = 1;
  while (n < 200) {
    let q = supabase.from("products").select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data, error } = await q.limit(1);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
  throw new ServiceError("Could not generate a unique slug", "CONFLICT");
}

/**
 * Replace the product's category set. Inserts missing links, deletes
 * removed ones. Idempotent.
 */
async function syncProductCategories(
  productId: string,
  categoryIds: string[],
): Promise<void> {
  const supabase = await createClient();

  const desired = new Set(categoryIds);

  const { data: existing, error: fetchErr } = await supabase
    .from("product_categories")
    .select("category_id")
    .eq("product_id", productId);
  if (fetchErr) throw new ServiceError(fetchErr.message, "DB_ERROR", fetchErr);

  const have = new Set((existing ?? []).map((r) => r.category_id as string));

  const toInsert = [...desired].filter((id) => !have.has(id));
  const toDelete = [...have].filter((id) => !desired.has(id));

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("product_categories")
      .insert(
        toInsert.map((category_id) => ({ product_id: productId, category_id })),
      );
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  }
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId)
      .in("category_id", toDelete);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  }
}
