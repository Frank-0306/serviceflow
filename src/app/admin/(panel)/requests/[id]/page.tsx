import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { labels } from "@/config/pricing";
import { formatCurrency } from "@/lib/quote";
import { getRequest } from "@/lib/admin/queries";
import { statusLabels } from "@/lib/admin/status";
import { formatDate, formatDateTime, relativeTime } from "@/lib/admin/format";
import { timeWindowLabels } from "@/lib/validation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { NotesForm, StatusForm } from "@/components/admin/RequestForms";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const request = await getRequest(id);
  return { title: request ? `${request.reference}` : "Request not found" };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-ink sm:col-span-2">{children}</dd>
    </div>
  );
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const r = await getRequest(id);
  if (!r) notFound();

  const input = r.quoteInput as { bedrooms?: number; bathrooms?: number; restrooms?: number; sqft?: number; condition?: string; addOns?: string[] };
  const isOffice = r.service === "office";
  const address = [r.street, r.unit].filter(Boolean).join(", ");
  const mapsQuery = encodeURIComponent(`${address}, ${r.city} ${r.zip}`);

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/admin/requests" className="link-underline hover:text-navy">
          Requests
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="tabular-nums text-navy">{r.reference}</span>
      </nav>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="type-h2 text-navy">
            {r.firstName} {r.lastName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <StatusBadge status={r.status} />
            <span>{labels.services[r.service]}</span>
            <span>Received {relativeTime(r.createdAt)}</span>
            {r.source === "demo-seed" && <span className="rounded-[2px] border border-line px-1.5 text-xs">Demo data</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Estimate</p>
          <p className="font-serif text-4xl font-light tabular-nums text-navy">{formatCurrency(r.totalCents)}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="font-serif text-xl text-navy">
              Contact
            </h2>
            <dl className="mt-2 divide-y divide-line border-y border-line">
              <Field label="Email">
                <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your BrightNest request ${r.reference}`)}`} className="text-navy underline underline-offset-4">
                  {r.email}
                </a>
              </Field>
              <Field label="Phone">
                <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="tabular-nums text-navy underline underline-offset-4">
                  {r.phone}
                </a>
              </Field>
              <Field label="Address">
                {address}
                <br />
                {r.city} {r.zip}
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-navy underline underline-offset-4">
                  Open in Maps
                </a>
              </Field>
            </dl>
          </section>

          <section aria-labelledby="visit-heading">
            <h2 id="visit-heading" className="font-serif text-xl text-navy">
              Visit
            </h2>
            <dl className="mt-2 divide-y divide-line border-y border-line">
              <Field label="Preferred date">{formatDate(r.preferredDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</Field>
              <Field label="Arrival window">{timeWindowLabels[r.timeWindow]}</Field>
              <Field label="Frequency">{labels.frequencies[r.frequency as keyof typeof labels.frequencies] ?? r.frequency}</Field>
              <Field label="Space">
                {isOffice
                  ? `${input.restrooms ?? 0} restrooms`
                  : `${input.bedrooms ?? 0} bedrooms, ${input.bathrooms ?? 0} bathrooms`}
                {input.sqft ? `, ${Number(input.sqft).toLocaleString("en-US")} sq ft` : ""}
              </Field>
              <Field label="Access and notes">
                {r.accessNotes ? <span className="whitespace-pre-line">{r.accessNotes}</span> : <span className="text-muted">None provided</span>}
              </Field>
            </dl>
          </section>

          <section aria-labelledby="estimate-heading">
            <h2 id="estimate-heading" className="font-serif text-xl text-navy">
              Estimate breakdown
            </h2>
            <p className="mt-1 text-sm text-muted">Calculated by the server when the request was submitted.</p>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-line border-y border-line">
                {r.quoteLines.map((line) => (
                  <tr key={line.id}>
                    <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink">
                      {line.label}
                      {line.detail && <span className="block text-xs text-muted">{line.detail}</span>}
                    </th>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(line.amount)}</td>
                  </tr>
                ))}
                {r.discountCents > 0 && (
                  <tr className="text-moss">
                    <th scope="row" className="py-2.5 text-left font-normal">
                      Recurring discount
                    </th>
                    <td className="py-2.5 text-right tabular-nums">−{formatCurrency(r.discountCents)}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row" className="py-3 text-left font-medium text-navy">
                    Total
                    <span className="block text-xs font-normal text-muted">
                      {r.laborHours.min}–{r.laborHours.max} labor hours
                    </span>
                  </th>
                  <td className="py-3 text-right font-serif text-lg tabular-nums text-navy">{formatCurrency(r.totalCents)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <aside className="space-y-10 lg:col-span-5">
          <section aria-labelledby="status-heading" className="border-t border-navy/80 pt-4">
            <h2 id="status-heading" className="font-serif text-xl text-navy">
              Status
            </h2>
            <div className="mt-4">
              <StatusForm id={r.id} current={r.status} />
            </div>
          </section>

          <section aria-labelledby="notes-heading" className="border-t border-line pt-4">
            <h2 id="notes-heading" className="font-serif text-xl text-navy">
              Internal notes
            </h2>
            <div className="mt-4">
              <NotesForm id={r.id} initial={r.adminNotes} />
            </div>
          </section>

          <section aria-labelledby="history-heading" className="border-t border-line pt-4">
            <h2 id="history-heading" className="font-serif text-xl text-navy">
              History
            </h2>
            <ol className="mt-4 space-y-4 border-l border-line pl-5">
              {[...r.events].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span aria-hidden="true" className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-navy ring-4 ring-ivory" />
                  <p className="text-sm text-ink">
                    {e.fromStatus ? (
                      <>
                        {statusLabels[e.fromStatus]} → <strong className="font-medium">{statusLabels[e.toStatus]}</strong>
                      </>
                    ) : (
                      <>Request received</>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(e.createdAt)}
                    {e.fromStatus ? (e.changedBy ? " · by an admin" : " · by the system") : " · from the website"}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
