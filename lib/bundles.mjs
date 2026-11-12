import { colors, product, validateSelection } from "./catalog.mjs";

// Merchant delegated bundle pricing; savings compare with individual sets at 149 RON.
export const bundleOffers = [
  {
    id: "single",
    quantity: 1,
    amount: product.amount,
    label: "1 set",
    badge: "",
  },
  { id: "duo", quantity: 2, amount: 27900, label: "2 seturi", badge: "" },
  {
    id: "trio",
    quantity: 3,
    amount: 39900,
    label: "3 seturi",
    badge: "Recomandat",
  },
  {
    id: "family",
    quantity: 5,
    amount: 62900,
    label: "5 seturi",
    badge: "Cel mai mic preț / set",
  },
];

export function normalizeCart(input) {
  if (!input || typeof input !== "object") return null;
  if ("variants" in input) {
    if (
      !Array.isArray(input.variants) ||
      input.variants.length < 1 ||
      input.variants.length > 5 ||
      input.variants.some(
        (id) =>
          typeof id !== "string" || !colors.some((color) => color.id === id),
      )
    )
      return null;
    return { variants: [...input.variants] };
  }
  // Keep earlier single-color checkout links working.
  const previous = validateSelection(input);
  return previous
    ? { variants: Array(previous.quantity).fill(previous.color) }
    : null;
}

export function quoteCart(input) {
  const cart = normalizeCart(input);
  if (!cart) return null;
  const quantity = cart.variants.length;
  const bundle = bundleOffers.find((offer) => offer.quantity === quantity);
  const total = bundle?.amount ?? product.amount * quantity;
  const baseTotal = product.amount * quantity;
  const unitBase = Math.floor(total / quantity);
  const remainder = total % quantity;
  const items = [];
  cart.variants.forEach((id, index) => {
    const unitAmount = unitBase + (index < remainder ? 1 : 0);
    const existing = items.find(
      (item) => item.color.id === id && item.unitAmount === unitAmount,
    );
    if (existing) {
      existing.quantity++;
      existing.lineTotal += unitAmount;
    } else
      items.push({
        color: colors.find((color) => color.id === id),
        quantity: 1,
        unitAmount,
        lineTotal: unitAmount,
      });
  });
  return {
    variants: cart.variants,
    quantity,
    total,
    baseTotal,
    savings: baseTotal - total,
    bundleId: bundle?.id ?? "standard",
    label: quantity === 1 ? "1 set" : `Pachet de ${quantity} seturi`,
    items,
    signature: `${cart.variants.join("-")}:${total}`,
  };
}

export function orderVariants(metadata) {
  if (!metadata?.variants) return [];
  const quote = quoteCart({ variants: metadata.variants.split(",") });
  return (
    quote?.items.map((item) => ({
      name: item.color.name,
      quantity: item.quantity,
    })) ?? []
  );
}
