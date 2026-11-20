import Link from "next/link";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-ivory">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo inverse />
          <p className="mt-5 max-w-[34ch] leading-relaxed text-ivory/70">{site.tagline} Request a visit online and we confirm the details with you before anything is scheduled.</p>
        </div>

        <nav aria-label="Services" className="md:col-span-3">
          <h2 className="mb-4 text-sm text-ivory/55">Services</h2>
          <ul className="space-y-2.5">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} className="link-underline text-ivory/85 hover:text-ivory">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="mb-4 text-sm text-ivory/55">Contact</h2>
          <ul className="space-y-2.5 text-ivory/85">
            <li>
              <a href={site.phone.href} className="link-underline tabular-nums hover:text-ivory">
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="link-underline hover:text-ivory">
                {site.email}
              </a>
            </li>
            {site.hours.map((h) => (
              <li key={h.days} className="text-sm text-ivory/60">
                {h.days}: {h.time}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-ivory/10">
        <Container className="flex flex-col gap-3 py-6 text-[0.8rem] text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {site.project} portfolio demo. {site.name} is fictional; no services are sold through this site.
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/faq" className="hover:text-ivory">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ivory">
                Contact
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
