"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createReel,
  deleteReel,
  reorderReels,
  updateReel,
  updateReelsConfig,
} from "@/lib/services/admin/home-reels.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type { HomeReelCreateInput, HomeReelUpdateInput } from "@/types";

export type ReelFormState = { error: string } | { ok: true } | undefined;

function revalidateReels() {
  // Admin list re-renders via path; the cached storefront read refreshes via tag.
  revalidatePath("/admin/storefront/reels");
  updateTag(CACHE_TAGS.reels);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const t = String(v ?? "").trim();
  return t.length ? t : null;
}

function parseReel(form: FormData) {
  const sortOrderRaw = String(form.get("sortOrder") ?? "").trim();
  const sortOrder = sortOrderRaw && Number.isFinite(Number(sortOrderRaw))
    ? Math.trunc(Number(sortOrderRaw))
    : undefined;

  return {
    videoUrl: emptyToNull(form.get("videoUrl")),
    posterUrl: emptyToNull(form.get("posterUrl")),
    title: emptyToNull(form.get("title")),
    caption: emptyToNull(form.get("caption")),
    promoHref: emptyToNull(form.get("promoHref")),
    promoLabel: emptyToNull(form.get("promoLabel")),
    sortOrder,
    published: form.get("published") === "on",
  };
}

export async function createReelAction(
  _prev: ReelFormState,
  formData: FormData,
): Promise<ReelFormState> {
  const f = parseReel(formData);
  const input: HomeReelCreateInput = { ...f };

  try {
    await createReel(input);
  } catch (err) {
    return {
      error: err instanceof ServiceError ? err.message : "Failed to create reel.",
    };
  }

  revalidateReels();
  redirect("/admin/storefront/reels?created=1");
}

export async function updateReelAction(
  _prev: ReelFormState,
  formData: FormData,
): Promise<ReelFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing reel id." };

  const f = parseReel(formData);
  const patch: HomeReelUpdateInput = {
    videoUrl: f.videoUrl,
    posterUrl: f.posterUrl,
    title: f.title,
    caption: f.caption,
    promoHref: f.promoHref,
    promoLabel: f.promoLabel,
    published: f.published,
  };

  try {
    await updateReel(id, patch);
  } catch (err) {
    return {
      error: err instanceof ServiceError ? err.message : "Failed to update reel.",
    };
  }

  revalidateReels();
  revalidatePath(`/admin/storefront/reels/${id}`);
  return { ok: true };
}

export async function deleteReelAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteReel(id);
  revalidateReels();
  redirect("/admin/storefront/reels?deleted=1");
}

export async function reorderReelsAction(
  orderedIds: string[],
): Promise<{ ok: true } | { error: string }> {
  try {
    await reorderReels(orderedIds);
  } catch (err) {
    return {
      error: err instanceof ServiceError ? err.message : "Failed to reorder reels.",
    };
  }
  revalidateReels();
  return { ok: true };
}

export type ReelsHeaderState = { error: string } | { ok: true } | undefined;

export async function updateReelsHeaderAction(
  _prev: ReelsHeaderState,
  formData: FormData,
): Promise<ReelsHeaderState> {
  try {
    await updateReelsConfig({
      kicker: emptyToNull(formData.get("kicker")),
      heading: emptyToNull(formData.get("heading")),
      description: emptyToNull(formData.get("description")),
    });
  } catch (err) {
    return {
      error: err instanceof ServiceError ? err.message : "Failed to save heading.",
    };
  }
  revalidateReels();
  return { ok: true };
}
