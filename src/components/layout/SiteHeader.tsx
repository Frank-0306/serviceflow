"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/config/site";
import { services } from "@/content/services";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [panelTop, setPanelTop] = useState(68);

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll, close on Escape and move focus into the panel while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The demo notice can sit above the header, so anchor the panel to the header's real bottom edge.
    setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 68);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-ivory/95 backdrop-blur-sm" : "border-b border-transparent bg-ivory"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[78rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="link-underline text-[0.93rem] text-ink/80 transition-colors hover:text-navy aria-[current=page]:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a href={site.phone.href} className="text-[0.93rem] tabular-nums text-ink/80 hover:text-navy">
            {site.phone.display}
          </a>
          <ButtonLink href="/quote" className="py-2.5">
            Get an estimate
          </ButtonLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex h-11 items-center gap-2 px-2 text-sm font-medium text-navy md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span key={String(open)}>{open ? "Close" : "Menu"}</span>
          <span aria-hidden="true" className="relative block h-2.5 w-5">
            <span
              className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`}
            />
          </span>
        </button>
      </div>
    </header>

      {/* Mobile menu: outside <header> because its backdrop-filter would trap a fixed child. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        style={{ top: panelTop }}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-navy text-ivory md:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-5 pb-10 pt-8 sm:px-8">
          <ul className="space-y-1">
            {navigation.map((item, index) => (
              <li key={item.href} className="animate-rise" style={{ animationDelay: `${index * 45}ms` }}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block py-2 font-serif text-[2.4rem] font-light leading-tight aria-[current=page]:text-sage"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-ivory/15 pt-6">
            <p className="mb-3 text-sm text-ivory/60">Services</p>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="text-ivory/90 hover:text-ivory">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto space-y-4 pt-10">
            <ButtonLink href="/quote" variant="inverse" className="w-full">
              Get an estimate
            </ButtonLink>
            <a href={site.phone.href} className="block text-center text-sm text-ivory/70">
              Call {site.phone.display} (demo number)
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
