/**
 * Site-wide settings for the BrightNest Cleaning demo.
 *
 * BrightNest is a fictional company created for a portfolio project.
 * Contact details use reserved, non-working values on purpose:
 * - 555-01xx numbers are reserved for fictional use in North America.
 * - The .example domain is reserved by IANA (RFC 2606) and cannot receive mail.
 */
export const site = {
  name: "BrightNest Cleaning",
  project: "ServiceFlow",
  tagline: "Residential cleaning, priced up front.",
  description:
    "BrightNest Cleaning is a fictional residential cleaning company built as a portfolio demo. Get an instant estimate for regular, deep, move-in/move-out or office cleaning and request a visit online.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: {
    display: "(555) 010-0142",
    href: "tel:+15550100142",
  },
  email: "hello@brightnest.example",
  hours: [
    { days: "Monday to Friday", time: "8:00 a.m. – 6:00 p.m." },
    { days: "Saturday", time: "9:00 a.m. – 2:00 p.m." },
    { days: "Sunday", time: "Closed" },
  ],
  serviceArea: "Demo service area — no real locations are served.",
  demoNotice:
    "Portfolio demo. BrightNest Cleaning is a fictional company; prices, contact details and availability are illustrative.",
} as const;

export const navigation = [
  { href: "/services", label: "Services" },
  { href: "/quote", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
