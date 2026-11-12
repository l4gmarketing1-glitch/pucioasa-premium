import test from "node:test";
import assert from "node:assert/strict";
import { bundleOffers, quoteCart, orderVariants } from "../lib/bundles.mjs";
import { checkoutParameters, isPaidStoreSession } from "../lib/checkout.mjs";

test("authorized bundles offer progressively lower unit prices and real savings", () => {
  let previousUnit = Infinity;
  const totals = { 1: 14900, 2: 27900, 3: 39900, 5: 62900 };
  for (const offer of bundleOffers) {
    const cart = quoteCart({
      variants: Array(offer.quantity).fill("v04"),
      amount: 1,
    });
    assert.equal(cart.total, totals[offer.quantity]);
    assert.ok(cart.total / cart.quantity < previousUnit);
    previousUnit = cart.total / cart.quantity;
    assert.equal(cart.savings, 14900 * cart.quantity - cart.total);
    assert.equal(
      cart.items.reduce(
        (sum, item) => sum + item.quantity * item.unitAmount,
        0,
      ),
      cart.total,
    );
  }
});
test("mixed colors remain identifiable with exact discounted Stripe totals", () => {
  const variants = ["v03", "v04", "v03", "v12", "v15"];
  const cart = quoteCart({ variants, quantity: 1, total: 1 });
  assert.equal(cart.total, 62900);
  assert.equal(cart.items.length, 4);
  assert.equal(cart.items[0].quantity, 2);
  assert.equal(cart.items[0].color.id, "v03");
  assert.deepEqual(cart.variants, variants);
  const params = checkoutParameters(
    { variants },
    "https://pucioasa-premium.ro",
  );
  assert.equal(
    params.line_items.reduce(
      (sum, item) => sum + item.quantity * item.price_data.unit_amount,
      0,
    ),
    62900,
  );
  assert.equal(params.metadata.quantity, "5");
  assert.equal(params.metadata.variants, variants.join(","));
  assert.equal(params.metadata.expected_total, "62900");
  assert.deepEqual(orderVariants(params.metadata), [
    { name: "Vișiniu", quantity: 2 },
    { name: "Bej nisipiu", quantity: 1 },
    { name: "Verde mentă", quantity: 1 },
    { name: "Ivoriu", quantity: 1 },
  ]);
});
test("cart validation never falls back from malformed variant arrays to a valid legacy selection", () => {
  for (const variants of [
    null,
    [],
    ["missing"],
    ["v04", null],
    "v04",
    Array(6).fill("v04"),
  ]) {
    assert.equal(quoteCart({ variants, color: "v04", quantity: 1 }), null);
  }
  assert.equal(quoteCart(null), null);
  assert.equal(quoteCart({ color: "v04", quantity: 4 }).total, 59600);
  assert.equal(quoteCart({ color: "v04", quantity: 2 }).total, 27900);
  assert.deepEqual(orderVariants({ color: "Bej nisipiu" }), []);
});
test("paid bundle confirmation uses the server-created price snapshot and complete variant list", () => {
  const params = checkoutParameters(
    { variants: ["v04", "v03", "v12"] },
    "https://pucioasa-premium.ro",
  );
  const paid = {
    metadata: params.metadata,
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "ron",
    amount_total: 39900,
  };
  assert.equal(isPaidStoreSession(paid), true);
  for (const changed of [
    { ...paid, amount_total: 44700 },
    { ...paid, payment_status: "unpaid" },
    { ...paid, metadata: { ...paid.metadata, variants: "v04,v03" } },
    { ...paid, metadata: { ...paid.metadata, variants: "v04,v03,missing" } },
    { ...paid, metadata: { ...paid.metadata, expected_total: "" } },
    { ...paid, metadata: { ...paid.metadata, expected_total: "NaN" } },
  ])
    assert.equal(isPaidStoreSession(changed), false);
  // A session created before a price change remains payable at its agreed amount.
  assert.equal(
    isPaidStoreSession({
      ...paid,
      amount_total: 39000,
      metadata: { ...paid.metadata, expected_total: "39000" },
    }),
    true,
  );
});
