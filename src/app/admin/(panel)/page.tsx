import type { Metadata } from "next";
import Link from "next/link";
import { SERVICE_IDS, labels } from "@/config/pricing";
import { formatCurrency } from "@/lib/quote";
import { getDashboardStats } from "@/lib/admin/queries";
import { REQUEST_STATUSES, statusLabels } from "@/lib/admin/status";
import { relativeTime } from "@/lib/admin/format";
import { BarList, DailyBars } from "@/components/admin/Charts";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Overview" };

function Tile({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
  const body = (
    <>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 font-serif text-[2.1rem] font-light leading-none tabular-nums text-navy">{value}</dd>
      {note && <dd className="mt-2 text-xs text-muted">{note}</dd>}
    </>
  );
  return (
    <div className="border-t border-navy/80 pt-4">
      {href ? (
        <Link href={href} className="block hover:[&_dd:first-of-type]:text-moss">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "No requests in the previous 30 days either" : "No requests in the previous 30 days";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Same as the previous 30 days";
  return `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% from the previous 30 days`;
}

export default async function OverviewPage() {
  const stats = await getDashboardStats();

  if (stats.total === 0) {
    return (
      <>
        <h1 className="type-h2 text-navy">Overview</h1>
        <div className="mt-10 max-w-xl border-t border-line pt-8">
          <h2 className="font-serif text-xl text-navy">No requests yet</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Requests sent from the estimate page on the public site appear here as soon as they arrive. Send one yourself to see the full flow.
          </p>
          <Link href="/quote" className="mt-6 inline-flex h-10 items-center rounded-[var(--radius-xs)] bg-navy px-4 text-sm font-medium text-ivory hover:bg-navy-soft">
            Open the estimate page
          </Link>
        </div>
      </>
    );
  }

  const open = stats.byStatus.new + stats.byStatus.contacted + stats.byStatus.scheduled;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-h2 text-navy">Overview</h1>
          <p className="mt-1 text-sm text-muted">Live figures from all {stats.total} stored requests.</p>
        </div>
        {stats.needsFollowUp > 0 && (
          <Link href="/admin/requests?status=new&sort=oldest" className="border-l-2 border-[#b0873a] bg-[#f1e7d2] px-3 py-2 text-sm text-[#6a4f17] hover:underline">
            {stats.needsFollowUp} new {stats.needsFollowUp === 1 ? "request has" : "requests have"} waited over 24 hours
          </Link>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <Tile label="Requests, last 30 days" value={String(stats.last30)} note={trend(stats.last30, stats.previous30)} />
        <Tile label="Awaiting first contact" value={String(stats.byStatus.new)} href="/admin/requests?status=new" note="Status: New" />
        <Tile label="Open pipeline" value={formatCurrency(stats.openPipelineCents)} note={`${open} open requests, estimated value`} />
        <Tile label="Completed" value={formatCurrency(stats.completedCents)} note={`${stats.byStatus.completed} visits · avg estimate ${formatCurrency(stats.averageEstimateCents)}`} />
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <section aria-labelledby="daily-heading" className="lg:col-span-3">
          <h2 id="daily-heading" className="font-serif text-xl text-navy">
            New requests per day
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted">Last 30 days, by date received (UTC)</p>
          <DailyBars data={stats.daily} title="New requests per day over the last 30 days" />
        </section>

        <section aria-labelledby="status-heading" className="lg:col-span-2">
          <h2 id="status-heading" className="font-serif text-xl text-navy">
            By status
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted">All requests</p>
          <BarList
            title="Requests by status"
            items={REQUEST_STATUSES.map((s) => ({
              label: statusLabels[s],
              value: stats.byStatus[s],
              display: String(stats.byStatus[s]),
              href: `/admin/requests?status=${s}`,
            }))}
          />
        </section>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <section aria-labelledby="service-heading" className="lg:col-span-2">
          <h2 id="service-heading" className="font-serif text-xl text-navy">
            By service
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted">Request count · estimated value excluding cancelled</p>
          <BarList
            title="Requests by service"
            items={SERVICE_IDS.map((s) => ({
              label: labels.services[s],
              value: stats.byService[s].count,
              display: `${stats.byService[s].count} · ${formatCurrency(stats.byService[s].valueCents)}`,
              href: `/admin/requests?service=${s}`,
            }))}
          />
        </section>

        <section aria-labelledby="recent-heading" className="lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <h2 id="recent-heading" className="font-serif text-xl text-navy">
              Latest requests
            </h2>
            <Link href="/admin/requests" className="link-underline text-sm text-navy">
              View all
            </Link>
          </div>
          <ul className="mt-4 border-t border-line">
            {stats.recent.map((r) => (
              <li key={r.id} className="border-b border-line">
                <Link href={`/admin/requests/${r.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 hover:bg-paper sm:grid-cols-[1fr_auto_auto]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-navy">
                      {r.firstName} {r.lastName}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {labels.services[r.service]} · {relativeTime(r.createdAt)}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="text-right font-serif tabular-nums text-navy">{formatCurrency(r.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
