"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SERVICE_IDS, labels } from "@/config/pricing";

type Option = { value: string; label: string };

const ranges: Option[] = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const sorts: Option[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "visit-date", label: "Visit date" },
  { value: "highest-estimate", label: "Highest estimate" },
];

const selectClass =
  "h-10 appearance-none rounded-[var(--radius-xs)] border border-line bg-paper pl-3 pr-8 text-base text-ink sm:text-sm hover:border-navy/40 focus:border-navy focus:outline-none";

function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-navy">
        <path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

/** Filters live in the URL, so a filtered view can be bookmarked, shared and survives refresh. */
export function RequestFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const first = useRef(true);
  const skipNextSearch = useRef(false);

  const apply = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || (value === "all" && key !== "status")) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  // Debounced search: wait until typing pauses.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    const t = setTimeout(() => apply({ q: query.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = ["q", "service", "range", "sort"].some((k) => params.get(k));

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center" aria-busy={pending}>
      <div className="relative flex-1">
        <label htmlFor="request-search" className="sr-only">
          Search requests
        </label>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <input
          id="request-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone, reference or ZIP"
          maxLength={80}
          className="h-10 w-full rounded-[var(--radius-xs)] border border-line bg-paper pl-9 pr-3 text-base text-ink sm:text-sm placeholder:text-muted/70 hover:border-navy/40 focus:border-navy focus:outline-none"
        />
        {pending && (
          <span aria-hidden="true" className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-[1.5px] border-navy border-r-transparent" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          id="filter-service"
          label="Service"
          value={params.get("service") ?? ""}
          options={[{ value: "", label: "All services" }, ...SERVICE_IDS.map((id) => ({ value: id, label: labels.services[id] }))]}
          onChange={(v) => apply({ service: v })}
        />
        <Select id="filter-range" label="Date range" value={params.get("range") ?? "all"} options={ranges} onChange={(v) => apply({ range: v })} />
        <Select id="filter-sort" label="Sort by" value={params.get("sort") ?? "newest"} options={sorts} onChange={(v) => apply({ sort: v === "newest" ? null : v })} />
        {hasFilters && (
          <button
            type="button"
            className="h-10 px-2 text-sm text-navy underline-offset-4 hover:underline"
            onClick={() => {
              if (query) skipNextSearch.current = true;
              setQuery("");
              const status = params.get("status");
              startTransition(() => router.replace(status ? `${pathname}?status=${status}` : pathname, { scroll: false }));
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
