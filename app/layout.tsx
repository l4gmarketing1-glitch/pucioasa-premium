import { product } from "@/lib/catalog.mjs";
import type { Metadata } from "next";
import "./globals.css";
import { siteUrl, storeReady } from "@/lib/store";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pucioasa Premium — Lenjerii de pat, 6 piese",
    template: "%s | Pucioasa Premium",
  },
  description: `Lenjerii de pat Pucioasa Premium: set de 6 piese, ${product.amount / 100} lei. Transport gratuit. Alege varianta potrivită dormitorului tău.`,
  robots: { index: storeReady(), follow: storeReady() },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  openGraph: {
    locale: "ro_RO",
    type: "website",
    siteName: "Pucioasa Premium",
    title: "Un dormitor în care abia aștepți să revii.",
    description: `Set de lenjerie de pat, 6 piese · ${product.amount / 100} lei · Transport gratuit`,
  },
};
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
