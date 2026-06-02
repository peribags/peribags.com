import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  HomeReel,
  HomeReelCreateInput,
  HomeReelsConfig,
  HomeReelUpdateInput,
} from "@/types";

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
  created_at: string;
  updated_at: string;
};

function fromRow(row: ReelRow): HomeReel {
  return {
    id: row.id,
    videoUrl: row.video_url,
    posterUrl: row.poster_url,
    title: row.title,
    caption: row.caption,
    promoHref: row.promo_href,
    promoLabel: row.promo_label,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: HomeReelCreateInput | HomeReelUpdateInput) {
  const row: Record<string, unknown> = {};
  if (input.videoUrl !== undefined) row.video_url = input.videoUrl;
  if (input.posterUrl !== undefined) row.poster_url = input.posterUrl;
  if (input.title !== undefined) row.title = input.title;
  if (input.caption !== undefined) row.caption = input.caption;
  if (input.promoHref !== undefined) row.promo_href = input.promoHref;
  if (input.promoLabel !== undefined) row.promo_label = input.promoLabel;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  return row;
}

// ────────────────────────────────────────────────────────────────────────────
// Config (singleton)
// ────────────────────────────────────────────────────────────────────────────

export async function getReelsConfig(): Promise<HomeReelsConfig> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_reels")
    .select("kicker, heading, description, updated_at")
    .eq("id", true)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    kicker: data?.kicker ?? null,
    heading: data?.heading ?? null,
    description: data?.description ?? null,
    updatedAt: data?.updated_at ?? null,
  };
}

export async function updateReelsConfig(input: {
  kicker: string | null;
  heading: string | null;
  description: string | null;
}): Promise<HomeReelsConfig> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_reels")
    .upsert(
      {
        id: true,
        kicker: input.kicker,
        heading: input.heading,
        description: input.description,
      },
      { onConflict: "id" },
    )
    .select("kicker, heading, description, updated_at")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    kicker: data.kicker ?? null,
    heading: data.heading ?? null,
    description: data.description ?? null,
    updatedAt: data.updated_at ?? null,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Items CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function listReels(): Promise<HomeReel[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_reels_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return (data ?? []).map((r) => fromRow(r as unknown as ReelRow));
}

export async function getReel(id: string): Promise<HomeReel> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_reels_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Reel not found", "NOT_FOUND");
  return fromRow(data as unknown as ReelRow);
}

export async function createReel(
  input: HomeReelCreateInput,
): Promise<HomeReel> {
  await requireAdmin();
  const supabase = await createClient();

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const { data: last } = await supabase
      .from("home_reels_items")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("home_reels_items")
    .insert(toRow({ ...input, sortOrder }))
    .select("*")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return fromRow(data as unknown as ReelRow);
}

export async function updateReel(
  id: string,
  patch: HomeReelUpdateInput,
): Promise<HomeReel> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_reels_items")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Reel not found", "NOT_FOUND");
  return fromRow(data as unknown as ReelRow);
}

export async function deleteReel(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("home_reels_items")
    .delete()
    .eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}

/** Persist a new order. `orderedIds` is the full list of reel ids, in order. */
export async function reorderReels(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("home_reels_items")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  }
}
