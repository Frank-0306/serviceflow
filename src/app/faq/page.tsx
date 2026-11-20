import type { Metadata } from "next";
import Link from "next/link";
import { faqGroups } from "@/content/faq";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Pricing, booking, scheduling and what to expect during a BrightNest Cleaning visit (portfolio demo).",
  alternates: { canonical: "/faq" },
};

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function FaqPage() {
  // FAQPage structured data; content matches what's visible on the page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        title="Questions, answered"
        intro={
          <>
            Can&apos;t find what you need?{" "}
            <Link href="/contact" className="text-navy underline underline-offset-4">
              Send us a message
            </Link>
            .
          </>
        }
      />
      <Container className="grid gap-12 pb-24 lg:grid-cols-12">
        <nav aria-label="FAQ sections" className="lg:col-span-3">
          <ul className="space-y-2 text-sm lg:sticky lg:top-28">
            {faqGroups.map((group) => (
              <li key={group.title}>
                <a href={`#${slug(group.title)}`} className="link-underline text-muted hover:text-navy">
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16 lg:col-span-9">
          {faqGroups.map((group) => (
            <section key={group.title} id={slug(group.title)} aria-labelledby={`${slug(group.title)}-heading`} className="scroll-mt-28">
              <h2 id={`${slug(group.title)}-heading`} className="type-h3 mb-4 text-navy">
                {group.title}
              </h2>
              <Accordion items={group.items} />
            </section>
          ))}
        </div>
      </Container>
      <CtaBand />
    </>
  );
}
