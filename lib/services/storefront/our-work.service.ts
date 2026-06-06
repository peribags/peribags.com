import "server-only";

import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { r2PublicUrl } from "@/lib/r2";
import { ServiceError } from "@/lib/services/shared/errors";

type Row = {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string;
  description: string;
  sort_order: number;
};

/** A resolved /our-work card, ready to render. */
export type PublishedOurWorkItem = {
  id: string;
  name: string;
  /** Resolved logo URL — null when none was uploaded. */
  logoUrl: string | null;
  /** Resolved product picture URL. */
  imageUrl: string;
  description: string;
};

/**
 * Published "Our Work" items, ordered for the storefront.
 * Cached indefinitely under the `our-work` tag; admin mutations call
 * `updateTag(CACHE_TAGS.ourWork)` to refresh.
 */
export const getPublishedOurWork = unstable_cache(
  async (): Promise<PublishedOurWorkItem[]> => {
    const supabase = createAnonClient();

    const { data, error } = await supabase
      .from("our_work_items")
      .select("id, name, logo_url, image_url, description, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new ServiceError(error.message, "DB_ERROR", error);

    const out: PublishedOurWorkItem[] = [];
    for (const r of (data ?? []) as unknown as Row[]) {
      if (!r.image_url) continue; // a card without a picture can't render
      out.push({
        id: r.id,
        name: r.name,
        logoUrl: r.logo_url ? resolveOrPassthrough(r.logo_url) : null,
        imageUrl: resolveOrPassthrough(r.image_url),
        description: r.description ?? "",
      });
    }
    return out;
  },
  ["storefront-our-work"],
  { tags: [CACHE_TAGS.ourWork] },
);

/**
 * R2 keys are stored as plain paths (e.g. "our-work/abc.webp"). For
 * convenience we also accept a fully-qualified URL — the resolver leaves
 * absolute URLs untouched so existing seed entries keep working.
 */
function resolveOrPassthrough(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return r2PublicUrl(v);
}
