/**
 * Demo pricing configuration.
 *
 * Every amount is in US cents (integers) to avoid floating-point rounding.
 * Change these values to re-price the whole site: the calculator, the
 * "from" prices on service pages and the server-side estimate all read
 * from this file.
 */

export const SERVICE_IDS = ["regular", "deep", "move", "office"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const FREQUENCY_IDS = ["one-time", "weekly", "biweekly", "monthly"] as const;
export type FrequencyId = (typeof FREQUENCY_IDS)[number];

export const CONDITION_IDS = ["light", "average", "heavy"] as const;
export type ConditionId = (typeof CONDITION_IDS)[number];

export const ADD_ON_IDS = [
  "oven",
  "fridge",
  "windows",
  "cabinets",
  "laundry",
  "pets",
] as const;
export type AddOnId = (typeof ADD_ON_IDS)[number];

type ResidentialRate = {
  kind: "residential";
  base: number;
  perBedroom: number;
  perBathroom: number;
  /** Price per started block of square feet above `includedSqft`. */
  perSqftBlock: number;
  /** Labor hours used for the time estimate. */
  baseHours: number;
  hoursPerRoom: number;
  usesCondition: boolean;
  allowsRecurring: boolean;
};

type CommercialRate = {
  kind: "commercial";
  base: number;
  perRestroom: number;
  perSqftBlock: number;
  baseHours: number;
  hoursPerBlock: number;
  usesCondition: boolean;
  allowsRecurring: boolean;
};

export type ServiceRate = ResidentialRate | CommercialRate;

export const pricing = {
  currency: "USD",
  minimumCharge: 12000,
  includedSqft: 1000,
  sqftBlock: 500,
  services: {
    regular: {
      kind: "residential",
      base: 9500,
      perBedroom: 1500,
      perBathroom: 2000,
      perSqftBlock: 1500,
      baseHours: 2,
      hoursPerRoom: 0.4,
      usesCondition: false,
      allowsRecurring: true,
    },
    deep: {
      kind: "residential",
      base: 17500,
      perBedroom: 2500,
      perBathroom: 3500,
      perSqftBlock: 2500,
      baseHours: 3.5,
      hoursPerRoom: 0.75,
      usesCondition: true,
      allowsRecurring: false,
    },
    move: {
      kind: "residential",
      base: 21000,
      perBedroom: 3000,
      perBathroom: 4000,
      perSqftBlock: 3000,
      baseHours: 4,
      hoursPerRoom: 0.85,
      usesCondition: true,
      allowsRecurring: false,
    },
    office: {
      kind: "commercial",
      base: 13000,
      perRestroom: 2500,
      perSqftBlock: 2200,
      baseHours: 2.5,
      hoursPerBlock: 0.6,
      usesCondition: false,
      allowsRecurring: true,
    },
  } satisfies Record<ServiceId, ServiceRate>,

  /** Fractional discount applied to the subtotal for recurring visits. */
  frequencyDiscounts: {
    "one-time": 0,
    weekly: 0.2,
    biweekly: 0.15,
    monthly: 0.1,
  } satisfies Record<FrequencyId, number>,

  /** Multiplier on the labor portion for deep and move-out cleans. */
  conditionMultipliers: {
    light: 1,
    average: 1.15,
    heavy: 1.35,
  } satisfies Record<ConditionId, number>,

  /** `office: false` hides the add-on for office cleaning. */
  addOns: {
    oven: { price: 3500, hours: 0.5, office: false },
    fridge: { price: 3500, hours: 0.5, office: true },
    windows: { price: 4500, hours: 0.75, office: true },
    cabinets: { price: 4000, hours: 0.75, office: true },
    laundry: { price: 2500, hours: 0.5, office: false },
    pets: { price: 3000, hours: 0.5, office: false },
  } satisfies Record<AddOnId, { price: number; hours: number; office: boolean }>,

  limits: {
    bedrooms: { min: 0, max: 8 },
    bathrooms: { min: 1, max: 6 },
    restrooms: { min: 0, max: 10 },
    sqft: { min: 300, max: 10000 },
  },
} as const;

export const labels = {
  services: {
    regular: "Regular cleaning",
    deep: "Deep cleaning",
    move: "Move-in / move-out",
    office: "Office cleaning",
  } satisfies Record<ServiceId, string>,
  frequencies: {
    "one-time": "One time",
    weekly: "Weekly",
    biweekly: "Every two weeks",
    monthly: "Monthly",
  } satisfies Record<FrequencyId, string>,
  conditions: {
    light: "Well kept",
    average: "Lived in",
    heavy: "Needs extra attention",
  } satisfies Record<ConditionId, string>,
  addOns: {
    oven: "Inside the oven",
    fridge: "Inside the fridge",
    windows: "Interior windows",
    cabinets: "Inside cabinets",
    laundry: "Wash and fold, one load",
    pets: "Pet hair treatment",
  } satisfies Record<AddOnId, string>,
} as const;
