import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, services } from "@/content/services";
import { pricing } from "@/config/pricing";
import { formatCurrency, startingPrice } from "@/lib/quote";
import { Container } from "@/components/ui/Container";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/home/CtaBand";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.summary} Starting at ${formatCurrency(startingPrice(service.id))} (demo pricing).`,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.name, description: service.summary },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const rate = pricing.services[service.id];
  const others = services.filter((s) => s.slug !== service.slug);
  const from = startingPrice(service.id);

  return (
    <>
      <Container className="pb-14 pt-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted">
          <ol className="flex gap-2">
            <li>
              <Link href="/services" className="link-underline hover:text-navy">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-navy">
              {service.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h1 className="type-h1 text-navy">{service.name}</h1>
            <p className="type-lead prose-measure mt-6">{service.intro}</p>

            <dl className="mt-10 grid grid-cols-2 border-y border-line sm:grid-cols-3">
              <div className="py-5 pr-4">
                <dt className="text-sm text-muted">Starting at</dt>
                <dd className="mt-1 font-serif text-3xl tabular-nums text-navy">{formatCurrency(from)}</dd>
              </div>
              <div className="border-l border-line py-5 pl-5">
                <dt className="text-sm text-muted">Schedule</dt>
                <dd className="mt-1 text-navy">{rate.allowsRecurring ? "One time or recurring" : "One time"}</dd>
              </div>
              <div className="col-span-2 border-t border-line py-5 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-5">
                <dt className="text-sm text-muted">Priced by</dt>
                <dd className="mt-1 text-navy">{rate.kind === "residential" ? "Bedrooms, baths and size" : "Square feet and restrooms"}</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href={`/quote?service=${service.id}`} chevron>
                Estimate a {service.name.toLowerCase()}
              </ButtonLink>
              <Link href="/faq" className="link-underline text-sm text-navy">
                Questions about booking
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <PhotoSlot className="aspect-[4/5]" tone="sage" brief={service.photo.brief} alt={service.photo.alt} />
          </div>
        </div>
      </Container>

      <section aria-labelledby="bestfor-heading" className="border-t border-line py-16 md:py-20">
        <Container className="grid gap-8 md:grid-cols-12">
          <h2 id="bestfor-heading" className="type-h3 text-navy md:col-span-4">
            A good fit for
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3 md:col-span-8">
            {service.bestFor.map((item) => (
              <li key={item} className="border-l-2 border-sage pl-4 leading-relaxed text-ink">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="included-heading" className="border-t border-line py-16 md:py-24">
        <Container>
          <h2 id="included-heading" className="type-h2 mb-10 text-navy">
            What&apos;s included
          </h2>
          <div className="grid gap-x-12 md:grid-cols-3">
            {service.checklist.map((group) => (
              <div key={group.room} className="border-t border-navy/80 pb-8 pt-5">
                <h3 className="font-serif text-xl text-navy">{group.room}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.tasks.map((task) => (
                    <li key={task} className="flex gap-3 leading-relaxed">
                      <svg aria-hidden="true" viewBox="0 0 12 12" className="mt-[0.45rem] h-3 w-3 shrink-0 text-moss">
                        <path d="M2 6.3 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl text-navy">Not included</h3>
              <ul className="mt-4 space-y-2.5 text-muted">
                {service.notIncluded.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-current" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-xl text-navy">Before we arrive</h3>
              <ol className="mt-4 space-y-2.5 text-muted">
                {service.preparation.map((item, i) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span className="font-serif tabular-nums text-moss">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="service-faq-heading" className="border-t border-line py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-12">
          <h2 id="service-faq-heading" className="type-h2 text-navy lg:col-span-4">
            Questions about {service.name.toLowerCase()}
          </h2>
          <Accordion items={service.questions} className="lg:col-span-8" />
        </Container>
      </section>

      <section aria-labelledby="other-heading" className="border-t border-line py-16 md:py-20">
        <Container>
          <h2 id="other-heading" className="mb-6 text-sm text-muted">
            Other services
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group block border-t border-line pt-4">
                  <span className="link-underline font-serif text-2xl font-light text-navy group-hover:bg-[length:100%_1px]">{s.name}</span>
                  <span className="mt-1 block text-sm tabular-nums text-muted">From {formatCurrency(startingPrice(s.id))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand href={`/quote?service=${service.id}`} />
    </>
  );
}
