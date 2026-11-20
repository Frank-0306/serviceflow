import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { site } from "@/config/site";
import { DemoBar } from "@/components/layout/DemoBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicOnly } from "@/components/layout/PublicOnly";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Residential cleaning, priced up front`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Residential cleaning, priced up front`,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary" },
  // Demo site: keep it out of search indexes. Set to true for a real client launch.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${newsreader.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 bg-navy px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <PublicOnly>
          <DemoBar />
          <SiteHeader />
        </PublicOnly>
        <main id="main" className="flex-1">
          {children}
        </main>
        <PublicOnly>
          <SiteFooter />
        </PublicOnly>
      </body>
    </html>
  );
}
