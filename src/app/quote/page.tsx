import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuoteFlow } from "@/components/quote/QuoteFlow";
import { defaultQuoteInput, normalizeQuoteInput, type QuoteInput } from "@/lib/quote";
import { quoteInputSchema } from "@/lib/validation";
import { pricing } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Get an estimate",
  description:
    "Build an itemized cleaning estimate and request a visit from BrightNest Cleaning, a fictional company in the ServiceFlow portfolio demo.",
  alternates: { canonical: "/quote" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Reads ?service=deep&bedrooms=3… so other pages can hand over their numbers. Bad values fall back to defaults. */
function inputFromParams(params: Record<string, string | string[] | undefined>): QuoteInput {
  const first = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]);
  const candidate: QuoteInput = { ...defaultQuoteInput };

  for (const key of ["service", "bedrooms", "bathrooms", "restrooms", "sqft", "condition", "frequency"] as const) {
    const value = first(key);
    if (value === undefined) continue;
    const field = quoteInputSchema.shape[key].safeParse(value);
    if (field.success) Object.assign(candidate, { [key]: field.data });
  }

  // Coming from a one-time service, default to one-time; recurring services keep the biweekly default.
  if (!pricing.services[candidate.service].allowsRecurring) candidate.frequency = "one-time";
  return normalizeQuoteInput(candidate);
}

export default async function QuotePage({ searchParams }: Props) {
  const initialInput = inputFromParams(await searchParams);

  return (
    <>
      <PageHeader
        title="Get an estimate"
        intro="Build your estimate line by line, then tell us where and when. You'll see every charge before you send anything."
      />
      <Container className="pb-24">
        <QuoteFlow initialInput={initialInput} />
      </Container>
    </>
  );
}
