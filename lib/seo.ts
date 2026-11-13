import type { Metadata } from 'next';
import { brandName, socialImage } from './seo.mjs';

export function publicPageMetadata(origin: string, title: string, description: string, path: string): Metadata {
  const url = new URL(path, origin).href;
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website', locale: 'ro_RO', siteName: brandName,
      title, description, url, images: [socialImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [socialImage.url] },
  };
}
