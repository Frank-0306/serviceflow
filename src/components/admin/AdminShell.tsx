"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/requests", label: "Requests", exact: false },
];

function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-6 w-6">
      <path d="M4 15a10 10 0 0 0 20 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 15a5.5 5.5 0 0 0 11 0" fill="none" stroke="var(--color-sage)" strokeWidth="1.6" />
      <circle cx="14" cy="8.5" r="2" fill="var(--color-sage)" />
    </svg>
  );
}

function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={`text-sm text-ivory/70 underline-offset-4 hover:text-ivory hover:underline ${className}`}>
        Sign out
      </button>
    </form>
  );
}

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const links = (
    <ul className="space-y-1">
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(item) ? "page" : undefined}
            className="block rounded-[var(--radius-xs)] px-3 py-2 text-[0.95rem] text-ivory/75 transition-colors hover:bg-ivory/5 hover:text-ivory aria-[current=page]:bg-ivory/10 aria-[current=page]:text-ivory"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-dvh bg-ivory lg:pl-60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-navy px-4 py-6 text-ivory lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-3">
          <Mark />
          <span className="font-serif text-lg leading-none">BrightNest</span>
          <span className="rounded-[2px] border border-ivory/25 px-1.5 py-0.5 text-[0.65rem] text-ivory/70">Admin</span>
        </Link>
        <nav aria-label="Admin" className="mt-10">
          {links}
        </nav>
        <div className="mt-auto space-y-4 border-t border-ivory/10 px-3 pt-5">
          <Link href="/" className="block text-sm text-ivory/70 hover:text-ivory">
            View public site
          </Link>
          <div>
            <p className="truncate text-xs text-ivory/50" title={email}>
              {email}
            </p>
            <SignOutButton className="mt-1" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-navy px-4 text-ivory lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Mark />
          <span className="font-serif text-lg leading-none">BrightNest</span>
          <span className="rounded-[2px] border border-ivory/25 px-1.5 py-0.5 text-[0.65rem] text-ivory/70">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          className="h-10 px-2 text-sm font-medium"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>
      <div id="admin-mobile-nav" hidden={!open} className="fixed inset-x-0 top-14 z-30 border-t border-ivory/10 bg-navy px-4 pb-6 pt-4 text-ivory shadow-lg lg:hidden">
        <nav aria-label="Admin mobile">{links}</nav>
        <div className="mt-5 flex items-center justify-between border-t border-ivory/10 px-3 pt-4">
          <p className="truncate text-xs text-ivory/50">{email}</p>
          <SignOutButton />
        </div>
      </div>

      <div className="mx-auto max-w-[76rem] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
    </div>
  );
}
