import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { signOut } from "../actions";

/**
 * Second line of defense after the proxy: confirms on the server that the
 * signed-in user is listed in public.admins before rendering anything.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (session.kind === "not-admin") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="type-h2 text-navy">No access to the admin panel</h1>
        <p className="mt-4 leading-relaxed text-muted">
          You&apos;re signed in as <strong className="font-medium text-ink">{session.email}</strong>, but this account isn&apos;t an
          administrator. Sign out and use an admin account, or ask an administrator to grant access.
        </p>
        <form action={signOut} className="mt-8">
          <button type="submit" className="h-11 rounded-[var(--radius-xs)] bg-navy px-5 font-medium text-ivory hover:bg-navy-soft">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
