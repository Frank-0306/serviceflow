import type { Quote } from "@/lib/quote";
import { formatCurrency, formatHours } from "@/lib/quote";
import { labels, pricing } from "@/config/pricing";

type Props = {
  quote: Quote;
  /** Compact hides the line items and shows only the total. */
  compact?: boolean;
  className?: string;
};

/** Line-by-line estimate. Every number shown here is derived from src/config/pricing.ts. */
export function QuoteBreakdown({ quote, compact = false, className = "" }: Props) {
  const recurring = quote.input.frequency !== "one-time";

  return (
    <section aria-labelledby="estimate-heading" className={`bg-navy p-6 text-ivory sm:p-8 ${className}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-ivory/15 pb-4">
        <h2 id="estimate-heading" className="font-serif text-xl">
          Your estimate
        </h2>
        <span key={quote.input.service} className="text-sm text-ivory/60">
          {labels.services[quote.input.service]}
        </span>
      </div>

      {!compact && (
        <dl className="divide-y divide-ivory/10 text-[0.93rem]">
          {quote.lines.map((line) => (
            // Key includes label and amount so the row is rebuilt (not patched) when it changes,
            // which keeps it correct under browser translation.
            <div key={`${line.id}:${line.label}:${line.amount}`} className="flex items-start justify-between gap-6 py-3">
              <dt>
                <span className="text-ivory/90">{line.label}</span>
                {line.detail && <span className="block text-xs text-ivory/50">{line.detail}</span>}
              </dt>
              <dd translate="no" className="tabular-nums text-ivory/90">
                {formatCurrency(line.amount)}
              </dd>
            </div>
          ))}
          {quote.discount && (
            <div key={`discount:${quote.discount.label}:${quote.discount.amount}`} className="flex items-start justify-between gap-6 py-3 text-sage-light">
              <dt>
                {quote.discount.label}
                <span className="block text-xs text-ivory/50">{Math.round(quote.discount.rate * 100)}% off every visit</span>
              </dt>
              <dd translate="no" className="tabular-nums">
                −{formatCurrency(quote.discount.amount)}
              </dd>
            </div>
          )}
          {quote.minimumApplied && (
            <div className="py-3 text-xs text-ivory/60">
              Visits have a {formatCurrency(pricing.minimumCharge)} minimum, so the total is rounded up to it.
            </div>
          )}
        </dl>
      )}

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-ivory/25 pt-5">
        <div>
          <p key={String(recurring)} className="text-sm text-ivory/60">
            {recurring ? "Per visit" : "Total"}
          </p>
          <p key={`${quote.crewSize}:${formatHours(quote.laborHours)}`} className="mt-1 text-xs text-ivory/50">
            {quote.crewSize === 1 ? "One cleaner" : "Two cleaners"}, {formatHours(quote.laborHours)} of work
          </p>
        </div>
        <p key={quote.total} translate="no" className="animate-settle font-serif text-[2.75rem] font-light leading-none tabular-nums" aria-live="polite">
          {formatCurrency(quote.total)}
        </p>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ivory/50">
        Demo pricing. A real estimate would be confirmed with you before the visit; nothing is charged when you send a request.
      </p>
    </section>
  );
}
