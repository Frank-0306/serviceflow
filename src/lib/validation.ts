import { z } from "zod";
import {
  ADD_ON_IDS,
  CONDITION_IDS,
  FREQUENCY_IDS,
  SERVICE_IDS,
  pricing,
} from "../config/pricing";

const { limits } = pricing;

export const quoteInputSchema = z.object({
  service: z.enum(SERVICE_IDS),
  bedrooms: z.coerce.number().int().min(limits.bedrooms.min).max(limits.bedrooms.max),
  bathrooms: z.coerce.number().int().min(limits.bathrooms.min).max(limits.bathrooms.max),
  restrooms: z.coerce.number().int().min(limits.restrooms.min).max(limits.restrooms.max),
  sqft: z.coerce
    .number()
    .int()
    .min(limits.sqft.min, `Enter at least ${limits.sqft.min} sq ft.`)
    .max(limits.sqft.max, `For spaces over ${limits.sqft.max.toLocaleString("en-US")} sq ft, contact us for a custom quote.`),
  condition: z.enum(CONDITION_IDS),
  frequency: z.enum(FREQUENCY_IDS),
  addOns: z.array(z.enum(ADD_ON_IDS)).max(ADD_ON_IDS.length),
});

export const TIME_WINDOWS = ["morning", "midday", "afternoon"] as const;
export const timeWindowLabels: Record<(typeof TIME_WINDOWS)[number], string> = {
  morning: "Morning, 8–11 a.m.",
  midday: "Midday, 11 a.m.–2 p.m.",
  afternoon: "Afternoon, 2–5 p.m.",
};

/** Rejects impossible calendar dates such as 2026-02-31, which the regex alone allows. */
function isRealDate(value: string): boolean {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Latest bookable date: one year from today, as YYYY-MM-DD. */
export function latestBookableDate(now = new Date()): string {
  const d = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const trimmed = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

/** Earliest bookable date: tomorrow, as YYYY-MM-DD in the visitor's local calendar. */
export function earliestBookableDate(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const contactDetailsSchema = z.object({
  firstName: trimmed(60).min(1, "Enter your first name."),
  lastName: trimmed(60).min(1, "Enter your last name."),
  email: trimmed(120).min(1, "Enter your email address.").email("Enter a valid email, like name@example.com."),
  phone: trimmed(30)
    .min(1, "Enter a phone number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
    }, "Enter a 10-digit US phone number."),
  street: trimmed(120).min(3, "Enter the street address."),
  unit: trimmed(30).optional().default(""),
  city: trimmed(80).min(2, "Enter the city."),
  zip: trimmed(10).regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code."),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine(isRealDate, "Choose a valid date.")
    .refine((value) => {
      // Allow one day of slack for visitors in time zones behind the server.
      const slack = new Date();
      slack.setDate(slack.getDate() - 1);
      return value >= earliestBookableDate(slack);
    }, "Choose a date from tomorrow onward.")
    .refine((value) => value <= latestBookableDate(), "Choose a date within the next 12 months."),
  timeWindow: z.enum(TIME_WINDOWS, { message: "Choose an arrival window." }),
  accessNotes: trimmed(500).optional().default(""),
  consent: z.literal(true, { message: "Confirm we can contact you about this request." }),
  /** Honeypot: real visitors never see or fill this field. */
  company: z.string().max(0).optional().default(""),
});

export const serviceRequestSchema = z.object({
  quote: quoteInputSchema,
  contact: contactDetailsSchema,
});

export type ServiceRequestPayload = z.infer<typeof serviceRequestSchema>;
export type ContactDetails = z.infer<typeof contactDetailsSchema>;

export const CONTACT_TOPICS = ["question", "existing", "business", "other"] as const;
export const contactTopicLabels: Record<(typeof CONTACT_TOPICS)[number], string> = {
  question: "A question before booking",
  existing: "An upcoming or past visit",
  business: "Office or recurring business cleaning",
  other: "Something else",
};

export const contactMessageSchema = z.object({
  name: trimmed(80).min(1, "Enter your name."),
  email: trimmed(120).min(1, "Enter your email address.").email("Enter a valid email, like name@example.com."),
  topic: z.enum(CONTACT_TOPICS, { message: "Choose a topic." }),
  message: trimmed(2000).min(10, "Write at least a sentence so we can help."),
  company: z.string().max(0).optional().default(""),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

/** Flattens Zod issues into { "contact.email": "message" } for the UI. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
