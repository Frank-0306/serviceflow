import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions before booking, or about an upcoming visit? Contact BrightNest Cleaning (fictional demo company).",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Talk to us"
        intro={
          <>
            Ready to book? The{" "}
            <Link href="/quote" className="text-navy underline underline-offset-4">
              estimate page
            </Link>{" "}
            is the fastest way. For anything else, write to us here.
          </>
        }
      />
      <Container className="grid gap-14 pb-24 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="lg:col-span-5">
          <div className="border-t border-navy pt-6">
            <h2 className="font-serif text-xl text-navy">Phone and email</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={site.phone.href} className="link-underline tabular-nums text-navy">
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-underline text-navy">
                  {site.email}
                </a>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">Demo contact details. The number uses the reserved 555-01xx range and the email domain can&apos;t receive mail.</p>
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="font-serif text-xl text-navy">Office hours</h2>
            <dl className="mt-4 space-y-2">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6 text-sm">
                  <dt className="text-muted">{h.days}</dt>
                  <dd className="tabular-nums text-navy">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="font-serif text-xl text-navy">Service area</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{site.serviceArea} On a client site, this is where the cities and ZIP codes served would be listed.</p>
          </div>
        </aside>
      </Container>
    </>
  );
}
