import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/store";
import { indexingAllowed } from "@/lib/seo.mjs";
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingAllowed()
      ? {
          userAgent: "*",
          allow: "/",
          // Checkout/diagnostic remain crawlable so their noindex can be read.
          disallow: ["/admin", "/api/"],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
