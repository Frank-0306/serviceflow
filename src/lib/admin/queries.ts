import "server-only";
import { z } from "zod";
import { SERVICE_IDS, type ServiceId } from "@/config/pricing";
import type { QuoteLine } from "@/lib/quote";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { REQUEST_STATUSES, type RequestStatus } from "./status";
import { aggregateStats, type DashboardStats, type StatRow } from "./stats";

/* All queries run with the signed-in admin's session; RLS is the final gatekeeper. */

export const PAGE_SIZE = 20;

export const SORTS = {
  newest: { column: "created_at", ascending: false, label: "Newest first" },
  oldest: { column: "created_at", ascending: true, label: "Oldest first" },
  "visit-date": { column: "preferred_date", ascending: true, label: "Visit date" },
  "highest-estimate": { column: "total_cents", ascending: false, label: "Highest estimate" },
} as const;

export const RANGES = {
  all: { days: null, label: "All time" },
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "90d": { days: 90, label: "Last 90 days" },
} as const;

const filtersSchema = z.object({
  q: z.string().trim().max(80).catch(""),
  status: z.enum(REQUEST_STATUSES).optional().catch(undefined),
  service: z.enum(SERVICE_IDS).optional().catch(undefined),
  range: z.enum(Object.keys(RANGES) as [keyof typeof RANGES, ...(keyof typeof RANGES)[]]).catch("all"),
  sort: z.enum(Object.keys(SORTS) as [keyof typeof SORTS, ...(keyof typeof SORTS)[]]).catch("newest"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

export type RequestFilters = z.infer<typeof filtersSchema>;

export function parseFilters(params: Record<string, string | string[] | undefined>): RequestFilters {
  const flat = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return filtersSchema.parse({ ...flat, status: flat.status || undefined, service: flat.service || undefined });
}

export type RequestListItem = {
  id: string;
  reference: string;
  createdAt: string;
  status: RequestStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  service: ServiceId;
  totalCents: number;
  preferredDate: string;
  source: string;
};

const LIST_COLUMNS =
  "id, reference, created_at, status, first_name, last_name, email, phone, city, service, total_cents, preferred_date, source";

type ListRow = {
  id: string;
  reference: string;
  created_at: string;
  status: RequestStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  service: ServiceId;
  total_cents: number;
  preferred_date: string;
  source: string;
};

const toListItem = (r: ListRow): RequestListItem => ({
  id: r.id,
  reference: r.reference,
  createdAt: r.created_at,
  status: r.status,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  city: r.city,
  service: r.service,
  totalCents: r.total_cents,
  preferredDate: r.preferred_date,
  source: r.source,
});

/** Escapes LIKE wildcards so a search for "50%" matches literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (m) => `\\${m}`);

/**
 * Phones are stored as "(555) 010-0177". If the search looks like a phone number,
 * rewrite its digits into that shape so "5550100177" or "555 010 0177" still match.
 */
export function searchPattern(raw: string): string {
  const q = raw.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  if (/^[\d\s().+-]+$/.test(q) && digits.length >= 7) {
    const d = digits.slice(-10);
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return `${d.slice(-7, -4)}-${d.slice(-4)}`;
  }
  return q;
}

export async function listRequests(filters: RequestFilters) {
  const supabase = await createSupabaseServerClient();
  const sort = SORTS[filters.sort];
  const from = (filters.page - 1) * PAGE_SIZE;

  let query = supabase
    .from("service_requests")
    .select(LIST_COLUMNS, { count: "exact" })
    .order(sort.column, { ascending: sort.ascending })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.service) query = query.eq("service", filters.service);
  if (filters.q) query = query.ilike("search_text", `%${escapeLike(searchPattern(filters.q))}%`);
  const days = RANGES[filters.range].days;
  if (days) query = query.gte("created_at", new Date(Date.now() - days * 86_400_000).toISOString());

  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load requests: ${error.message}`);

  const total = count ?? 0;
  return {
    items: (data as ListRow[]).map(toListItem),
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Number of requests in each status, for the filter tabs. */
export async function countByStatus(): Promise<Record<RequestStatus | "all", number>> {
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all(
    REQUEST_STATUSES.map((status) =>
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", status),
    ),
  );
  const counts = { all: 0 } as Record<RequestStatus | "all", number>;
  REQUEST_STATUSES.forEach((status, i) => {
    if (results[i].error) throw new Error(`Could not count requests: ${results[i].error.message}`);
    counts[status] = results[i].count ?? 0;
    counts.all += counts[status];
  });
  return counts;
}

export type RequestDetail = RequestListItem & {
  updatedAt: string;
  street: string;
  unit: string;
  zip: string;
  timeWindow: "morning" | "midday" | "afternoon";
  accessNotes: string;
  frequency: string;
  quoteInput: Record<string, unknown>;
  quoteLines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  laborHours: { min: number; max: number };
  adminNotes: string;
  events: { id: number; fromStatus: RequestStatus | null; toStatus: RequestStatus; changedBy: string | null; createdAt: string }[];
};

const uuid = z.string().uuid();

export async function getRequest(id: string): Promise<RequestDetail | null> {
  if (!uuid.safeParse(id).success) return null;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `${LIST_COLUMNS}, updated_at, street, unit, zip, time_window, access_notes, frequency, quote_input, quote_lines,
       subtotal_cents, discount_cents, labor_hours_min, labor_hours_max, admin_notes,
       request_status_events ( id, from_status, to_status, changed_by, created_at )`,
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "request_status_events", ascending: true })
    .maybeSingle();

  if (error) throw new Error(`Could not load request: ${error.message}`);
  if (!data) return null;

  const r = data as unknown as ListRow & {
    updated_at: string;
    street: string;
    unit: string;
    zip: string;
    time_window: RequestDetail["timeWindow"];
    access_notes: string;
    frequency: string;
    quote_input: Record<string, unknown>;
    quote_lines: QuoteLine[];
    subtotal_cents: number;
    discount_cents: number;
    labor_hours_min: number;
    labor_hours_max: number;
    admin_notes: string;
    request_status_events: { id: number; from_status: RequestStatus | null; to_status: RequestStatus; changed_by: string | null; created_at: string }[];
  };

  return {
    ...toListItem(r),
    updatedAt: r.updated_at,
    street: r.street,
    unit: r.unit,
    zip: r.zip,
    timeWindow: r.time_window,
    accessNotes: r.access_notes,
    frequency: r.frequency,
    quoteInput: r.quote_input,
    quoteLines: Array.isArray(r.quote_lines) ? r.quote_lines : [],
    subtotalCents: r.subtotal_cents,
    discountCents: r.discount_cents,
    laborHours: { min: Number(r.labor_hours_min), max: Number(r.labor_hours_max) },
    adminNotes: r.admin_notes,
    events: (r.request_status_events ?? []).map((e) => ({
      id: e.id,
      fromStatus: e.from_status,
      toStatus: e.to_status,
      changedBy: e.changed_by,
      createdAt: e.created_at,
    })),
  };
}

/* ─── Dashboard statistics ─────────────────────────────────────────────── */

export type DashboardData = DashboardStats & { recent: RequestListItem[] };

const MAX_STATS_ROWS = 10_000;

export async function getDashboardStats(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();

  const [statsResult, recentResult] = await Promise.all([
    supabase
      .from("service_requests")
      .select("status, service, total_cents, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_STATS_ROWS),
    supabase.from("service_requests").select(LIST_COLUMNS).order("created_at", { ascending: false }).limit(6),
  ]);

  if (statsResult.error) throw new Error(`Could not load statistics: ${statsResult.error.message}`);
  if (recentResult.error) throw new Error(`Could not load recent requests: ${recentResult.error.message}`);

  return {
    ...aggregateStats(statsResult.data as StatRow[]),
    recent: (recentResult.data as ListRow[]).map(toListItem),
  };
}
