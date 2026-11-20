import Link from "next/link";
import { faqGroups } from "@/content/faq";
import { getServiceById } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Accordion } from "@/components/ui/Accordion";
import { HeroEstimator } from "@/components/home/HeroEstimator";
import { ServiceList } from "@/components/home/ServiceList";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { CtaBand } from "@/components/home/CtaBand";

const promises = [
  {
    title: "Nothing to pay up front",
    body: "Requesting a visit is free. You pay after the cleaning is done.",
  },
  {
    title: "Free changes with 48 hours' notice",
    body: "Move or skip a visit without a fee, as long as you tell us two days ahead.",
  },
  {
    title: "A re-clean if we miss something",
    body: "Let us know within 24 hours and we'll come back for the areas that weren't right.",
  },
  {
    title: "Supplies come with us",
    body: "Products, vacuums and mops are included. Prefer your own products? Leave them out.",
  },
];

export default function HomePage() {
  const regular = getServiceById("regular");
  const faqPreview = faqGroups.flatMap((g) => g.items).filter((i) => !i.q.includes("real company")).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Container className="grid gap-12 pb-16 pt-12 md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="animate-rise lg:col-span-7">
            <h1 className="type-display max-w-[13ch] text-navy">Know the price before we knock.</h1>
            <p className="type-lead prose-measure mt-7 max-w-[46ch]">
              BrightNest cleans homes and small offices on a schedule that fits yours. Set your rooms, see an itemized estimate, and request a visit in about two minutes.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 text-[0.95rem]">
              <Link href="/services" className="link-underline font-medium text-navy">
                Compare services
              </Link>
              <Link href="/faq" className="link-underline text-muted hover:text-navy">
                How booking works
              </Link>
            </div>
          </div>
          <div className="animate-rise lg:col-span-5" style={{ animationDelay: "120ms" }}>
            <HeroEstimator />
          </div>
        </Container>
      </section>

      {/* Image band */}
      <Container>
        <div className="grid gap-3 sm:grid-cols-12">
          <PhotoSlot
            className="aspect-[3/2] sm:col-span-8 sm:aspect-[21/9]"
            brief="Wide shot: bright living room after a clean, morning light"
            alt="Placeholder for a photo of a bright, freshly cleaned living room"
          />
          <PhotoSlot
            tone="sage"
            className="hidden sm:col-span-4 sm:block"
            brief="Detail: folded towels on a bathroom shelf"
            alt="Placeholder for a detail photo of folded towels on a shelf"
          />
        </div>
      </Container>

      {/* Services */}
      <section aria-labelledby="services-heading" className="py-20 md:py-28">
        <Container>
          <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
            <h2 id="services-heading" className="type-h2 text-navy md:col-span-6">
              Four ways we clean
            </h2>
            <p className="leading-relaxed text-muted md:col-span-5 md:col-start-8">
              Prices below are the starting point for a one-bedroom, one-bath home or a small office. Your estimate grows with the rooms and size you enter, nothing else.
            </p>
          </div>
          <ServiceList />
        </Container>
      </section>

      {/* Process */}
      <section aria-labelledby="process-heading" className="bg-navy py-20 text-ivory md:py-28">
        <Container>
          <h2 id="process-heading" className="type-h2 mb-14 max-w-[22ch]">
            From estimate to a clean home
          </h2>
          <ProcessSteps inverse />
        </Container>
      </section>

      {/* Checklist */}
      <section aria-labelledby="checklist-heading" className="py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="checklist-heading" className="type-h2 text-navy">
              What a regular clean covers
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Every visit follows a written checklist, so you know what&apos;s done before the cleaner arrives. Deep and move cleans add detail work on top.
            </p>
            <PhotoSlot
              className="mt-10 hidden aspect-[4/3] lg:block"
              brief={regular.photo.brief}
              alt={regular.photo.alt}
            />
          </div>
          <div className="lg:col-span-7">
            {regular.checklist.map((group) => (
              <div key={group.room} className="grid gap-4 border-t border-line py-7 sm:grid-cols-7">
                <h3 className="font-serif text-xl text-navy sm:col-span-2">{group.room}</h3>
                <ul className="space-y-2.5 sm:col-span-5">
                  {group.tasks.map((task) => (
                    <li key={task} className="flex gap-3 leading-relaxed text-ink">
                      <svg aria-hidden="true" viewBox="0 0 12 12" className="mt-[0.45rem] h-3 w-3 shrink-0 text-moss">
                        <path d="M2 6.3 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-line pt-6">
              <Link href={`/services/${regular.slug}`} className="link-underline text-navy">
                See everything included and what isn&apos;t
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Policies */}
      <section aria-labelledby="policies-heading" className="border-t border-line py-20 md:py-28">
        <Container>
          <h2 id="policies-heading" className="type-h2 mb-12 max-w-[20ch] text-navy">
            Plain policies, written down
          </h2>
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((p) => (
              <div key={p.title}>
                <dt className="font-medium text-navy">{p.title}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-xs text-muted">Policies shown are part of the demo and describe how a real client&apos;s site would present them.</p>
        </Container>
      </section>

      {/* FAQ preview */}
      <section aria-labelledby="faq-heading" className="border-t border-line py-20 md:py-28">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="faq-heading" className="type-h2 text-navy">
              Common questions
            </h2>
            <Link href="/faq" className="link-underline mt-5 inline-block text-navy">
              Read all questions
            </Link>
          </div>
          <Accordion items={faqPreview} className="lg:col-span-8" />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
