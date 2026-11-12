import { colors, product, validateSelection } from "./catalog.mjs";

export function checkoutParameters(input, origin) {
  const selection = validateSelection(input);
  if (!selection) throw new Error("Invalid selection");
  const color = colors.find((item) => item.id === selection.color);
  return {
    mode: "payment",
    ui_mode: "elements",
    locale: "ro",
    allowed_payment_method_types: ["card"],
    adaptive_pricing: { enabled: false },
    billing_address_collection: "auto",
    shipping_address_collection: { allowed_countries: ["RO"] },
    permissions: { update_shipping_details: "client_only" },
    phone_number_collection: { enabled: true },
    line_items: [
      {
        quantity: selection.quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.amount,
          product_data: {
            name: product.name,
            description: `Culoare: ${color.name} · 6 piese`,
            metadata: { product_id: product.id, color: color.id },
          },
        },
      },
    ],
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
      color_id: color.id,
      color: color.name,
      quantity: String(selection.quantity),
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
  return Boolean(
    session?.metadata?.product_id === product.id &&
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid" &&
      session.currency === product.currency &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= 5 &&
      session.amount_total === product.amount * quantity,
  );
}
