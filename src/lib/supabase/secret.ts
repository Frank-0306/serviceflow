import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Privileged client using the secret key. It bypasses Row Level Security,
 * so it is used for exactly one job: inserting validated public requests
 * from /api/requests. The `server-only` import makes the build fail if any
 * client component ever imports this file.
 */
export function getSupabaseSecretClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return null;

  if (!client) {
    client = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
