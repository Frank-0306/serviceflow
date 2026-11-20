/**
 * Supabase settings.
 *
 * Public (safe in the browser, protected by RLS):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   (sb_publishable_…; legacy name NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *
 * Server only (bypasses RLS — never import from client code):
 *   SUPABASE_SECRET_KEY                    (sb_secret_…; legacy name SUPABASE_SERVICE_ROLE_KEY)
 */

export function getPublicSupabaseEnv(): { url: string; publishableKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** Names of required variables that are missing, for the setup screen. Never returns values. */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SECRET_KEY");
  }
  return missing;
}
