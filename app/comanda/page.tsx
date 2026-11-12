import Link from "next/link";
import CheckoutPage from "@/components/checkout-page";
import { colors, product, validateSelection } from "@/lib/catalog.mjs";
import { storeReady } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Finalizează comanda",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ culoare?: string; cantitate?: string }>;
}) {
  const query = await searchParams;
  const selection = validateSelection({
    color: query.culoare ?? "v04",
    quantity: Number(query.cantitate ?? 1),
  });
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
  const color = colors.find((item) => item.id === selection.color)!;
  return (
    <CheckoutPage
      color={color}
      quantity={selection.quantity}
      unitAmount={product.amount}
      ready={storeReady()}
      publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
    />
  );
}
