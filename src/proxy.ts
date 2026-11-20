import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

/**
 * Runs before every /admin request:
 * 1. Refreshes the Supabase session cookie when it is close to expiring.
 * 2. Sends visitors without a session to the sign-in page.
 *
 * This is the first of three checks. The admin layout verifies admin
 * membership on the server, and the database enforces it again with RLS.
 */
export async function proxy(request: NextRequest) {
  const env = getPublicSupabaseEnv();
  // Not configured yet: let the admin pages render their setup instructions.
  if (!env) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return redirectWithCookies(url, response);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

/** Keeps any refreshed session cookies when redirecting. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  matcher: ["/admin/:path*"],
};
