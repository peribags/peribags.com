import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  BannerMediaType,
  HomeBannerConfig,
  HomeBannerSlide,
  HomeBannerSlideCreateInput,
  HomeBannerSlideUpdateInput,
} from "@/types";

type SlideRow = {
  id: string;
  media_type: string;
  media_url: string | null;
  mobile_media_type: string | null;
  mobile_media_url: string | null;
  alt: string | null;
  kicker: string | null;
  heading: string | null;
  description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function normalizeMediaType(raw: string): BannerMediaType {
  return raw === "video" ? "video" : "image";
}

function fromRow(row: SlideRow): HomeBannerSlide {
  return {
    id: row.id,
    mediaType: normalizeMediaType(row.media_type),
    mediaUrl: row.media_url,
    mobileMediaType: row.mobile_media_type
      ? normalizeMediaType(row.mobile_media_type)
      : null,
    mobileMediaUrl: row.mobile_media_url,
    alt: row.alt,
    kicker: row.kicker,
    heading: row.heading,
    description: row.description,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(
  input: HomeBannerSlideCreateInput | HomeBannerSlideUpdateInput,
) {
  const row: Record<string, unknown> = {};
  if (input.mediaType !== undefined) row.media_type = input.mediaType;
  if (input.mediaUrl !== undefined) row.media_url = input.mediaUrl;
  if (input.mobileMediaType !== undefined)
    row.mobile_media_type = input.mobileMediaType;
  if (input.mobileMediaUrl !== undefined)
    row.mobile_media_url = input.mobileMediaUrl;
  if (input.alt !== undefined) row.alt = input.alt;
  if (input.kicker !== undefined) row.kicker = input.kicker;
  if (input.heading !== undefined) row.heading = input.heading;
  if (input.description !== undefined) row.description = input.description;
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) row.cta_href = input.ctaHref;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  return row;
}

// ────────────────────────────────────────────────────────────────────────────
// Config (singleton)
// ────────────────────────────────────────────────────────────────────────────

export async function getBannerConfig(): Promise<HomeBannerConfig> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_banner")
    .select("height_desktop, height_mobile, updated_at")
    .eq("id", true)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    heightDesktop: data?.height_desktop ?? null,
    heightMobile: data?.height_mobile ?? null,
    updatedAt: data?.updated_at ?? null,
  };
}

export async function updateBannerConfig(input: {
  heightDesktop: string | null;
  heightMobile: string | null;
}): Promise<HomeBannerConfig> {
  await requireAdmin();
  const supabase = await createClient();

  // Upsert keeps things robust even if the seed row is missing.
  const { data, error } = await supabase
    .from("home_banner")
    .upsert(
      {
        id: true,
        height_desktop: input.heightDesktop,
        height_mobile: input.heightMobile,
      },
      { onConflict: "id" },
    )
    .select("height_desktop, height_mobile, updated_at")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    heightDesktop: data.height_desktop ?? null,
    heightMobile: data.height_mobile ?? null,
    updatedAt: data.updated_at ?? null,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Slides CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function listBannerSlides(): Promise<HomeBannerSlide[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_banner_slides")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return (data ?? []).map((r) => fromRow(r as unknown as SlideRow));
}

export async function getBannerSlide(id: string): Promise<HomeBannerSlide> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_banner_slides")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Slide not found", "NOT_FOUND");
  return fromRow(data as unknown as SlideRow);
}

export async function createBannerSlide(
  input: HomeBannerSlideCreateInput,
): Promise<HomeBannerSlide> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_banner_slides")
    .insert(toRow(input))
    .select("*")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return fromRow(data as unknown as SlideRow);
}

export async function updateBannerSlide(
  id: string,
  patch: HomeBannerSlideUpdateInput,
): Promise<HomeBannerSlide> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_banner_slides")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Slide not found", "NOT_FOUND");
  return fromRow(data as unknown as SlideRow);
}

export async function deleteBannerSlide(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("home_banner_slides")
    .delete()
    .eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}
