import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const signedOut = params["signed-out"] === "1";

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-navy p-12 text-ivory lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <svg aria-hidden="true" viewBox="0 0 28 28" className="h-7 w-7">
            <path d="M4 15a10 10 0 0 0 20 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8.5 15a5.5 5.5 0 0 0 11 0" fill="none" stroke="var(--color-sage)" strokeWidth="1.6" />
            <circle cx="14" cy="8.5" r="2" fill="var(--color-sage)" />
          </svg>
          <span className="font-serif text-xl">BrightNest</span>
        </Link>
        <div>
          <p className="type-h1 max-w-[14ch] font-light">Every request, from estimate to clean.</p>
          <p className="mt-6 max-w-[40ch] leading-relaxed text-ivory/65">
            Review new requests, contact customers and track each visit through to completion.
          </p>
        </div>
        <p className="text-xs text-ivory/45">ServiceFlow portfolio demo. BrightNest Cleaning is a fictional company.</p>
      </div>

      <div className="flex flex-col justify-center px-5 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 font-serif text-xl text-navy lg:hidden">
            BrightNest <span className="font-sans text-xs text-muted">Admin</span>
          </Link>
          <h1 className="type-h2 text-navy">Sign in</h1>
          <p className="mt-2 text-muted">For BrightNest staff. Accounts are created by an administrator.</p>

          {signedOut && (
            <p role="status" className="mt-6 border-l-2 border-moss bg-sage-light/40 px-3 py-2 text-sm text-moss">
              You&apos;ve been signed out.
            </p>
          )}

          <LoginForm next={next} />

          <Link href="/" className="link-underline mt-10 inline-block text-sm text-muted hover:text-navy">
            Back to the public site
          </Link>
        </div>
      </div>
    </div>
  );
}
