import Link from "next/link";
import { stripeClient } from "@/lib/store";
import { isPaidStoreSession } from "@/lib/checkout.mjs";
import GoogleAdsConversion from "@/components/google-ads-conversion";
export const metadata = {
  title: "Confirmare comandă",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let paid = false;
  let found = false;
  let conversion: { transactionId: string; value: number; currency: string } | null = null;
  if (session_id?.startsWith("cs_") && process.env.STRIPE_SECRET_KEY) {
    try {
      const session =
        await stripeClient().checkout.sessions.retrieve(session_id);
      found = session.metadata?.product_id === "lenjerie-6-piese";
      paid = isPaidStoreSession(session);
      if (paid && session.livemode && session.amount_total !== null && session.currency) {
        conversion = {
          transactionId: session.id,
          value: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
        };
      }
    } catch {}
  }
  return (
    <main className="message-page">
      {conversion && <GoogleAdsConversion {...conversion} />}
      <span className="eyebrow">PUCIOASA PREMIUM</span>
      <div className="success-icon">{paid ? "✓" : "○"}</div>
      <h1>
        {paid
          ? "Îți mulțumim pentru comandă."
          : found
            ? "Verificăm plata."
            : "Nu putem confirma această comandă."}
      </h1>
      <p>
        {paid
          ? "Plata a fost confirmată de Stripe. Comanda și adresa de livrare sunt înregistrate."
          : found
            ? "Plata nu este confirmată încă. Reîncarcă pagina peste câteva momente; nu este necesar să plătești din nou."
            : "Verifică linkul primit după plată sau contactează magazinul."}
      </p>
      <Link className="primary" href="/">
        Înapoi la magazin →
      </Link>
    </main>
  );
}
