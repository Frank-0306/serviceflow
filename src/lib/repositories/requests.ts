import "server-only";
import type { Quote } from "../quote";
import type { ContactDetails } from "../validation";
import type { RequestStatus } from "../admin/status";
import { getSupabaseSecretClient } from "../supabase/secret";

export type { RequestStatus };

export type NewServiceRequest = {
  contact: Omit<ContactDetails, "consent" | "company">;
  quote: Pick<Quote, "input" | "lines" | "subtotal" | "discount" | "total" | "laborHours">;
};

export type CreatedRequest = {
  id: string;
  reference: string;
  status: RequestStatus;
  createdAt: string;
};

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
}

/**
 * Storage boundary for service requests. Route handlers depend on this
 * interface, not on Supabase directly.
 */
export interface RequestRepository {
  create(request: NewServiceRequest): Promise<CreatedRequest>;
}

/** Stores every phone as "(555) 010-0177" so the admin search finds it consistently. */
export function formatUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw.trim();
}

export function makeReference(date: Date): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((byte) => alphabet[byte % alphabet.length])
    .join("");
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  return `BN-${ymd}-${random}`;
}

class SupabaseRequestRepository implements RequestRepository {
  async create({ contact, quote }: NewServiceRequest): Promise<CreatedRequest> {
    const supabase = getSupabaseSecretClient();
    if (!supabase) throw new StorageNotConfiguredError();

    const row = {
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email.toLowerCase(),
      phone: formatUsPhone(contact.phone),
      street: contact.street,
      unit: contact.unit ?? "",
      city: contact.city,
      zip: contact.zip,
      preferred_date: contact.preferredDate,
      time_window: contact.timeWindow,
      access_notes: contact.accessNotes ?? "",
      service: quote.input.service,
      frequency: quote.input.frequency,
      quote_input: quote.input,
      quote_lines: quote.lines,
      subtotal_cents: quote.subtotal,
      discount_cents: quote.discount?.amount ?? 0,
      total_cents: quote.total,
      labor_hours_min: quote.laborHours.min,
      labor_hours_max: quote.laborHours.max,
    };

    // Retry once in the unlikely event of a reference collision (unique violation).
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await supabase
        .from("service_requests")
        .insert({ ...row, reference: makeReference(new Date()) })
        .select("id, reference, status, created_at")
        .single();

      if (!error && data) {
        return { id: data.id, reference: data.reference, status: data.status, createdAt: data.created_at };
      }
      if (error?.code !== "23505") throw new Error(`Supabase insert failed: ${error?.code} ${error?.message}`);
    }
    throw new Error("Could not generate a unique reference.");
  }
}

let repository: RequestRepository | null = null;

export function getRequestRepository(): RequestRepository {
  if (!repository) repository = new SupabaseRequestRepository();
  return repository;
}
