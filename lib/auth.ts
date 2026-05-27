import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AdminUser = User & { app_metadata: { role: "admin" } };

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function isAdmin(user: User | null): user is AdminUser {
  return user?.app_metadata?.role === "admin";
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getUser();
  if (!isAdmin(user)) throw new Error("Unauthorized");
  return user;
}
