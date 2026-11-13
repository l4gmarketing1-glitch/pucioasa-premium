import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/store';
import { indexingAllowed, sitemapUrls } from '@/lib/seo.mjs';
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteUrl, indexingAllowed()).map(url => ({ url }));
}
