import test from "node:test";
import assert from "node:assert/strict";
import {
  checkoutParameters,
  stripeKeysMatch,
  isPaidStoreSession,
} from "../lib/checkout.mjs";
import { product } from "../lib/catalog.mjs";

test("custom checkout keeps pricing, variant IDs and free Romanian delivery server-controlled", () => {
  const params = checkoutParameters(
    { color: "v04", quantity: 2, amount: 1, currency: "usd" },
    "https://pucioasa-premium.ro",
  );
  assert.equal(params.ui_mode, "elements");
  assert.equal(params.line_items[0].price_data.unit_amount, 13950);
  assert.equal(params.line_items[0].quantity, 2);
  assert.equal(params.line_items[0].price_data.currency, "ron");
  assert.equal(params.metadata.color_id, "v04");
  assert.equal(params.metadata.color, "Bej nisipiu");
  assert.deepEqual(params.allowed_payment_method_types, ["card"]);
  assert.deepEqual(params.shipping_address_collection.allowed_countries, [
    "RO",
  ]);
  assert.equal(
    params.shipping_options[0].shipping_rate_data.fixed_amount.amount,
    0,
  );
  assert.equal(params.permissions.update_shipping_details, "client_only");
  assert.equal(
    params.return_url,
    "https://pucioasa-premium.ro/comanda/succes?session_id={CHECKOUT_SESSION_ID}",
  );
  assert.equal(params.success_url, undefined);
  assert.equal(params.cancel_url, undefined);
  assert.equal(params.phone_number_collection.enabled, true);
  assert.equal(params.adaptive_pricing.enabled, false);
});
test("custom checkout rejects invalid variants and quantities before constructing a payment", () => {
  for (const input of [
    null,
    { color: "missing", quantity: 1 },
    { color: "v04", quantity: 0 },
    { color: "v04", quantity: 6 },
    { color: "v04", quantity: 1.2 },
  ])
    assert.throws(() =>
      checkoutParameters(input, "https://pucioasa-premium.ro"),
    );
});
test("test and live Stripe keys cannot be mixed", () => {
  assert.equal(stripeKeysMatch("sk_test_fixture", "pk_test_fixture"), true);
  assert.equal(stripeKeysMatch("rk_live_fixture", "pk_live_fixture"), true);
  for (const keys of [
    ["", ""],
    ["sk_test_fixture", ""],
    ["sk_live_fixture", "pk_test_fixture"],
    ["sk_test_fixture", "pk_live_fixture"],
    ["not-a-key", "pk_test_fixture"],
  ])
    assert.equal(stripeKeysMatch(...keys), false);
});
test("payment confirmation requires the correct paid, completed store order and exact amount", () => {
  const paid = {
    metadata: { product_id: product.id, quantity: "2" },
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "ron",
    amount_total: 29800,
  };
  assert.equal(isPaidStoreSession(paid), true);
  for (const changed of [
    null,
    { ...paid, payment_status: "unpaid" },
    { ...paid, status: "open" },
    { ...paid, currency: "usd" },
    { ...paid, amount_total: 1 },
    { ...paid, metadata: { product_id: "other", quantity: "2" } },
    { ...paid, metadata: { product_id: product.id, quantity: "0" } },
    { ...paid, mode: "subscription" },
  ])
    assert.equal(isPaidStoreSession(changed), false);
});
