import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { missingSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | BrightNest Admin" },
  robots: { index: false, follow: false },
};

// Admin pages depend on the signed-in user; never cache or prerender them.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const missing = missingSupabaseEnv();
  if (missing.length > 0) return <SetupRequired missing={missing} />;
  return <>{children}</>;
}

function SetupRequired({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <p className="text-sm text-moss">BrightNest Admin</p>
      <h1 className="type-h1 mt-3 text-navy">Connect Supabase to use the admin panel</h1>
      <p className="type-lead mt-5">These environment variables are missing on the server:</p>
      <ul className="mt-4 space-y-1.5">
        {missing.map((name) => (
          <li key={name}>
            <code className="rounded-[2px] bg-paper px-2 py-1 text-sm text-navy">{name}</code>
          </li>
        ))}
      </ul>
      <p className="mt-6 leading-relaxed text-muted">
        Add them to <code className="text-navy">.env.local</code> (locally) or to the project&apos;s Environment Variables (Vercel), then restart
        the server. The README has the full setup steps.
      </p>
      <Link href="/" className="link-underline mt-8 inline-block text-navy">
        Back to the public site
      </Link>
    </div>
  );
}
