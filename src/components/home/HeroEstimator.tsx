"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SERVICE_IDS, labels, pricing, type ServiceId } from "@/config/pricing";
import { calculateQuote, defaultQuoteInput, formatCurrency, formatHours } from "@/lib/quote";
import { Stepper } from "@/components/quote/Controls";

/**
 * The homepage's lead element: a small live estimate on a navy "work order".
 * It hands its numbers to /quote through the URL so nothing is re-entered.
 */
export function HeroEstimator() {
  const [service, setService] = useState<ServiceId>("regular");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [restrooms, setRestrooms] = useState(2);

  const rate = pricing.services[service];
  const quote = useMemo(
    () =>
      calculateQuote({
        ...defaultQuoteInput,
        service,
        bedrooms,
        bathrooms,
        restrooms,
        sqft: 1200,
        frequency: rate.allowsRecurring ? "biweekly" : "one-time",
      }),
    [service, bedrooms, bathrooms, restrooms, rate.allowsRecurring],
  );

  const params = new URLSearchParams({ service, sqft: "1200" });
  if (rate.kind === "residential") {
    params.set("bedrooms", String(bedrooms));
    params.set("bathrooms", String(bathrooms));
  } else {
    params.set("restrooms", String(restrooms));
  }

  return (
    <div className="relative bg-navy text-ivory shadow-[0_30px_60px_-30px_rgba(20,35,58,0.55)]">
      {/* Perforated edge, like a tear-off service ticket */}
      <div
        aria-hidden="true"
        className="absolute -top-[5px] left-0 right-0 h-[10px] bg-[radial-gradient(circle_at_5px_5px,var(--color-ivory)_4px,transparent_4.5px)] bg-[length:16px_10px] bg-repeat-x"
      />
      <div className="p-6 pt-8 sm:p-8 sm:pt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl">Price your clean</h2>
          <span className="text-xs text-ivory/50">Demo rates</span>
        </div>

        <div className="mt-6">
          <label htmlFor="hero-service" className="sr-only">
            Type of cleaning
          </label>
          <div className="relative">
            <select
              id="hero-service"
              value={service}
              onChange={(e) => setService(e.target.value as ServiceId)}
              className="w-full appearance-none rounded-[var(--radius-xs)] border border-ivory/25 bg-transparent px-4 py-3 pr-10 text-base text-ivory hover:border-ivory/60 focus:border-ivory focus:outline-none [&>option]:text-ink"
            >
              {SERVICE_IDS.map((id) => (
                <option key={id} value={id}>
                  {labels.services[id]}
                </option>
              ))}
            </select>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
              <path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-y border-ivory/15 py-5">
          {rate.kind === "residential" ? (
            <>
              <Stepper tone="dark" label="Bedrooms" value={bedrooms} min={pricing.limits.bedrooms.min} max={pricing.limits.bedrooms.max} onChange={setBedrooms} unit={{ one: "bedroom", many: "bedrooms" }} />
              <Stepper tone="dark" label="Bathrooms" value={bathrooms} min={pricing.limits.bathrooms.min} max={pricing.limits.bathrooms.max} onChange={setBathrooms} unit={{ one: "bathroom", many: "bathrooms" }} />
            </>
          ) : (
            <Stepper tone="dark" label="Restrooms" value={restrooms} min={pricing.limits.restrooms.min} max={pricing.limits.restrooms.max} onChange={setRestrooms} unit={{ one: "restroom", many: "restrooms" }} />
          )}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <p className="text-sm leading-snug text-ivory/65">
            {rate.allowsRecurring ? "Per visit, every two weeks" : "One-time visit"}
            <span className="block text-xs text-ivory/45">1,200 sq ft, {formatHours(quote.laborHours)}</span>
          </p>
          <p key={quote.total} className="animate-settle font-serif text-5xl font-light leading-none tabular-nums" aria-live="polite">
            {formatCurrency(quote.total)}
          </p>
        </div>

        <Link
          href={`/quote?${params.toString()}`}
          className="group mt-7 flex items-center justify-between gap-3 rounded-[var(--radius-xs)] bg-ivory px-5 py-3.5 font-medium text-navy transition-colors hover:bg-white"
        >
          Continue to booking
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5">
            <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
