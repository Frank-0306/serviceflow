import Link from "next/link";

/** Wordmark: the serif name with a small arc mark suggesting a nest. */
export function Logo({ inverse = false, onClick }: { inverse?: boolean; onClick?: () => void }) {
  const color = inverse ? "text-ivory" : "text-navy";
  return (
    <Link href="/" onClick={onClick} className={`inline-flex items-center gap-2.5 ${color}`} aria-label="BrightNest Cleaning, home">
      <svg aria-hidden="true" viewBox="0 0 28 28" className="h-7 w-7">
        <path d="M4 15a10 10 0 0 0 20 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 15a5.5 5.5 0 0 0 11 0" fill="none" stroke="var(--color-sage)" strokeWidth="1.6" />
        <circle cx="14" cy="8.5" r="2" fill="var(--color-sage)" />
      </svg>
      <span className="font-serif text-[1.35rem] leading-none tracking-[-0.01em]">
        BrightNest
        <span className="ml-1.5 align-middle font-sans text-[0.72rem] tracking-[0.02em] opacity-70">Cleaning</span>
      </span>
    </Link>
  );
}
