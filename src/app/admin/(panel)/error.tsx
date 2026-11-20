"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl py-10">
      <h1 className="type-h2 text-navy">This page couldn&apos;t load</h1>
      <p className="mt-3 leading-relaxed text-muted">
        The admin panel couldn&apos;t reach the database or the request failed. Check your connection and try again. If it keeps
        happening, confirm the Supabase settings and that the database schema was applied.
      </p>
      {error.digest && <p className="mt-3 text-xs text-muted">Error reference: {error.digest}</p>}
      <button type="button" onClick={reset} className="mt-6 h-10 rounded-[var(--radius-xs)] bg-navy px-4 text-sm font-medium text-ivory hover:bg-navy-soft">
        Try again
      </button>
    </div>
  );
}
