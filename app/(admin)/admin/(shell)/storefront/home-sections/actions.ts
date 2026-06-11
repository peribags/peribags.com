"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createSection,
  deleteSection,
  reorderSections,
  updateSection,
} from "@/lib/services/admin/home-sections.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  HomeSectionCreateInput,
  HomeSectionProductSource,
  HomeSectionType,
  HomeSectionUpdateInput,
} from "@/types";

export type SectionFormState = { error: string } | { ok: true } | undefined;

function revalidateSections() {
  updateTag(CACHE_TAGS.sections);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const t = String(v ?? "").trim();
  return t.length ? t : null;
}

function parseSection(form: FormData) {
  const type: HomeSectionType =
    String(form.get("type") ?? "product") === "category"
      ? "category"
      : "product";
  const productSource: HomeSectionProductSource =
    String(form.get("productSource") ?? "manual") === "categories"
      ? "categories"
      : "manual";

  const limitRaw = String(form.get("itemLimit") ?? "").trim();
  const limitNum = Number(limitRaw);
  const itemLimit =
    limitRaw && Number.isFinite(limitNum) && limitNum > 0
      ? Math.trunc(limitNum)
      : null;

  const allCategoryIds = form.getAll("categoryIds").map(String).filter(Boolean);
  const allProductIds = form.getAll("productIds").map(String).filter(Boolean);

  // Keep only the links that matter for the chosen type / source, so stale
  // selections from a hidden picker aren't persisted.
  const usesCategories =
    type === "category" || (type === "product" && productSource === "categories");
  const usesProducts = type === "product" && productSource === "manual";

  return {
    type,
    productSource,
    kicker: emptyToNull(form.get("kicker")),
    heading: emptyToNull(form.get("heading")),
    description: emptyToNull(form.get("description")),
    background: emptyToNull(form.get("background")),
    itemLimit,
    viewAllHref: emptyToNull(form.get("viewAllHref")),
    viewAllLabel: emptyToNull(form.get("viewAllLabel")),
    published: form.get("published") === "on",
    categoryIds: usesCategories ? allCategoryIds : [],
    productIds: usesProducts ? allProductIds : [],
  };
}

export async function createSectionAction(
  _prev: SectionFormState,
  formData: FormData,
): Promise<SectionFormState> {
  const f = parseSection(formData);
  const input: HomeSectionCreateInput = { ...f };

  try {
    await createSection(input);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to create section.",
    };
  }

  revalidateSections();
  redirect("/admin/storefront/home-sections?created=1");
}

export async function updateSectionAction(
  _prev: SectionFormState,
  formData: FormData,
): Promise<SectionFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing section id." };

  const f = parseSection(formData);
  const patch: HomeSectionUpdateInput = { ...f };

  try {
    await updateSection(id, patch);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to update section.",
    };
  }

  revalidateSections();
  redirect("/admin/storefront/home-sections?updated=1");
}

export async function deleteSectionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteSection(id);
  revalidateSections();
  redirect("/admin/storefront/home-sections?deleted=1");
}

/** Persist a drag-reordered list of section ids (top → bottom). */
export async function reorderSectionsAction(
  orderedIds: string[],
): Promise<{ ok: true } | { error: string }> {
  try {
    await reorderSections(orderedIds);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to reorder sections.",
    };
  }
  revalidateSections();
  return { ok: true };
}
