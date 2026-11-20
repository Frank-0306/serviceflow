import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession =
  | { kind: "admin"; userId: string; email: string }
  | { kind: "not-admin"; email: string };

/**
 * Resolves the current user and whether they are an admin.
 * Cached per request so the layout and page share one lookup.
 * getUser() validates the session with Supabase Auth instead of trusting the cookie.
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(`Could not verify admin access: ${error.message}`);

  return data
    ? { kind: "admin", userId: user.id, email: user.email ?? "" }
    : { kind: "not-admin", email: user.email ?? "" };
});

/** For server actions: returns the admin or throws. Never trust that the page already checked. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (session.kind !== "admin") throw new Error("Not authorized.");
  return session;
}
