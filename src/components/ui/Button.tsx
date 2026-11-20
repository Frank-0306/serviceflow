import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "inverse" | "outline" | "outline-inverse";

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-xs)] px-5 py-3.5 text-[0.95rem] font-medium tracking-[0.005em] transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-ivory hover:bg-navy-soft",
  inverse: "bg-ivory text-navy hover:bg-white",
  outline: "border border-navy/25 text-navy hover:border-navy",
  "outline-inverse": "border border-ivory/30 text-ivory hover:border-ivory",
};

/** Small chevron that nudges forward on hover; decorative, so hidden from assistive tech. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
    >
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

type LinkProps = {
  href: string;
  variant?: Variant;
  chevron?: boolean;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ href, variant = "primary", chevron = false, className = "", children }: LinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {chevron && <Chevron />}
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  chevron?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  chevron = false,
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent"
        />
      )}
      {children}
      {chevron && !loading && <Chevron />}
    </button>
  );
}
