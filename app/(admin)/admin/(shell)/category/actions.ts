"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCategory,
  deleteCategory,
  uniqueSiblingSlug,
  updateCategory,
} from "@/lib/services/admin/categories.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { slugify } from "@/lib/utils";
import type { CategoryCreateInput, CategoryUpdateInput } from "@/types";

export type CategoryFormState =
  | { error: string }
  | { ok: true }
  | undefined;

function emptyToNull(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

function parseFields(form: FormData) {
  const slug = String(form.get("slug") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const parentRaw = String(form.get("parentId") ?? "").trim();
  const description = emptyToNull(String(form.get("description") ?? ""));
  const imageUrl = emptyToNull(String(form.get("imageUrl") ?? ""));
  const metaTitle = emptyToNull(String(form.get("metaTitle") ?? ""));
  const metaDescription = emptyToNull(
    String(form.get("metaDescription") ?? ""),
  );
  const sortOrderRaw = String(form.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.isFinite(Number(sortOrderRaw))
    ? Math.trunc(Number(sortOrderRaw))
    : 0;
  const published = form.get("published") === "on";

  return {
    slug,
    name,
    parentId: parentRaw ? parentRaw : null,
    description,
    imageUrl,
    metaTitle,
    metaDescription,
    sortOrder,
    published,
  };
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const f = parseFields(formData);
  if (!f.name) return { error: "Name is required." };

  // Auto-derive slug from name when blank, then ensure sibling-uniqueness.
  const rawSlug = f.slug || slugify(f.name);
  if (!rawSlug) return { error: "Could not derive a slug from the name." };

  let slug: string;
  try {
    slug = await uniqueSiblingSlug(rawSlug, f.parentId);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to allocate slug.",
    };
  }

  const input: CategoryCreateInput = {
    parentId: f.parentId,
    slug,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl,
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    sortOrder: f.sortOrder,
    published: f.published,
  };

  try {
    await createCategory(input);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to create category.",
    };
  }

  revalidatePath("/admin/category");
  redirect("/admin/category?created=1");
}

export async function updateCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing category id." };

  const f = parseFields(formData);
  if (!f.name) return { error: "Name is required." };

  const rawSlug = f.slug || slugify(f.name);
  if (!rawSlug) return { error: "Could not derive a slug from the name." };

  let slug: string;
  try {
    slug = await uniqueSiblingSlug(rawSlug, f.parentId, id);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to allocate slug.",
    };
  }

  const patch: CategoryUpdateInput = {
    parentId: f.parentId,
    slug,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl,
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
    sortOrder: f.sortOrder,
    published: f.published,
  };

  try {
    await updateCategory(id, patch);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to update category.",
    };
  }

  revalidatePath("/admin/category");
  revalidatePath(`/admin/category/${id}`);
  return { ok: true };
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/admin/category");
  redirect("/admin/category?deleted=1");
}
