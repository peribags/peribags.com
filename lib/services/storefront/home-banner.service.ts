import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/lib/services/shared/errors";
import type { BannerMediaType, HomeBannerSlide } from "@/types";

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

const asMediaType = (raw: string | null): BannerMediaType | null =>
  raw == null ? null : raw === "video" ? "video" : "image";

function fromRow(row: SlideRow): HomeBannerSlide {
  return {
    id: row.id,
    mediaType: (row.media_type === "video" ? "video" : "image") as BannerMediaType,
    mediaUrl: row.media_url,
    mobileMediaType: asMediaType(row.mobile_media_type),
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

export type PublishedHomeBanner = {
  slides: HomeBannerSlide[];
  /** CSS height values, or null to use the storefront default. */
  heightDesktop: string | null;
  heightMobile: string | null;
};

/**
 * Published banner slides + the configured banner height, for the storefront.
 * Runs as the anon role under the `*_public_read` RLS policies.
 */
export async function getPublishedHomeBanner(): Promise<PublishedHomeBanner> {
  const supabase = await createClient();

  const [slidesRes, configRes] = await Promise.all([
    supabase
      .from("home_banner_slides")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("home_banner")
      .select("height_desktop, height_mobile")
      .eq("id", true)
      .maybeSingle(),
  ]);

  if (slidesRes.error) {
    throw new ServiceError(slidesRes.error.message, "DB_ERROR", slidesRes.error);
  }
  if (configRes.error) {
    throw new ServiceError(configRes.error.message, "DB_ERROR", configRes.error);
  }

  return {
    slides: (slidesRes.data ?? []).map((r) => fromRow(r as unknown as SlideRow)),
    heightDesktop: configRes.data?.height_desktop ?? null,
    heightMobile: configRes.data?.height_mobile ?? null,
  };
}
