import "server-only";

import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";

type ReelRow = {
  id: string;
  video_url: string | null;
  poster_url: string | null;
  title: string | null;
  caption: string | null;
  promo_href: string | null;
  promo_label: string | null;
  sort_order: number;
  published: boolean;
};

/** A reel resolved for rendering (media URLs already public). */
export type ResolvedReel = {
  id: string;
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  caption?: string;
  promoHref?: string;
  promoLabel?: string;
};

export type PublishedReels = {
  kicker?: string;
  heading?: string;
  description?: string;
  reels: ResolvedReel[];
};

/**
 * Published reels + section heading config, for the storefront.
 * Cached indefinitely under the `home-reels` tag.
 */
export const getPublishedReels = unstable_cache(
  async (): Promise<PublishedReels> => {
    const supabase = createAnonClient();

  const [itemsRes, configRes] = await Promise.all([
    supabase
      .from("home_reels_items")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("home_reels")
      .select("kicker, heading, description")
      .eq("id", true)
      .maybeSingle(),
  ]);

  if (itemsRes.error) {
    throw new ServiceError(itemsRes.error.message, "DB_ERROR", itemsRes.error);
  }
  if (configRes.error) {
    throw new ServiceError(configRes.error.message, "DB_ERROR", configRes.error);
  }

  const reels: ResolvedReel[] = [];
  for (const r of (itemsRes.data ?? []) as unknown as ReelRow[]) {
    if (!r.video_url) continue; // a reel without a video can't render
    reels.push({
      id: r.id,
      videoUrl: r2PublicUrl(r.video_url),
      posterUrl: r.poster_url ? r2PublicUrl(r.poster_url) : undefined,
      title: r.title ?? undefined,
      caption: r.caption ?? undefined,
      promoHref: r.promo_href ?? undefined,
      promoLabel: r.promo_label ?? undefined,
    });
  }

  return {
    kicker: configRes.data?.kicker ?? undefined,
    heading: configRes.data?.heading ?? undefined,
    description: configRes.data?.description ?? undefined,
    reels,
  };
  },
  ["storefront-home-reels"],
  { tags: [CACHE_TAGS.reels] },
);
