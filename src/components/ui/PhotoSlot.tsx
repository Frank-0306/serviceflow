type Props = {
  /** What the final licensed photo should show. Shown on the slot and used as alt text. */
  brief: string;
  alt: string;
  tone?: "linen" | "sage" | "navy";
  className?: string;
};

/**
 * Clearly labeled stand-in for photography.
 * Replace with <Image src=... /> once licensed photos are available
 * (see README → "Replacing placeholder photos").
 */
export function PhotoSlot({ brief, alt, tone = "linen", className = "" }: Props) {
  const toneClass = tone === "sage" ? "photo-slot--sage" : tone === "navy" ? "photo-slot--navy" : "";
  const textClass = tone === "navy" ? "text-ivory/70" : "text-navy/60";

  return (
    <figure role="img" aria-label={alt} className={`photo-slot relative overflow-hidden ${toneClass} ${className}`}>
      <figcaption className={`absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-4 text-xs ${textClass}`}>
        <span className="max-w-[24ch] leading-snug">{brief}</span>
        <span className="shrink-0 border border-current/30 px-1.5 py-0.5 text-[0.7rem]">Photo placeholder</span>
      </figcaption>
    </figure>
  );
}
