"use client";

import {
  ADD_ON_IDS,
  CONDITION_IDS,
  FREQUENCY_IDS,
  SERVICE_IDS,
  labels,
  pricing,
  type ServiceId,
} from "@/config/pricing";
import { formatCurrency, type QuoteInput } from "@/lib/quote";
import { ChoiceList, CheckList, Stepper } from "./Controls";

const serviceNotes: Record<ServiceId, string> = {
  regular: "Routine upkeep",
  deep: "Top to bottom, detail work",
  move: "Empty home, inside everything",
  office: "Small offices and studios",
};

const conditionNotes = {
  light: "Cleaned in the last month",
  average: "A few months of normal use",
  heavy: "Heavy buildup or long overdue",
} as const;

const frequencyNote = (id: (typeof FREQUENCY_IDS)[number]) => {
  const rate = pricing.frequencyDiscounts[id];
  return rate > 0 ? `${Math.round(rate * 100)}% off each visit` : "No commitment";
};

type Props = {
  value: QuoteInput;
  onChange: (value: QuoteInput) => void;
};

export function QuoteControls({ value, onChange }: Props) {
  const rate = pricing.services[value.service];
  const set = <K extends keyof QuoteInput>(key: K, next: QuoteInput[K]) => onChange({ ...value, [key]: next });
  const { limits } = pricing;

  const availableAddOns = ADD_ON_IDS.filter((id) => rate.kind === "residential" || pricing.addOns[id].office);

  return (
    <div className="space-y-10">
      <ChoiceList
        legend="Type of cleaning"
        name="service"
        value={value.service}
        onChange={(service) => set("service", service)}
        options={SERVICE_IDS.map((id) => ({ value: id, label: labels.services[id], note: serviceNotes[id] }))}
      />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-medium text-navy">
          <span key={rate.kind}>{rate.kind === "residential" ? "Your home" : "Your space"}</span>
        </legend>
        {rate.kind === "residential" ? (
          <>
            <Stepper
              label="Bedrooms"
              value={value.bedrooms}
              min={limits.bedrooms.min}
              max={limits.bedrooms.max}
              onChange={(n) => set("bedrooms", n)}
              unit={{ one: "bedroom", many: "bedrooms" }}
            />
            <Stepper
              label="Bathrooms"
              value={value.bathrooms}
              min={limits.bathrooms.min}
              max={limits.bathrooms.max}
              onChange={(n) => set("bathrooms", n)}
              unit={{ one: "bathroom", many: "bathrooms" }}
            />
          </>
        ) : (
          <Stepper
            label="Restrooms"
            value={value.restrooms}
            min={limits.restrooms.min}
            max={limits.restrooms.max}
            onChange={(n) => set("restrooms", n)}
            unit={{ one: "restroom", many: "restrooms" }}
          />
        )}

        <div className="pt-2">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="sqft" className="text-[0.95rem] text-navy">
              Approximate size
            </label>
            <span className="font-serif text-2xl tabular-nums text-navy">
              <span key={value.sqft} translate="no">
                {value.sqft.toLocaleString("en-US")}
              </span>
              <span className="ml-1 font-sans text-sm text-muted">sq ft</span>
            </span>
          </div>
          <input
            id="sqft"
            type="range"
            min={limits.sqft.min}
            max={rate.kind === "residential" ? 6000 : limits.sqft.max}
            step={100}
            value={value.sqft}
            onChange={(e) => set("sqft", Number(e.target.value))}
            aria-describedby="sqft-hint"
            className="mt-3 w-full accent-navy"
          />
          <p id="sqft-hint" className="mt-1 text-xs text-muted">
            The first {pricing.includedSqft.toLocaleString("en-US")} sq ft are included. Not sure? A rough guess is fine.
          </p>
        </div>
      </fieldset>

      {rate.usesCondition && (
        <ChoiceList
          legend="Current condition"
          name="condition"
          value={value.condition}
          onChange={(condition) => set("condition", condition)}
          columns={1}
          options={CONDITION_IDS.map((id) => {
            const m = pricing.conditionMultipliers[id];
            return {
              value: id,
              label: labels.conditions[id],
              note: `${conditionNotes[id]}${m > 1 ? `, +${Math.round((m - 1) * 100)}%` : ""}`,
            };
          })}
        />
      )}

      {rate.allowsRecurring ? (
        <ChoiceList
          legend="How often"
          name="frequency"
          value={value.frequency}
          onChange={(frequency) => set("frequency", frequency)}
          options={FREQUENCY_IDS.map((id) => ({ value: id, label: labels.frequencies[id], note: frequencyNote(id) }))}
        />
      ) : (
        <p className="border-l-2 border-sage pl-4 text-sm text-muted">
          {labels.services[value.service]} is a one-time service. Many customers follow it with a regular schedule.
        </p>
      )}

      <CheckList
        legend="Add-ons"
        values={value.addOns.filter((id) => availableAddOns.includes(id))}
        onChange={(addOns) => set("addOns", addOns)}
        options={availableAddOns.map((id) => ({
          value: id,
          label: labels.addOns[id],
          note: `+${formatCurrency(pricing.addOns[id].price)}`,
        }))}
      />
    </div>
  );
}
