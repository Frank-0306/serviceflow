import {
  ADD_ON_IDS,
  type AddOnId,
  type ConditionId,
  type FrequencyId,
  type ServiceId,
  labels,
  pricing,
} from "../config/pricing";

export type QuoteInput = {
  service: ServiceId;
  bedrooms: number;
  bathrooms: number;
  restrooms: number;
  sqft: number;
  condition: ConditionId;
  frequency: FrequencyId;
  addOns: AddOnId[];
};

export type QuoteLine = {
  id: string;
  label: string;
  detail?: string;
  amount: number;
};

export type Quote = {
  input: QuoteInput;
  lines: QuoteLine[];
  subtotal: number;
  discount: { label: string; rate: number; amount: number } | null;
  minimumApplied: boolean;
  total: number;
  laborHours: { min: number; max: number };
  crewSize: number;
};

export const defaultQuoteInput: QuoteInput = {
  service: "regular",
  bedrooms: 2,
  bathrooms: 2,
  restrooms: 2,
  sqft: 1200,
  condition: "average",
  frequency: "biweekly",
  addOns: [],
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

const roundToHalf = (value: number) => Math.round(value * 2) / 2;
/** Percentage-based lines are rounded to whole dollars so prices read cleanly. */
const roundToDollar = (cents: number) => Math.round(cents / 100) * 100;

/** Brings any input inside the configured limits and drops options that don't apply. */
export function normalizeQuoteInput(input: QuoteInput): QuoteInput {
  const rate = pricing.services[input.service];
  const { limits } = pricing;
  const addOns = Array.from(new Set(input.addOns)).filter(
    (id) => ADD_ON_IDS.includes(id) && (rate.kind === "residential" || pricing.addOns[id].office),
  );

  return {
    service: input.service,
    bedrooms: clamp(input.bedrooms, limits.bedrooms.min, limits.bedrooms.max),
    bathrooms: clamp(input.bathrooms, limits.bathrooms.min, limits.bathrooms.max),
    restrooms: clamp(input.restrooms, limits.restrooms.min, limits.restrooms.max),
    sqft: clamp(input.sqft, limits.sqft.min, limits.sqft.max),
    condition: rate.usesCondition ? input.condition : "light",
    frequency: rate.allowsRecurring ? input.frequency : "one-time",
    addOns: ADD_ON_IDS.filter((id) => addOns.includes(id)),
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function calculateQuote(rawInput: QuoteInput): Quote {
  const input = normalizeQuoteInput(rawInput);
  const rate = pricing.services[input.service];
  const lines: QuoteLine[] = [];

  const extraSqft = Math.max(0, input.sqft - pricing.includedSqft);
  const sqftBlocks = Math.ceil(extraSqft / pricing.sqftBlock);

  lines.push({
    id: "base",
    label: `${labels.services[input.service]} visit`,
    detail: `Includes the first ${pricing.includedSqft.toLocaleString("en-US")} sq ft`,
    amount: rate.base,
  });

  let hours = rate.baseHours;

  if (rate.kind === "residential") {
    if (input.bedrooms > 0) {
      lines.push({
        id: "bedrooms",
        label: plural(input.bedrooms, "bedroom", "bedrooms"),
        detail: `${formatCurrency(rate.perBedroom)} each`,
        amount: input.bedrooms * rate.perBedroom,
      });
    }
    lines.push({
      id: "bathrooms",
      label: plural(input.bathrooms, "bathroom", "bathrooms"),
      detail: `${formatCurrency(rate.perBathroom)} each`,
      amount: input.bathrooms * rate.perBathroom,
    });
    hours += (input.bedrooms + input.bathrooms) * rate.hoursPerRoom + sqftBlocks * 0.5;
  } else {
    if (input.restrooms > 0) {
      lines.push({
        id: "restrooms",
        label: plural(input.restrooms, "restroom", "restrooms"),
        detail: `${formatCurrency(rate.perRestroom)} each`,
        amount: input.restrooms * rate.perRestroom,
      });
    }
    hours += sqftBlocks * rate.hoursPerBlock + input.restrooms * 0.3;
  }

  if (sqftBlocks > 0) {
    lines.push({
      id: "sqft",
      label: `Additional space, ${extraSqft.toLocaleString("en-US")} sq ft`,
      detail: `${plural(sqftBlocks, "block", "blocks")} of ${pricing.sqftBlock} sq ft at ${formatCurrency(rate.perSqftBlock)}`,
      amount: sqftBlocks * rate.perSqftBlock,
    });
  }

  if (rate.usesCondition) {
    const multiplier = pricing.conditionMultipliers[input.condition];
    if (multiplier > 1) {
      const labor = lines.reduce((sum, line) => sum + line.amount, 0);
      // Whole-number percent avoids float error (1.15 - 1 = 0.1499…, which rounded $55.50 down).
      const percent = Math.round((multiplier - 1) * 100);
      lines.push({
        id: "condition",
        label: `Condition: ${labels.conditions[input.condition].toLowerCase()}`,
        detail: `+${percent}% on the cleaning above`,
        amount: roundToDollar((labor * percent) / 100),
      });
      hours *= multiplier;
    }
  }

  for (const id of input.addOns) {
    const addOn = pricing.addOns[id];
    lines.push({ id: `addon-${id}`, label: labels.addOns[id], amount: addOn.price });
    hours += addOn.hours;
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const discountRate = pricing.frequencyDiscounts[input.frequency];
  const discount =
    discountRate > 0
      ? {
          label: `${labels.frequencies[input.frequency]} schedule`,
          rate: discountRate,
          amount: roundToDollar((subtotal * Math.round(discountRate * 100)) / 100),
        }
      : null;

  const afterDiscount = subtotal - (discount?.amount ?? 0);
  const minimumApplied = afterDiscount < pricing.minimumCharge;
  const total = Math.max(afterDiscount, pricing.minimumCharge);

  const crewSize = hours > 4 ? 2 : 1;

  return {
    input,
    lines,
    subtotal,
    discount,
    minimumApplied,
    total,
    laborHours: {
      min: Math.max(1, roundToHalf(hours * 0.9)),
      max: Math.max(1.5, roundToHalf(hours * 1.15)),
    },
    crewSize,
  };
}

/** Lowest price shown as "from $X" on marketing pages. */
export function startingPrice(service: ServiceId): number {
  return calculateQuote({
    ...defaultQuoteInput,
    service,
    bedrooms: 1,
    bathrooms: 1,
    restrooms: 1,
    sqft: pricing.includedSqft,
    condition: "light",
    frequency: "one-time",
    addOns: [],
  }).total;
}

const currencyFormatters = {
  whole: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  cents: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }),
};

export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars)
    ? currencyFormatters.whole.format(dollars)
    : currencyFormatters.cents.format(dollars);
}

export function formatHours({ min, max }: { min: number; max: number }): string {
  return min === max ? `about ${min} hours` : `${min}–${max} hours`;
}
