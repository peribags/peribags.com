import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Cookie-free anonymous Supabase client for cached storefront reads.
 *
 * Unlike `lib/supabase/server.ts`, this never touches request APIs
 * (`cookies()`), which makes it safe to call inside `unstable_cache` scopes —
 * the foundation of the storefront's tag-based cache. All reads run as the
 * anon role, so RLS public-read policies still apply.
 */
export function createAnonClient(): SupabaseClient {
  if (cached) return cached;
  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return cached;
}
