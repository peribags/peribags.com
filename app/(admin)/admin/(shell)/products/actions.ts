"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  uniqueProductSlug,
  updateProduct,
} from "@/lib/services/admin/products.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { slugify } from "@/lib/utils";
import type { ProductCreateInput, ProductUpdateInput } from "@/types";

export type ProductFormState =
  | { error: string }
  | { ok: true }
  | undefined;

function emptyToNull(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

type PriceParse =
  | { ok: true; paise: number | null }
  | { ok: false };

function parseRupeesToPaise(raw: string): PriceParse {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, paise: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, paise: Math.round(n * 100) };
}

function parseSpecs(form: FormData) {
  const labels = form.getAll("specsLabel").map((v) => String(v));
  const values = form.getAll("specsValue").map((v) => String(v));
  const len = Math.max(labels.length, values.length);
  const out: { label: string; value: string }[] = [];
  for (let i = 0; i < len; i++) {
    const label = (labels[i] ?? "").trim();
    const value = (values[i] ?? "").trim();
    if (!label && !value) continue;
    out.push({ label, value });
  }
  return out;
}

function parseFields(form: FormData) {
  const slug = String(form.get("slug") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const shortDescription = emptyToNull(
    String(form.get("shortDescription") ?? ""),
  );
  const description = String(form.get("description") ?? "");
  const priceRupees = String(form.get("priceRupees") ?? "");
  const metaTitle = emptyToNull(String(form.get("metaTitle") ?? ""));
  const metaDescription = emptyToNull(
    String(form.get("metaDescription") ?? ""),
  );
  const sortOrderRaw = String(form.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.isFinite(Number(sortOrderRaw))
    ? Math.trunc(Number(sortOrderRaw))
    : 0;
  const inStock = form.get("inStock") === "on";
  const published = form.get("published") === "on";
  const featured = form.get("featured") === "on";

  const images = form
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const categoryIds = form
    .getAll("categoryIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const specs = parseSpecs(form);

  return {
    slug,
    name,
    shortDescription,
    description,
    priceRupees,
    metaTitle,
    metaDescription,
    sortOrder,
    inStock,
    published,
    featured,
    images,
    categoryIds,
    specs,
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const f = parseFields(formData);
  if (!f.name) return { error: "Name is required." };

  const price = parseRupeesToPaise(f.priceRupees);
  if (!price.ok) {
    return { error: "Enter a valid price, or leave blank for 'Price on request'." };
  }

  const rawSlug = f.slug || slugify(f.name);
  if (!rawSlug) return { error: "Could not derive a slug from the name." };

  let slug: string;
  try {
    slug = await uniqueProductSlug(rawSlug);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to allocate slug.",
    };
  }

  const input: ProductCreateInput = {
    slug,
    name: f.name,
    shortDescription: f.shortDescription,
    description: f.description,
    pricePaise: price.paise,
    images: f.images,
    specs: f.specs,
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    inStock: f.inStock,
    published: f.published,
    featured: f.featured,
    sortOrder: f.sortOrder,
    categoryIds: f.categoryIds,
  };

  try {
    await createProduct(input);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to create product.",
    };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products?created=1");
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const f = parseFields(formData);
  if (!f.name) return { error: "Name is required." };

  const price = parseRupeesToPaise(f.priceRupees);
  if (!price.ok) {
    return { error: "Enter a valid price, or leave blank for 'Price on request'." };
  }

  const rawSlug = f.slug || slugify(f.name);
  if (!rawSlug) return { error: "Could not derive a slug from the name." };

  let slug: string;
  try {
    slug = await uniqueProductSlug(rawSlug, id);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to allocate slug.",
    };
  }

  const patch: ProductUpdateInput = {
    slug,
    name: f.name,
    shortDescription: f.shortDescription,
    description: f.description,
    pricePaise: price.paise,
    images: f.images,
    specs: f.specs,
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    inStock: f.inStock,
    published: f.published,
    featured: f.featured,
    sortOrder: f.sortOrder,
    categoryIds: f.categoryIds,
  };

  try {
    await updateProduct(id, patch);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to update product.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}
