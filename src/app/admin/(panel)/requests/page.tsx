import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { labels } from "@/config/pricing";
import { formatCurrency } from "@/lib/quote";
import { countByStatus, listRequests, parseFilters, type RequestFilters as Filters } from "@/lib/admin/queries";
import { REQUEST_STATUSES, statusLabels } from "@/lib/admin/status";
import { formatDate, relativeTime } from "@/lib/admin/format";
import { RequestFilters } from "@/components/admin/RequestFilters";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Requests" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Builds a URL that keeps current filters and overrides some. */
function hrefWith(filters: Filters, changes: Partial<Record<keyof Filters, string | number | undefined>>) {
  const merged: Record<string, string | number | undefined> = { ...filters, ...changes };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "") continue;
    if (key === "range" && value === "all") continue;
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && value === 1) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return `/admin/requests${qs ? `?${qs}` : ""}`;
}

export default async function RequestsPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [{ items, total, pageCount }, counts] = await Promise.all([listRequests(filters), countByStatus()]);
  const filtered = Boolean(filters.q || filters.service || filters.range !== "all");

  const tabs = [{ value: undefined, label: "All", count: counts.all }, ...REQUEST_STATUSES.map((s) => ({ value: s, label: statusLabels[s], count: counts[s] }))];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-h2 text-navy">Requests</h1>
          <p className="mt-1 text-sm text-muted">
            {total} {total === 1 ? "request" : "requests"}
            {filters.status ? ` with status ${statusLabels[filters.status]}` : ""}
            {filtered ? " matching your filters" : ""}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <nav aria-label="Filter by status" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1 border-b border-line">
          {tabs.map((tab) => {
            const active = filters.status === tab.value;
            return (
              <li key={tab.label}>
                <Link
                  href={hrefWith(filters, { status: tab.value, page: 1 })}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                    active ? "border-navy font-medium text-navy" : "border-transparent text-muted hover:text-navy"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-navy text-ivory" : "bg-line/70 text-muted"}`}>{tab.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5">
        <Suspense fallback={<div className="h-10" />}>
          <RequestFilters />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 border-t border-line pt-8">
          <h2 className="font-serif text-xl text-navy">{filtered || filters.status ? "No requests match these filters" : "No requests yet"}</h2>
          <p className="mt-2 max-w-md text-muted">
            {filtered || filters.status
              ? "Try a different search or status, or clear the filters to see everything."
              : "Requests sent from the public estimate page will show up here."}
          </p>
          {(filtered || filters.status) && (
            <Link href="/admin/requests" className="link-underline mt-5 inline-block text-navy">
              Clear all filters
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Service requests, page {filters.page} of {pageCount}</caption>
              <thead>
                <tr className="border-b border-navy/80 text-xs text-muted">
                  <th scope="col" className="py-2.5 pr-4 font-medium">Customer</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Contact</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Service</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Visit</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-2.5 text-right font-medium">Estimate</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="group border-b border-line align-top hover:bg-paper">
                    <td className="py-3.5 pr-4">
                      <Link href={`/admin/requests/${r.id}`} className="font-medium text-navy group-hover:underline">
                        {r.firstName} {r.lastName}
                      </Link>
                      <span className="block text-xs text-muted">
                        {r.reference} · {relativeTime(r.createdAt)}
                        {r.source === "demo-seed" && <span className="ml-1.5 rounded-[2px] border border-line px-1 text-[0.65rem]">Demo data</span>}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <a href={`mailto:${r.email}`} className="block text-ink hover:underline">
                        {r.email}
                      </a>
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="block text-xs tabular-nums text-muted hover:underline">
                        {r.phone}
                      </a>
                    </td>
                    <td className="py-3.5 pr-4 text-ink">
                      {labels.services[r.service]}
                      <span className="block text-xs text-muted">{r.city}</span>
                    </td>
                    <td className="py-3.5 pr-4 tabular-nums text-ink">{formatDate(r.preferredDate, { month: "short", day: "numeric" })}</td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 text-right font-serif text-base tabular-nums text-navy">{formatCurrency(r.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="mt-5 border-t border-line md:hidden">
            {items.map((r) => (
              <li key={r.id} className="border-b border-line">
                <Link href={`/admin/requests/${r.id}`} className="block py-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-navy">
                      {r.firstName} {r.lastName}
                    </span>
                    <span className="font-serif tabular-nums text-navy">{formatCurrency(r.totalCents)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{r.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <StatusBadge status={r.status} />
                    <span>{labels.services[r.service]}</span>
                    <span aria-hidden="true">·</span>
                    <span>Visit {formatDate(r.preferredDate, { month: "short", day: "numeric" })}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
              <span className="text-muted">
                Page {filters.page} of {pageCount}
              </span>
              <div className="flex gap-2">
                {filters.page > 1 ? (
                  <Link href={hrefWith(filters, { page: filters.page - 1 })} className="rounded-[var(--radius-xs)] border border-line px-3 py-2 text-navy hover:border-navy/40">
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-[var(--radius-xs)] border border-line px-3 py-2 text-muted/50">Previous</span>
                )}
                {filters.page < pageCount ? (
                  <Link href={hrefWith(filters, { page: filters.page + 1 })} className="rounded-[var(--radius-xs)] border border-line px-3 py-2 text-navy hover:border-navy/40">
                    Next
                  </Link>
                ) : (
                  <span className="rounded-[var(--radius-xs)] border border-line px-3 py-2 text-muted/50">Next</span>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
