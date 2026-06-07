"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createBannerSlide,
  deleteBannerSlide,
  updateBannerConfig,
  updateBannerSlide,
} from "@/lib/services/admin/home-banner.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  BannerMediaType,
  HomeBannerSlideCreateInput,
  HomeBannerSlideUpdateInput,
} from "@/types";

export type BannerFormState = { error: string } | { ok: true } | undefined;

function revalidateBanner() {
  // Invalidate ONLY the data-cache tag. The page route stays `force-dynamic`
  // so it renders fresh per request; this call just tells the cached
  // `getPublishedHomeBanner()` to refetch from Supabase on the next render.
  //
  // CRITICAL: never call `revalidatePath("/", "layout")` or any storefront
  // path revalidation here. That triggers Next.js's ISR regeneration code
  // path on Vercel, which is the one that broke the storefront header
  // (lost `position: fixed`). `updateTag` alone is the safe call.
  updateTag(CACHE_TAGS.banner);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const t = String(v ?? "").trim();
  return t.length ? t : null;
}

function toMediaType(v: FormDataEntryValue | null): BannerMediaType {
  return String(v ?? "") === "video" ? "video" : "image";
}

function parseSlide(form: FormData) {
  const mediaUrl = emptyToNull(form.get("mediaUrl"));
  const mobileMediaUrl = emptyToNull(form.get("mobileMediaUrl"));

  const sortOrderRaw = String(form.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.isFinite(Number(sortOrderRaw))
    ? Math.trunc(Number(sortOrderRaw))
    : 0;

  return {
    mediaType: toMediaType(form.get("mediaType")),
    mediaUrl,
    // The mobile media type only matters when a mobile media is set.
    mobileMediaType: mobileMediaUrl ? toMediaType(form.get("mobileMediaType")) : null,
    mobileMediaUrl,
    alt: emptyToNull(form.get("alt")),
    kicker: emptyToNull(form.get("kicker")),
    heading: emptyToNull(form.get("heading")),
    description: emptyToNull(form.get("description")),
    ctaLabel: emptyToNull(form.get("ctaLabel")),
    ctaHref: emptyToNull(form.get("ctaHref")),
    sortOrder,
    published: form.get("published") === "on",
  };
}

export async function createBannerSlideAction(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const f = parseSlide(formData);

  const input: HomeBannerSlideCreateInput = { ...f };

  try {
    await createBannerSlide(input);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to create slide.",
    };
  }

  revalidateBanner();
  redirect("/admin/storefront/home-banner?created=1");
}

export async function updateBannerSlideAction(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing slide id." };

  const f = parseSlide(formData);
  const patch: HomeBannerSlideUpdateInput = { ...f };

  try {
    await updateBannerSlide(id, patch);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to update slide.",
    };
  }

  revalidateBanner();
  return { ok: true };
}

export async function deleteBannerSlideAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteBannerSlide(id);
  revalidateBanner();
  redirect("/admin/storefront/home-banner?deleted=1");
}

export type HeightFormState = { error: string } | { ok: true } | undefined;

const ALLOWED_HEIGHT_UNITS = ["px", "vh", "svh", "rem"];

/** Combine a number + unit into a CSS value, or null when blank. Returns
 * `false` when the value is present but invalid. */
function buildHeight(
  value: string,
  unit: string,
): string | null | false {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return false;
  const safeUnit = ALLOWED_HEIGHT_UNITS.includes(unit) ? unit : "vh";
  return `${Math.trunc(n)}${safeUnit}`;
}

export async function updateBannerHeightAction(
  _prev: HeightFormState,
  formData: FormData,
): Promise<HeightFormState> {
  const desktop = buildHeight(
    String(formData.get("heightDesktopValue") ?? ""),
    String(formData.get("heightDesktopUnit") ?? "vh"),
  );
  const mobile = buildHeight(
    String(formData.get("heightMobileValue") ?? ""),
    String(formData.get("heightMobileUnit") ?? "vh"),
  );

  if (desktop === false) {
    return { error: "Desktop height must be a positive number." };
  }
  if (mobile === false) {
    return { error: "Mobile height must be a positive number." };
  }

  try {
    await updateBannerConfig({ heightDesktop: desktop, heightMobile: mobile });
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to save height.",
    };
  }

  revalidateBanner();
  return { ok: true };
}
