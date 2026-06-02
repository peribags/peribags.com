import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  HomeSection,
  HomeSectionCreateInput,
  HomeSectionProductSource,
  HomeSectionType,
  HomeSectionUpdateInput,
} from "@/types";

type SectionRow = {
  id: string;
  type: string;
  kicker: string | null;
  heading: string | null;
  description: string | null;
  background: string | null;
  product_source: string;
  item_limit: number | null;
  view_all_href: string | null;
  view_all_label: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  home_section_categories?: { category_id: string; sort_order: number }[] | null;
  home_section_products?: { product_id: string; sort_order: number }[] | null;
};

const SELECT_WITH_LINKS =
  "*, home_section_categories ( category_id, sort_order ), home_section_products ( product_id, sort_order )";

function asType(raw: string): HomeSectionType {
  return raw === "category" ? "category" : "product";
}

function asSource(raw: string): HomeSectionProductSource {
  return raw === "categories" ? "categories" : "manual";
}

function fromRow(row: SectionRow): HomeSection {
  const categoryIds = (row.home_section_categories ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => r.category_id);
  const productIds = (row.home_section_products ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => r.product_id);

  return {
    id: row.id,
    type: asType(row.type),
    kicker: row.kicker,
    heading: row.heading,
    description: row.description,
    background: row.background,
    productSource: asSource(row.product_source),
    itemLimit: row.item_limit,
    viewAllHref: row.view_all_href,
    viewAllLabel: row.view_all_label,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryIds,
    productIds,
  };
}

function toRow(input: HomeSectionCreateInput | HomeSectionUpdateInput) {
  const row: Record<string, unknown> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.kicker !== undefined) row.kicker = input.kicker;
  if (input.heading !== undefined) row.heading = input.heading;
  if (input.description !== undefined) row.description = input.description;
  if (input.background !== undefined) row.background = input.background;
  if (input.productSource !== undefined) row.product_source = input.productSource;
  if (input.itemLimit !== undefined) row.item_limit = input.itemLimit;
  if (input.viewAllHref !== undefined) row.view_all_href = input.viewAllHref;
  if (input.viewAllLabel !== undefined) row.view_all_label = input.viewAllLabel;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  return row;
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function listSections(): Promise<HomeSection[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_sections")
    .select(SELECT_WITH_LINKS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return (data ?? []).map((r) => fromRow(r as unknown as SectionRow));
}

export async function getSection(id: string): Promise<HomeSection> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("home_sections")
    .select(SELECT_WITH_LINKS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Section not found", "NOT_FOUND");
  return fromRow(data as unknown as SectionRow);
}

export async function createSection(
  input: HomeSectionCreateInput,
): Promise<HomeSection> {
  await requireAdmin();
  const supabase = await createClient();

  // Append to the end by default.
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const { data: last } = await supabase
      .from("home_sections")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("home_sections")
    .insert(toRow({ ...input, sortOrder }))
    .select("id")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  await syncSectionCategories(data.id, input.categoryIds ?? []);
  await syncSectionProducts(data.id, input.productIds ?? []);

  return getSection(data.id);
}

export async function updateSection(
  id: string,
  patch: HomeSectionUpdateInput,
): Promise<HomeSection> {
  await requireAdmin();
  const supabase = await createClient();

  const row = toRow(patch);
  if (Object.keys(row).length > 0) {
    const { error } = await supabase
      .from("home_sections")
      .update(row)
      .eq("id", id);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  }

  if (patch.categoryIds !== undefined) {
    await syncSectionCategories(id, patch.categoryIds);
  }
  if (patch.productIds !== undefined) {
    await syncSectionProducts(id, patch.productIds);
  }

  return getSection(id);
}

export async function deleteSection(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("home_sections").delete().eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}

/** Persist a new order. `orderedIds` is the full list of section ids top→bottom. */
export async function reorderSections(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  // One update per row; lists are short so this is fine.
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("home_sections")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Link sync — replace the set, preserving the given order via sort_order.
// ────────────────────────────────────────────────────────────────────────────

async function syncSectionCategories(
  sectionId: string,
  categoryIds: string[],
): Promise<void> {
  const supabase = await createClient();

  const { error: delErr } = await supabase
    .from("home_section_categories")
    .delete()
    .eq("section_id", sectionId);
  if (delErr) throw new ServiceError(delErr.message, "DB_ERROR", delErr);

  if (categoryIds.length === 0) return;
  // De-dupe while keeping order.
  const seen = new Set<string>();
  const rows = categoryIds
    .filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
    .map((category_id, i) => ({
      section_id: sectionId,
      category_id,
      sort_order: i,
    }));

  const { error } = await supabase.from("home_section_categories").insert(rows);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}

async function syncSectionProducts(
  sectionId: string,
  productIds: string[],
): Promise<void> {
  const supabase = await createClient();

  const { error: delErr } = await supabase
    .from("home_section_products")
    .delete()
    .eq("section_id", sectionId);
  if (delErr) throw new ServiceError(delErr.message, "DB_ERROR", delErr);

  if (productIds.length === 0) return;
  const seen = new Set<string>();
  const rows = productIds
    .filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
    .map((product_id, i) => ({
      section_id: sectionId,
      product_id,
      sort_order: i,
    }));

  const { error } = await supabase.from("home_section_products").insert(rows);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}
