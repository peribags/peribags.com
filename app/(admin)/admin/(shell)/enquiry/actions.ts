"use server";

import { redirect } from "next/navigation";
import {
  deleteEnquiry,
  updateEnquiryNotes,
  updateEnquiryStatus,
} from "@/lib/services/admin/enquiries.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type { EnquiryStatus } from "@/types";

export type EnquiryActionState =
  | { error: string }
  | { ok: true }
  | undefined;

function validStatus(v: unknown): v is EnquiryStatus {
  return v === "new" || v === "responded" || v === "archived";
}

export async function updateEnquiryStatusAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !validStatus(status)) return;

  await updateEnquiryStatus(id, status);
}

export async function updateEnquiryNotesAction(
  _prev: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing enquiry id." };

  const raw = String(formData.get("notes") ?? "");
  const notes = raw.trim() ? raw.trim() : null;

  try {
    await updateEnquiryNotes(id, notes);
  } catch (err) {
    return {
      error:
        err instanceof ServiceError ? err.message : "Failed to save notes.",
    };
  }

  return { ok: true };
}

export async function deleteEnquiryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteEnquiry(id);
  redirect("/admin/enquiry?deleted=1");
}
