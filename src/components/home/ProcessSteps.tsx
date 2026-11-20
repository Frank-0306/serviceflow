const steps = [
  {
    title: "Price it online",
    body: "Choose the type of cleaning, set the rooms and size, and see a line-by-line estimate before you share any contact details.",
  },
  {
    title: "We confirm the details",
    body: "We review your request, confirm the date and arrival window, and flag anything that might change the price.",
  },
  {
    title: "Your cleaner arrives",
    body: "Within the window you chose, with supplies and equipment. You don't need to be home if you leave access notes.",
  },
  {
    title: "Walk through and pay",
    body: "Check the work, then pay after the visit. If something was missed, tell us within 24 hours and we'll come back.",
  },
];

/** Numbered because it is a real sequence. */
export function ProcessSteps({ inverse = false }: { inverse?: boolean }) {
  const muted = inverse ? "text-ivory/65" : "text-muted";
  const title = inverse ? "text-ivory" : "text-navy";
  const rule = inverse ? "border-ivory/20" : "border-line";
  return (
    <ol className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className={`border-t pt-5 ${rule}`}>
          <span className={`font-serif text-lg tabular-nums ${inverse ? "text-sage" : "text-moss"}`}>{index + 1}</span>
          <h3 className={`mt-3 font-serif text-[1.4rem] leading-snug ${title}`}>{step.title}</h3>
          <p className={`mt-3 leading-relaxed ${muted}`}>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
