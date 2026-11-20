import Link from "next/link";
import { services } from "@/content/services";
import { formatCurrency, startingPrice } from "@/lib/quote";

/** Services as an editorial index: one row per service, price aligned on the right. */
export function ServiceList({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="border-t border-navy/80">
      {services.map((service) => (
        <li key={service.slug} className="border-b border-line">
          <Link
            href={`/services/${service.slug}`}
            className="group grid gap-3 py-7 transition-colors sm:grid-cols-12 sm:items-baseline sm:gap-8 sm:py-8"
          >
            <Heading className="font-serif text-[1.75rem] font-light leading-tight text-navy sm:col-span-4 sm:text-[2rem]">
              <span className="link-underline group-hover:bg-[length:100%_1px]">{service.name}</span>
            </Heading>
            <p className="max-w-[52ch] leading-relaxed text-muted sm:col-span-5">{service.summary}</p>
            <p className="flex items-baseline justify-between gap-4 sm:col-span-3 sm:flex-col sm:items-end sm:gap-1">
              <span className="text-sm text-muted">From</span>
              <span className="font-serif text-2xl tabular-nums text-navy">{formatCurrency(startingPrice(service.id))}</span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
