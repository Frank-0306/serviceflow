import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Demo: crawlers are asked not to index the site (the company is fictional).
 * For a real client launch, change `disallow` to "/api/" and set robots.index to true in layout.tsx.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
