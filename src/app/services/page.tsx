import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ServiceList } from "@/components/home/ServiceList";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = {
  title: "Cleaning services",
  description:
    "Regular, deep, move-in/move-out and office cleaning from BrightNest Cleaning (a fictional demo company). Compare what's included and see starting prices.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Cleaning services"
        intro="Pick the clean that matches the state of your home and how often you want it done. Every service has a written checklist and a price you can see before you book."
      />
      <Container className="pb-20 md:pb-28">
        <ServiceList headingLevel="h2" />
      </Container>

      <section aria-labelledby="how-heading" className="border-t border-line py-20 md:py-24">
        <Container>
          <h2 id="how-heading" className="type-h2 mb-12 text-navy">
            How booking works
          </h2>
          <ProcessSteps />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
