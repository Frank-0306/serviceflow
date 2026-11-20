"use client";

import { useId } from "react";

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit: { one: string; many: string };
  tone?: "light" | "dark";
};

/** − value + control. Buttons announce what they do; the value is announced politely when it changes. */
export function Stepper({ label, value, min, max, onChange, unit, tone = "light" }: StepperProps) {
  const id = useId();
  const dark = tone === "dark";
  const btn = `flex h-11 w-11 items-center justify-center rounded-[var(--radius-xs)] border text-lg leading-none transition-colors disabled:opacity-30 ${
    dark ? "border-ivory/25 text-ivory hover:border-ivory/70" : "border-line text-navy hover:border-navy/50 bg-paper"
  }`;

  return (
    <div role="group" aria-labelledby={`${id}-label`} className="flex items-center justify-between gap-4">
      <span id={`${id}-label`} className={`text-[0.95rem] ${dark ? "text-ivory/80" : "text-navy"}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${unit.many}`}>
          <span aria-hidden="true">−</span>
        </button>
        <output aria-live="polite" className={`w-10 text-center font-serif text-2xl tabular-nums ${dark ? "text-ivory" : "text-navy"}`}>
          {/* Browser translators (e.g. Chrome's) replace text nodes, which stops React from
              updating them. Keyed elements are recreated on change, so the value always updates. */}
          <span key={value} translate="no">
            {value}
          </span>
          <span key={`unit-${value}`} className="sr-only">
            {" "}
            {value === 1 ? unit.one : unit.many}
          </span>
        </output>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${unit.many}`}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}

type Choice<T extends string> = { value: T; label: string; note?: string };

type ChoiceListProps<T extends string> = {
  legend: string;
  name: string;
  value: T;
  options: Choice<T>[];
  onChange: (value: T) => void;
  columns?: 1 | 2 | 4;
  hideLegend?: boolean;
};

/** Native radio group styled as selectable rows. Arrow keys work out of the box. */
export function ChoiceList<T extends string>({ legend, name, value, options, onChange, columns = 2, hideLegend }: ChoiceListProps<T>) {
  const grid = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <fieldset>
      <legend className={hideLegend ? "sr-only" : "mb-3 text-sm font-medium text-navy"}>{legend}</legend>
      <div className={`grid gap-2 ${grid}`}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`relative flex cursor-pointer flex-col gap-0.5 rounded-[var(--radius-xs)] border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage ${
                checked ? "border-navy bg-navy text-ivory" : "border-line bg-paper text-navy hover:border-navy/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="text-[0.95rem] font-medium">{option.label}</span>
              {option.note && <span className={`text-xs ${checked ? "text-ivory/70" : "text-muted"}`}>{option.note}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type CheckListProps<T extends string> = {
  legend: string;
  values: T[];
  options: Choice<T>[];
  onChange: (values: T[]) => void;
};

export function CheckList<T extends string>({ legend, values, options, onChange }: CheckListProps<T>) {
  const toggle = (value: T) =>
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-navy">{legend}</legend>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 border-b border-line py-3 text-[0.95rem] text-ink">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sage ${
                  checked ? "border-moss bg-moss text-ivory" : "border-navy/30 bg-paper"
                }`}
              >
                {checked && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3">
                    <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
              <span className="flex-1">{option.label}</span>
              {option.note && <span className="text-sm tabular-nums text-muted">{option.note}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
