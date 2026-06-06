import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  OurWorkCreateInput,
  OurWorkItem,
  OurWorkUpdateInput,
} from "@/types";

type Row = {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string;
  description: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function fromRow(row: Row): OurWorkItem {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    imageUrl: row.image_url,
    description: row.description,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: OurWorkCreateInput | OurWorkUpdateInput) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.logoUrl !== undefined) row.logo_url = input.logoUrl;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.description !== undefined) row.description = input.description;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  return row;
}

export async function listOurWork(): Promise<OurWorkItem[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("our_work_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return (data ?? []).map((r) => fromRow(r as unknown as Row));
}

export async function getOurWork(id: string): Promise<OurWorkItem> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("our_work_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Item not found", "NOT_FOUND");
  return fromRow(data as unknown as Row);
}

export async function createOurWork(
  input: OurWorkCreateInput,
): Promise<OurWorkItem> {
  await requireAdmin();
  const supabase = await createClient();

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const { data: last } = await supabase
      .from("our_work_items")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("our_work_items")
    .insert(toRow({ ...input, sortOrder }))
    .select("*")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return fromRow(data as unknown as Row);
}

export async function updateOurWork(
  id: string,
  patch: OurWorkUpdateInput,
): Promise<OurWorkItem> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("our_work_items")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Item not found", "NOT_FOUND");
  return fromRow(data as unknown as Row);
}

export async function deleteOurWork(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("our_work_items")
    .delete()
    .eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}
