import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createAnonClient } from "@/lib/supabase/anon";
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
 *
 * Data-layer cache. The page stays `force-dynamic` so the route is never
 * cached; this only caches the Supabase function result. `updateTag` from
 * admin save marks the data stale; next render refetches. No
 * `revalidatePath` for any storefront route.
 *
 * Now safe to cache because the header has no fixed/transparent state to
 * lose — it's a plain solid white element in normal document flow.
 */
export const getPublishedHomeBanner = unstable_cache(
  async (): Promise<PublishedHomeBanner> => {
    const supabase = createAnonClient();

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
      throw new ServiceError(
        slidesRes.error.message,
        "DB_ERROR",
        slidesRes.error,
      );
    }
    if (configRes.error) {
      throw new ServiceError(
        configRes.error.message,
        "DB_ERROR",
        configRes.error,
      );
    }

    return {
      slides: (slidesRes.data ?? []).map((r) =>
        fromRow(r as unknown as SlideRow),
      ),
      heightDesktop: configRes.data?.height_desktop ?? null,
      heightMobile: configRes.data?.height_mobile ?? null,
    };
  },
  ["storefront-home-banner"],
  { tags: [CACHE_TAGS.banner] },
);
