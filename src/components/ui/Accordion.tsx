type Item = { q: string; a: string };

/** Native <details> accordion: keyboard and screen-reader friendly with no JavaScript. */
export function Accordion({ items, className = "" }: { items: Item[]; className?: string }) {
  return (
    <div className={`border-t border-line ${className}`}>
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left text-[1.05rem] font-medium text-navy [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="relative mt-1.5 h-3 w-3 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-3 after:w-px after:bg-current after:transition-transform after:duration-300 group-open:after:scale-y-0"
            />
          </summary>
          <p className="prose-measure pb-6 pr-10 leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
