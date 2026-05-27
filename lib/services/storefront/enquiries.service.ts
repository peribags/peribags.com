import "server-only";

import { createClient } from "@/lib/supabase/server";
import { ServiceError } from "@/lib/services/shared/errors";
import type { Enquiry, EnquiryCreateInput } from "@/types";

const MAX_NAME = 200;
const MAX_EMAIL = 200;
const MAX_PHONE = 40;
const MAX_MESSAGE = 4000;
const MAX_URL = 1000;

function clean(v: string | null | undefined, max: number): string | null {
  if (v == null) return null;
  const t = String(v).trim();
  if (!t) return null;
  return t.slice(0, max);
}

/**
 * Submit a customer enquiry from the storefront.
 *
 * Runs as the anon role under RLS — the policy `enquiries_public_insert`
 * only allows inserts where status='new' and notes is null, so callers
 * cannot pre-set those fields.
 *
 * Throws ServiceError("VALIDATION") for missing required fields or when
 * neither email nor phone is provided.
 */
export async function submitEnquiry(
  input: EnquiryCreateInput,
): Promise<Enquiry> {
  const name = clean(input.customerName, MAX_NAME);
  const email = clean(input.customerEmail ?? null, MAX_EMAIL);
  const phone = clean(input.customerPhone ?? null, MAX_PHONE);
  const message = clean(input.message, MAX_MESSAGE);
  const sourceUrl = clean(input.sourceUrl ?? null, MAX_URL);
  const productId = input.productId ?? null;

  if (!name) throw new ServiceError("Name is required.", "VALIDATION");
  if (!message) throw new ServiceError("Message is required.", "VALIDATION");
  if (!email && !phone) {
    throw new ServiceError(
      "Please share an email or phone so we can reply.",
      "VALIDATION",
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ServiceError("That email doesn’t look valid.", "VALIDATION");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      product_id: productId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      message,
      source_url: sourceUrl,
    })
    .select("*")
    .single();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);

  return {
    id: data.id,
    productId: data.product_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerPhone: data.customer_phone,
    message: data.message,
    status: data.status,
    sourceUrl: data.source_url,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
