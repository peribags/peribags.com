import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import {
  rangeFor,
  type Page,
  type Pagination,
} from "@/lib/services/shared/pagination";
import type { Enquiry, EnquiryStatus } from "@/types";

type EnquiryRow = {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  message: string;
  status: EnquiryStatus;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  products?: { id: string; name: string; slug: string } | null;
};

const SELECT_WITH_PRODUCT =
  "*, products ( id, name, slug )";

function fromRow(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    message: row.message,
    status: row.status,
    sourceUrl: row.source_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    product: row.products ?? null,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────────

export type EnquiryListFilter = {
  status?: EnquiryStatus | "all";
  productId?: string;
};

export async function listEnquiries(
  filter: EnquiryListFilter = {},
  pagination?: Pagination,
): Promise<Page<Enquiry>> {
  await requireAdmin();
  const supabase = await createClient();
  const p = pagination ?? { page: 1, pageSize: 50 };
  const { from, to } = rangeFor(p);

  let q = supabase
    .from("enquiries")
    .select(SELECT_WITH_PRODUCT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter.productId) {
    q = q.eq("product_id", filter.productId);
  }

  const { data, error, count } = await q;
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return {
    rows: (data ?? []).map((r) => fromRow(r as unknown as EnquiryRow)),
    total: count ?? 0,
    page: p.page,
    pageSize: p.pageSize,
  };
}

/** Count enquiries grouped by status. Used by the inbox tabs. */
export async function countEnquiriesByStatus(): Promise<
  Record<EnquiryStatus | "all", number>
> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.from("enquiries").select("status");
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  const counts: Record<EnquiryStatus | "all", number> = {
    new: 0,
    responded: 0,
    archived: 0,
    all: 0,
  };
  for (const row of data ?? []) {
    const s = (row as { status: EnquiryStatus }).status;
    if (s in counts) counts[s] += 1;
    counts.all += 1;
  }
  return counts;
}

export async function getEnquiry(id: string): Promise<Enquiry> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .select(SELECT_WITH_PRODUCT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Enquiry not found", "NOT_FOUND");
  return fromRow(data as unknown as EnquiryRow);
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<Enquiry> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id)
    .select(SELECT_WITH_PRODUCT)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Enquiry not found", "NOT_FOUND");
  return fromRow(data as unknown as EnquiryRow);
}

export async function updateEnquiryNotes(
  id: string,
  notes: string | null,
): Promise<Enquiry> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .update({ notes })
    .eq("id", id)
    .select(SELECT_WITH_PRODUCT)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Enquiry not found", "NOT_FOUND");
  return fromRow(data as unknown as EnquiryRow);
}

export async function deleteEnquiry(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}
