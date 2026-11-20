import { SERVICE_IDS, type ServiceId } from "../../config/pricing";
import { REQUEST_STATUSES, type RequestStatus } from "./status";

/* Pure aggregation for the dashboard. No I/O, so it can be unit-tested. */

export type DashboardStats = {
  total: number;
  last30: number;
  previous30: number;
  byStatus: Record<RequestStatus, number>;
  byService: Record<ServiceId, { count: number; valueCents: number }>;
  openPipelineCents: number;
  completedCents: number;
  averageEstimateCents: number;
  daily: { date: string; count: number }[];
  needsFollowUp: number;
};

export type StatRow = { status: RequestStatus; service: ServiceId; total_cents: number; created_at: string };

/** `now` is injectable for deterministic tests. */
export function aggregateStats(rows: StatRow[], now = new Date()): DashboardStats {
  const dayMs = 86_400_000;
  const byStatus = Object.fromEntries(REQUEST_STATUSES.map((s) => [s, 0])) as Record<RequestStatus, number>;
  const byService = Object.fromEntries(SERVICE_IDS.map((s) => [s, { count: 0, valueCents: 0 }])) as DashboardStats["byService"];

  // 30 calendar days ending today (UTC dates keep server and database aligned).
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) dailyMap.set(new Date(today - i * dayMs).toISOString().slice(0, 10), 0);

  let last30 = 0;
  let previous30 = 0;
  let openPipelineCents = 0;
  let completedCents = 0;
  let nonCancelledSum = 0;
  let nonCancelledCount = 0;
  let needsFollowUp = 0;

  for (const row of rows) {
    const created = new Date(row.created_at).getTime();
    const age = now.getTime() - created;
    byStatus[row.status] += 1;
    if (byService[row.service]) {
      byService[row.service].count += 1;
      if (row.status !== "cancelled") byService[row.service].valueCents += row.total_cents;
    }
    if (age <= 30 * dayMs) last30 += 1;
    else if (age <= 60 * dayMs) previous30 += 1;

    const key = new Date(created).toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);

    if (row.status === "new" || row.status === "contacted" || row.status === "scheduled") openPipelineCents += row.total_cents;
    if (row.status === "completed") completedCents += row.total_cents;
    if (row.status !== "cancelled") {
      nonCancelledSum += row.total_cents;
      nonCancelledCount += 1;
    }
    if (row.status === "new" && age > dayMs) needsFollowUp += 1;
  }

  return {
    total: rows.length,
    last30,
    previous30,
    byStatus,
    byService,
    openPipelineCents,
    completedCents,
    averageEstimateCents: nonCancelledCount ? Math.round(nonCancelledSum / nonCancelledCount / 100) * 100 : 0,
    daily: Array.from(dailyMap, ([date, count]) => ({ date, count })),
    needsFollowUp,
  };
}
