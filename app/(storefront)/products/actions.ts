"use server";

import { submitEnquiry } from "@/lib/services/storefront/enquiries.service";
import { sendEnquiryEmails } from "@/lib/mailer";
import { ServiceError } from "@/lib/services/shared/errors";

export type EnquirySubmitResult = { ok: true } | { error: string };

/** Accepts "+91", "+1", … (1–4 digits). Anything else falls back to +91. */
function cleanCountryCode(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  return /^\+\d{1,4}$/.test(t) ? t : "+91";
}

export async function submitEnquiryAction(input: {
  productId?: string | null;
  productName?: string | null;
  name: string;
  email?: string;
  countryCode?: string;
  phone?: string;
  message: string;
  sourceUrl?: string;
}): Promise<EnquirySubmitResult> {
  const phone = (input.phone ?? "").trim();
  const customerPhone = phone
    ? `${cleanCountryCode(input.countryCode)} ${phone}`
    : null;

  let enquiry;
  try {
    enquiry = await submitEnquiry({
      productId: input.productId ?? null,
      customerName: input.name,
      customerEmail: input.email?.trim() ? input.email.trim() : null,
      customerPhone,
      message: input.message,
      sourceUrl: input.sourceUrl?.trim() ? input.sourceUrl.trim() : null,
    });
  } catch (err) {
    return {
      error:
        err instanceof ServiceError
          ? err.message
          : "Couldn't send your enquiry. Please try again.",
    };
  }

  // Notify admin + acknowledge the customer. Never blocks the submission —
  // sendEnquiryEmails swallows failures (and no-ops when SMTP isn't set up).
  await sendEnquiryEmails({
    customerName: enquiry.customerName,
    customerEmail: enquiry.customerEmail,
    customerPhone: enquiry.customerPhone,
    message: enquiry.message,
    productName: input.productName ?? null,
    sourceUrl: enquiry.sourceUrl,
  });

  return { ok: true };
}
