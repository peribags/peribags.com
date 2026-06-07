"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createOurWork,
  deleteOurWork,
  updateOurWork,
} from "@/lib/services/admin/our-work.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type { OurWorkCreateInput, OurWorkUpdateInput } from "@/types";

export type OurWorkFormState = { error: string } | { ok: true } | undefined;

function revalidateOurWork() {
  updateTag(CACHE_TAGS.ourWork);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const t = String(v ?? "").trim();
  return t.length ? t : null;
}

function parseForm(form: FormData) {
  const sortOrderRaw = String(form.get("sortOrder") ?? "").trim();
  const sortOrder =
    sortOrderRaw && Number.isFinite(Number(sortOrderRaw))
      ? Math.trunc(Number(sortOrderRaw))
      : undefined;

  return {
    name: String(form.get("name") ?? "").trim(),
    logoUrl: emptyToNull(form.get("logoUrl")),
    imageUrl: String(form.get("imageUrl") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    sortOrder,
    published: form.get("published") === "on",
  };
}

export async function createOurWorkAction(
  _prev: OurWorkFormState,
  formData: FormData,
): Promise<OurWorkFormState> {
  const f = parseForm(formData);

  if (!f.name) return { error: "Name is required." };
  if (!f.imageUrl) return { error: "Product picture is required." };

  const input: OurWorkCreateInput = {
    name: f.name,
    logoUrl: f.logoUrl,
    imageUrl: f.imageUrl,
    description: f.description,
    sortOrder: f.sortOrder,
    published: f.published,
  };

  try {
    await createOurWork(input);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to create item.",
    };
  }

  revalidateOurWork();
  redirect("/admin/storefront/our-work?created=1");
}

export async function updateOurWorkAction(
  _prev: OurWorkFormState,
  formData: FormData,
): Promise<OurWorkFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing item id." };

  const f = parseForm(formData);
  if (!f.name) return { error: "Name is required." };
  if (!f.imageUrl) return { error: "Product picture is required." };

  const patch: OurWorkUpdateInput = {
    name: f.name,
    logoUrl: f.logoUrl,
    imageUrl: f.imageUrl,
    description: f.description,
    published: f.published,
  };

  try {
    await updateOurWork(id, patch);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to update item.",
    };
  }

  revalidateOurWork();
  return { ok: true };
}

export async function deleteOurWorkAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteOurWork(id);
  revalidateOurWork();
  redirect("/admin/storefront/our-work?deleted=1");
}
