"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { labels } from "@/config/pricing";
import { site } from "@/config/site";
import { calculateQuote, formatCurrency, type QuoteInput } from "@/lib/quote";
import {
  TIME_WINDOWS,
  contactDetailsSchema,
  earliestBookableDate,
  latestBookableDate,
  timeWindowLabels,
  toFieldErrors,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/forms/Fields";
import { QuoteBreakdown } from "./QuoteBreakdown";
import { QuoteControls } from "./QuoteControls";

type Step = "estimate" | "details" | "done";

type ContactState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  unit: string;
  city: string;
  zip: string;
  preferredDate: string;
  timeWindow: string;
  accessNotes: string;
  consent: boolean;
  company: string;
};

const emptyContact: ContactState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  unit: "",
  city: "",
  zip: "",
  preferredDate: "",
  timeWindow: "",
  accessNotes: "",
  consent: false,
  company: "",
};

/** Formats US numbers as (555) 010-0142 while typing. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const steps: { id: Step; label: string }[] = [
  { id: "estimate", label: "Estimate" },
  { id: "details", label: "Your details" },
  { id: "done", label: "Request sent" },
];

type Result = { reference: string; total: number; preferredDate: string; timeWindow: string; email: string };

export function QuoteFlow({ initialInput }: { initialInput: QuoteInput }) {
  const [step, setStep] = useState<Step>("estimate");
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const [contact, setContact] = useState<ContactState>(emptyContact);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const quote = useMemo(() => calculateQuote(input), [input]);
  const minDate = useMemo(() => earliestBookableDate(), []);
  const maxDate = useMemo(() => latestBookableDate(), []);

  // Move focus to the new step's heading so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const update = <K extends keyof ContactState>(key: K, value: ContactState[K]) => {
    setContact((c) => ({ ...c, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = contactDetailsSchema.safeParse(contact);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: input, contact }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 400 && data?.fieldErrors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, message] of Object.entries<string>(data.fieldErrors)) {
          fieldErrors[key.replace(/^contact\./, "")] = message;
        }
        setErrors(fieldErrors);
        requestAnimationFrame(() => errorSummaryRef.current?.focus());
        return;
      }
      if (!response.ok || !data?.reference) {
        setFormError(data?.error ?? "We couldn't send your request. Check your connection and try again.");
        return;
      }

      setResult({
        reference: data.reference,
        total: data.estimate.total,
        preferredDate: contact.preferredDate,
        timeWindow: contact.timeWindow,
        email: contact.email,
      });
      setStep("done");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = steps.findIndex((s) => s.id === step);
  const errorList = Object.entries(errors);

  return (
    <div>
      <ol className="mb-10 flex flex-wrap gap-x-8 gap-y-2 border-b border-line pb-5 text-sm" aria-label="Progress">
        {steps.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === stepIndex ? "step" : undefined}
            className={`flex items-center gap-2.5 ${i === stepIndex ? "text-navy" : i < stepIndex ? "text-moss" : "text-muted/70"}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs tabular-nums ${
                i === stepIndex ? "border-navy bg-navy text-ivory" : i < stepIndex ? "border-moss" : "border-current"
              }`}
            >
              {i < stepIndex ? "✓" : i + 1}
            </span>
            {s.label}
          </li>
        ))}
      </ol>

      {step === "estimate" && (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h2 ref={headingRef} tabIndex={-1} className="type-h2 mb-2 scroll-mt-28 text-navy outline-none">
              Tell us about the space
            </h2>
            <p className="mb-10 text-muted">The estimate updates as you go. You can change anything later.</p>
            <QuoteControls value={input} onChange={setInput} />
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <QuoteBreakdown quote={quote} />
              <Button type="button" className="mt-4 w-full" chevron onClick={() => setStep("details")}>
                Continue to your details
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <form noValidate onSubmit={handleSubmit} className="relative lg:col-span-7" aria-describedby="details-intro">
            <h2 ref={headingRef} tabIndex={-1} className="type-h2 mb-2 scroll-mt-28 text-navy outline-none">
              Where and when
            </h2>
            <p id="details-intro" className="mb-8 text-muted">
              We use these details to confirm your visit. Requesting a cleaning doesn't charge anything.
            </p>

            {errorList.length > 0 && (
              <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="mb-8 border-l-2 border-error bg-error/5 px-4 py-3 text-sm text-error outline-none">
                <p className="font-medium">
                  {errorList.length === 1 ? "One field needs attention." : `${errorList.length} fields need attention.`}
                </p>
                <ul className="mt-1 list-disc pl-5">
                  {errorList.map(([key, message]) => (
                    <li key={key}>
                      <a href={`#${key}`} className="underline underline-offset-2">
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Honeypot value={contact.company} onChange={(v) => update("company", v)} />

            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-4 text-sm font-medium text-moss">Contact</legend>
              <TextField id="firstName" label="First name" autoComplete="given-name" value={contact.firstName} onChange={(e) => update("firstName", e.target.value)} error={errors.firstName} />
              <TextField id="lastName" label="Last name" autoComplete="family-name" value={contact.lastName} onChange={(e) => update("lastName", e.target.value)} error={errors.lastName} />
              <TextField id="email" label="Email" type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
              <TextField id="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 010-0000" value={contact.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} error={errors.phone} />
            </fieldset>

            <fieldset className="mt-10 grid gap-5 sm:grid-cols-6">
              <legend className="mb-4 text-sm font-medium text-moss">Address</legend>
              <TextField id="street" label="Street address" autoComplete="address-line1" wrapperClassName="sm:col-span-4" value={contact.street} onChange={(e) => update("street", e.target.value)} error={errors.street} />
              <TextField id="unit" label="Apt or suite" optional autoComplete="address-line2" wrapperClassName="sm:col-span-2" value={contact.unit} onChange={(e) => update("unit", e.target.value)} error={errors.unit} />
              <TextField id="city" label="City" autoComplete="address-level2" wrapperClassName="sm:col-span-4" value={contact.city} onChange={(e) => update("city", e.target.value)} error={errors.city} />
              <TextField id="zip" label="ZIP code" inputMode="numeric" autoComplete="postal-code" maxLength={10} wrapperClassName="sm:col-span-2" value={contact.zip} onChange={(e) => update("zip", e.target.value)} error={errors.zip} />
            </fieldset>

            <fieldset className="mt-10 grid gap-5 sm:grid-cols-2">
              <legend className="mb-4 text-sm font-medium text-moss">Timing</legend>
              <TextField id="preferredDate" label="Preferred date" type="date" min={minDate} max={maxDate} value={contact.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} error={errors.preferredDate} hint="We'll confirm or suggest the closest opening." />
              <SelectField
                id="timeWindow"
                label="Arrival window"
                placeholder="Choose a window"
                value={contact.timeWindow}
                onChange={(e) => update("timeWindow", e.target.value)}
                error={errors.timeWindow}
                options={TIME_WINDOWS.map((w) => ({ value: w, label: timeWindowLabels[w] }))}
              />
              <TextAreaField
                id="accessNotes"
                label="Access and notes"
                optional
                wrapperClassName="sm:col-span-2"
                placeholder="Gate or door codes, parking, pets, rooms to skip…"
                value={contact.accessNotes}
                onChange={(e) => update("accessNotes", e.target.value)}
                error={errors.accessNotes}
              />
            </fieldset>

            <div className="mt-8">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
                <input
                  id="consent"
                  type="checkbox"
                  checked={contact.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
                />
                <span>
                  {site.name} can contact me by email or phone about this request. (Demo: no messages are actually sent.)
                </span>
              </label>
              {errors.consent && (
                <p id="consent-error" className="mt-1.5 pl-7 text-xs font-medium text-error">
                  {errors.consent}
                </p>
              )}
            </div>

            {formError && (
              <p role="alert" className="mt-6 border-l-2 border-error bg-error/5 px-4 py-3 text-sm text-error">
                {formError}
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep("estimate")} className="link-underline self-start text-sm text-navy">
                Back to the estimate
              </button>
              <Button type="submit" loading={submitting}>
                <span key={String(submitting)}>{submitting ? "Sending request…" : "Send request"}</span>
              </Button>
            </div>
          </form>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <QuoteBreakdown quote={quote} />
            </div>
          </aside>
        </div>
      )}

      {step === "done" && result && (
        <div className="max-w-2xl">
          <h2 ref={headingRef} tabIndex={-1} className="type-h1 scroll-mt-28 text-navy outline-none">
            Request sent
          </h2>
          <p className="type-lead mt-5">
            Thanks. Your request is in. In a live version of this site, we&apos;d email {result.email} within one business day to confirm the date and arrival window.
          </p>

          <dl className="mt-10 grid border-y border-line sm:grid-cols-3">
            <div className="border-b border-line py-5 sm:border-b-0 sm:border-r sm:pr-6">
              <dt className="text-sm text-muted">Reference</dt>
              <dd className="mt-1 font-serif text-xl tabular-nums text-navy">{result.reference}</dd>
            </div>
            <div className="border-b border-line py-5 sm:border-b-0 sm:border-r sm:px-6">
              <dt className="text-sm text-muted">Preferred visit</dt>
              <dd className="mt-1 text-navy">
                {new Date(`${result.preferredDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                <span className="block text-sm text-muted">{timeWindowLabels[result.timeWindow as keyof typeof timeWindowLabels]}</span>
              </dd>
            </div>
            <div className="py-5 sm:pl-6">
              <dt className="text-sm text-muted">Estimate</dt>
              <dd className="mt-1 font-serif text-xl tabular-nums text-navy">
                {formatCurrency(result.total)}
                <span className="block font-sans text-sm text-muted">{labels.services[input.service]}</span>
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-sm text-muted">
            This is a portfolio demo: your request was saved and appears in the BrightNest admin dashboard, but no one will contact you.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="link-underline text-navy">
              Back to the homepage
            </Link>
            <button
              type="button"
              className="link-underline text-navy"
              onClick={() => {
                setContact(emptyContact);
                setResult(null);
                setStep("estimate");
              }}
            >
              Start another estimate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
