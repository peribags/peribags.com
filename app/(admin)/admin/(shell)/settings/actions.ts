"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState =
  | { error: string }
  | { ok: true }
  | undefined;

export type PasswordFormState =
  | { error: string }
  | { ok: true }
  | undefined;

const MAX_NAME = 200;
const MAX_PHONE = 40;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireAdmin();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (displayName.length > MAX_NAME) {
    return { error: `Display name must be ${MAX_NAME} characters or fewer.` };
  }
  if (phone.length > MAX_PHONE) {
    return { error: `Phone must be ${MAX_PHONE} characters or fewer.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName || null,
      phone: phone || null,
    },
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updatePasswordAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const user = await requireAdmin();

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!current) return { error: "Enter your current password." };
  if (next.length < MIN_PASSWORD) {
    return {
      error: `New password must be at least ${MIN_PASSWORD} characters.`,
    };
  }
  if (next.length > MAX_PASSWORD) {
    return {
      error: `New password must be ${MAX_PASSWORD} characters or fewer.`,
    };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation don’t match." };
  }
  if (next === current) {
    return { error: "New password must be different from the current one." };
  }
  if (!user.email) {
    return { error: "Your account has no email — cannot verify password." };
  }

  const supabase = await createClient();

  // Verify the current password by signing in again. This also refreshes
  // the session cookies, which is fine.
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyErr) {
    return { error: "Current password is incorrect." };
  }

  const { error: updateErr } = await supabase.auth.updateUser({
    password: next,
  });
  if (updateErr) return { error: updateErr.message };

  return { ok: true };
}
