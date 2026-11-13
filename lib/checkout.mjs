import { product } from "./catalog.mjs";
import { quoteCart, normalizeCart } from "./bundles.mjs";

export function checkoutParameters(input, origin) {
  const quote = quoteCart(input);
  if (!quote) throw new Error("Invalid selection");
  return {
    mode: "payment",
    invoice_creation: { enabled: false },
    ui_mode: "elements",
    locale: "ro",
    allowed_payment_method_types: ["card"],
    wallet_options: { link: { display: "never" } },
    adaptive_pricing: { enabled: false },
    billing_address_collection: "auto",
    shipping_address_collection: { allowed_countries: ["RO"] },
    permissions: { update_shipping_details: "client_only" },
    phone_number_collection: { enabled: true },
    line_items: quote.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: product.currency,
        unit_amount: item.unitAmount,
        product_data: {
          name: product.name,
          description: `Culoare: ${item.color.name} · 6 piese`,
          metadata: { product_id: product.id, color: item.color.id },
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: product.currency },
          display_name: "Transport gratuit",
        },
      },
    ],
    metadata: {
      product_id: product.id,
      color_id: quote.items.map((item) => item.color.id).join(","),
      color:
        quote.items.length === 1
          ? quote.items[0].color.name
          : quote.items
              .map((item) => `${item.color.name} × ${item.quantity}`)
              .join("; "),
      quantity: String(quote.quantity),
      cart_version: "bundle-v1",
      variants: quote.variants.join(","),
      bundle_id: quote.bundleId,
      expected_total: String(quote.total),
    },
    return_url: `${new URL(origin).origin}/comanda/succes?session_id={CHECKOUT_SESSION_ID}`,
  };
}

export function stripeKeysMatch(secretKey = "", publishableKey = "") {
  return ["test", "live"].some(
    (mode) =>
      (secretKey.startsWith(`sk_${mode}_`) ||
        secretKey.startsWith(`rk_${mode}_`)) &&
      publishableKey.startsWith(`pk_${mode}_`),
  );
}

export function isPaidStoreSession(session) {
  const quantity = Number(session?.metadata?.quantity);
  const isBundle = session?.metadata?.cart_version === "bundle-v1";
  const cart = isBundle
    ? normalizeCart({ variants: session.metadata.variants?.split(",") })
    : null;
  const expectedTotal = isBundle
    ? Number(session.metadata.expected_total)
    : product.amount * quantity;
  return Boolean(
    session?.metadata?.product_id === product.id &&
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid" &&
      session.currency === product.currency &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= 5 &&
      (!isBundle || cart?.variants.length === quantity) &&
      Number.isSafeInteger(expectedTotal) &&
      expectedTotal > 0 &&
      session.amount_total === expectedTotal,
  );
}
