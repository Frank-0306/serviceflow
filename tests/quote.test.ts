import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateQuote, defaultQuoteInput, formatCurrency, startingPrice } from "../src/lib/quote";
import { pricing } from "../src/config/pricing";
import { contactDetailsSchema, earliestBookableDate, quoteInputSchema } from "../src/lib/validation";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

test("regular clean: lines add up to the subtotal and discount is applied", () => {
  const quote = calculateQuote({ ...defaultQuoteInput, service: "regular", bedrooms: 2, bathrooms: 2, sqft: 1200, frequency: "biweekly" });
  const rate = pricing.services.regular;
  // base + 2 bedrooms + 2 bathrooms + one 500 sq ft block
  const expected = rate.base + 2 * rate.perBedroom + 2 * rate.perBathroom + rate.perSqftBlock;
  assert.equal(quote.subtotal, expected);
  assert.equal(sum(quote.lines.map((l) => l.amount)), quote.subtotal);
  const discount = Math.round((expected * 0.15) / 100) * 100;
  assert.equal(quote.discount?.amount, discount);
  assert.equal(quote.total, expected - discount);
  assert.equal(quote.total % 100, 0, "totals are whole dollars");
});

test("deep clean ignores recurring frequency and applies condition multiplier", () => {
  const quote = calculateQuote({ ...defaultQuoteInput, service: "deep", frequency: "weekly", condition: "heavy", sqft: 1000, bedrooms: 1, bathrooms: 1 });
  assert.equal(quote.input.frequency, "one-time");
  assert.equal(quote.discount, null);
  const labor = pricing.services.deep.base + pricing.services.deep.perBedroom + pricing.services.deep.perBathroom;
  const condition = quote.lines.find((l) => l.id === "condition");
  assert.equal(condition?.amount, Math.round((labor * 0.35) / 100) * 100);
});

test("office pricing uses restrooms and drops residential-only add-ons", () => {
  const quote = calculateQuote({ ...defaultQuoteInput, service: "office", restrooms: 3, sqft: 2600, frequency: "one-time", addOns: ["oven", "windows", "pets"] });
  assert.deepEqual(quote.input.addOns, ["windows"]);
  assert.ok(quote.lines.some((l) => l.id === "restrooms"));
  assert.ok(!quote.lines.some((l) => l.id === "bedrooms"));
  // 1600 extra sq ft → 4 blocks
  assert.equal(quote.lines.find((l) => l.id === "sqft")?.amount, 4 * pricing.services.office.perSqftBlock);
});

test("minimum charge is enforced", () => {
  const quote = calculateQuote({ ...defaultQuoteInput, service: "regular", bedrooms: 0, bathrooms: 1, sqft: 400, frequency: "weekly" });
  assert.equal(quote.minimumApplied, true);
  assert.equal(quote.total, pricing.minimumCharge);
});

test("out-of-range input is clamped, never trusted", () => {
  const quote = calculateQuote({ ...defaultQuoteInput, bedrooms: 99, bathrooms: -3, sqft: 1e9 });
  assert.equal(quote.input.bedrooms, pricing.limits.bedrooms.max);
  assert.equal(quote.input.bathrooms, pricing.limits.bathrooms.min);
  assert.equal(quote.input.sqft, pricing.limits.sqft.max);
});

test("starting prices and currency formatting", () => {
  assert.equal(startingPrice("regular"), 13000);
  assert.equal(formatCurrency(13000), "$130");
  assert.equal(formatCurrency(12345), "$123.45");
});

test("quote schema rejects unknown services and coerces numbers", () => {
  assert.equal(quoteInputSchema.safeParse({ ...defaultQuoteInput, service: "windows" }).success, false);
  const parsed = quoteInputSchema.safeParse({ ...defaultQuoteInput, bedrooms: "3" });
  assert.ok(parsed.success && parsed.data.bedrooms === 3);
});

test("contact schema validates US phone, ZIP, date and consent", () => {
  const valid = {
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan@example.com",
    phone: "(555) 010-0199",
    street: "100 Demo Street",
    unit: "",
    city: "Springfield",
    zip: "12345",
    preferredDate: earliestBookableDate(),
    timeWindow: "morning",
    accessNotes: "",
    consent: true,
    company: "",
  };
  assert.equal(contactDetailsSchema.safeParse(valid).success, true);
  assert.equal(contactDetailsSchema.safeParse({ ...valid, phone: "123" }).success, false);
  assert.equal(contactDetailsSchema.safeParse({ ...valid, zip: "ABCDE" }).success, false);
  assert.equal(contactDetailsSchema.safeParse({ ...valid, preferredDate: "2000-01-01" }).success, false);
  assert.equal(contactDetailsSchema.safeParse({ ...valid, consent: false }).success, false);
  assert.equal(contactDetailsSchema.safeParse({ ...valid, company: "bot" }).success, false);
});

test("dates: impossible and far-future dates are rejected", () => {
  const base = {
    firstName: "Jordan", lastName: "Lee", email: "jordan@example.com", phone: "(555) 010-0199",
    street: "100 Demo Street", unit: "", city: "Springfield", zip: "12345",
    timeWindow: "morning", accessNotes: "", consent: true, company: "",
  };
  const ok = (preferredDate: string) => contactDetailsSchema.safeParse({ ...base, preferredDate }).success;
  const nextYear = new Date().getFullYear() + 1;
  assert.equal(ok(`${nextYear}-02-31`), false, "Feb 31 doesn't exist");
  assert.equal(ok(`${nextYear + 5}-01-10`), false, "more than 12 months ahead");
  assert.equal(ok(earliestBookableDate()), true);
});

test("calculator matches hand-computed prices for each service (demo rates)", () => {
  // Regular, 3 bed / 2 bath / 1,600 sq ft, weekly, fridge add-on:
  // 95 + 3×15 + 2×20 + 2 blocks×15 + 35 = 245 → −20% (49) = 196
  const regular = calculateQuote({ ...defaultQuoteInput, service: "regular", bedrooms: 3, bathrooms: 2, sqft: 1600, frequency: "weekly", addOns: ["fridge"] });
  assert.equal(regular.subtotal, 24500);
  assert.equal(regular.total, 19600);

  // Deep, 3 bed / 2 bath / 1,600 sq ft, "lived in" (+15%): 175 + 75 + 70 + 50 = 370; 15% = 55.50 → rounded to whole dollars
  const deep = calculateQuote({ ...defaultQuoteInput, service: "deep", bedrooms: 3, bathrooms: 2, sqft: 1600, condition: "average", frequency: "one-time" });
  assert.equal(deep.lines.find((l) => l.id === "condition")?.amount, Math.round((37000 * 0.15) / 100) * 100);
  assert.equal(deep.total, 37000 + Math.round((37000 * 0.15) / 100) * 100);

  // Move-out, 2 bed / 1 bath / 1,000 sq ft, light: 210 + 60 + 40 = 310
  assert.equal(calculateQuote({ ...defaultQuoteInput, service: "move", bedrooms: 2, bathrooms: 1, sqft: 1000, condition: "light", frequency: "one-time" }).total, 31000);

  // Office, 2 restrooms / 2,200 sq ft, monthly: 130 + 50 + 3 blocks×22 = 246 → −10% (24.6 → 25) = 221
  const office = calculateQuote({ ...defaultQuoteInput, service: "office", restrooms: 2, sqft: 2200, frequency: "monthly" });
  assert.equal(office.subtotal, 24600);
  assert.equal(office.total, 24600 - 2500);
});
