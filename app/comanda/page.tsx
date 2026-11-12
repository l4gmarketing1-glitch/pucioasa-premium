import Link from "next/link";
import CheckoutPage from "@/components/checkout-page";
import { quoteCart } from "@/lib/bundles.mjs";
import { storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Finalizează comanda",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    culoare?: string;
    cantitate?: string;
    culori?: string;
  }>;
}) {
  const query = await searchParams;
  const selection = quoteCart(
    query.culori !== undefined
      ? {
          variants:
            typeof query.culori === "string" ? query.culori.split(",") : [],
        }
      : {
          color: query.culoare ?? "v04",
          quantity: Number(query.cantitate ?? 1),
        },
  );
  if (!selection)
    return (
      <main className="message-page">
        <h1>Alege varianta dorită.</h1>
        <p>Revino la produs și selectează culoarea și cantitatea.</p>
        <Link className="primary" href="/#produs">
          Înapoi la produs
        </Link>
      </main>
    );
  return (
    <CheckoutPage
      cart={selection}
      ready={storeReady()}
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
    />
  );
}
