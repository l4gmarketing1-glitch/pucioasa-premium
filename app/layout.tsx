import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/store";
import { brandName, homeSeo, indexingAllowed, socialImage } from "@/lib/seo.mjs";
export function generateMetadata(): Metadata {
  const index = indexingAllowed();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: homeSeo.title,
      template: "%s | Pucioasa Premium",
    },
    description: homeSeo.description,
    robots: {
      index, follow: index,
      googleBot: { index, follow: index, 'max-image-preview': 'large' },
    },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
    openGraph: {
      locale: "ro_RO",
      type: "website",
      siteName: brandName,
      title: homeSeo.title,
      description: homeSeo.description,
      images: [socialImage],
    },
    twitter: { card: 'summary_large_image', title: homeSeo.title, description: homeSeo.description, images: [socialImage.url] },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
