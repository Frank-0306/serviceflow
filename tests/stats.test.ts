import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateStats, type StatRow } from "../src/lib/admin/stats";

const now = new Date("2026-11-19T15:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

const rows: StatRow[] = [
  { status: "new", service: "regular", total_cents: 13000, created_at: daysAgo(0.1) },
  { status: "new", service: "deep", total_cents: 30000, created_at: daysAgo(3) }, // waiting > 24h
  { status: "scheduled", service: "move", total_cents: 40000, created_at: daysAgo(10) },
  { status: "completed", service: "regular", total_cents: 15000, created_at: daysAgo(20) },
  { status: "cancelled", service: "office", total_cents: 20000, created_at: daysAgo(40) },
];

test("dashboard aggregates counts, money and follow-ups from stored rows", () => {
  const s = aggregateStats(rows, now);
  assert.equal(s.total, 5);
  assert.equal(s.last30, 4);
  assert.equal(s.previous30, 1);
  assert.deepEqual(s.byStatus, { new: 2, contacted: 0, scheduled: 1, completed: 1, cancelled: 1 });
  assert.equal(s.openPipelineCents, 13000 + 30000 + 40000);
  assert.equal(s.completedCents, 15000);
  assert.equal(s.averageEstimateCents, Math.round((13000 + 30000 + 40000 + 15000) / 4 / 100) * 100);
  assert.equal(s.byService.office.count, 1);
  assert.equal(s.byService.office.valueCents, 0, "cancelled requests don't count toward value");
  assert.equal(s.needsFollowUp, 1);
});

test("daily series covers exactly 30 days ending today", () => {
  const s = aggregateStats(rows, now);
  assert.equal(s.daily.length, 30);
  assert.equal(s.daily.at(-1)?.date, "2026-11-19");
  assert.equal(s.daily.reduce((n, d) => n + d.count, 0), 4);
});

test("empty database produces zeroes, not errors", () => {
  const s = aggregateStats([], now);
  assert.equal(s.total, 0);
  assert.equal(s.averageEstimateCents, 0);
  assert.equal(s.daily.every((d) => d.count === 0), true);
});
