import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { randomUUID, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

// Local protocol/interaction fixtures; these are not real Stripe transactions.
const origin = "http://localhost:3103";
const password = randomBytes(32).toString("hex");
const requests = [];
let failCreate = false;
let paymentStatus = "paid";
let wrongAmount = false;
const fakeSession = () => ({
  id: "cs_test_local",
  object: "checkout.session",
  mode: "payment",
  status: "complete",
  payment_status: paymentStatus,
  currency: "ron",
  amount_total: wrongAmount ? 1 : 27900,
  metadata: {
    product_id: "lenjerie-6-piese",
    color: "Bej nisipiu",
    color_id: "v04",
    quantity: "2",
    cart_version: "bundle-v1",
    variants: "v04,v04",
    expected_total: "27900",
    bundle_id: "duo",
  },
  customer_details: {
    name: "Client Test",
    email: "client@example.invalid",
    phone: "+40755436284",
  },
  collected_information: {
    shipping_details: {
      name: "Client Test",
      address: {
        line1: "Strada Test 1",
        city: "Pucioasa",
        state: "Dambovita",
        postal_code: "135400",
        country: "RO",
      },
    },
  },
});
const fixture = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  requests.push({
    method: req.method,
    url: req.url,
    body,
    headers: req.headers,
  });
  res.setHeader("Content-Type", "application/json");
  if (req.method === "POST" && req.url === "/v1/checkout/sessions") {
    if (failCreate) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: {
            type: "invalid_request_error",
            message: "Fixture rejection",
          },
        }),
      );
      return;
    }
    res.end(
      JSON.stringify({
        id: "cs_test_local",
        object: "checkout.session",
        client_secret: "cs_test_local_secret_fixture",
        ui_mode: "elements",
      }),
    );
    return;
  }
  if (
    req.method === "GET" &&
    req.url === "/v1/checkout/sessions/cs_test_local"
  ) {
    res.end(JSON.stringify(fakeSession()));
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/v1/checkout/sessions?")) {
    res.end(
      JSON.stringify({
        object: "list",
        data: [fakeSession()],
        has_more: false,
      }),
    );
    return;
  }
  res.statusCode = 404;
  res.end(
    JSON.stringify({
      error: {
        type: "invalid_request_error",
        message: "Unknown test fixture endpoint",
      },
    }),
  );
});
await new Promise((resolve) => fixture.listen(0, "127.0.0.1", resolve));
const server = spawn(
  "node",
  [
    "--require",
    fileURLToPath(new URL("./fixtures/stripe-http.cjs", import.meta.url)),
    "node_modules/next/dist/bin/next",
    "start",
    "-p",
    "3103",
  ],
  {
    env: {
      ...process.env,
      STRIPE_FIXTURE_PORT: String(fixture.address().port),
      SITE_URL: origin,
      STORE_LIVE: "true",
      PRODUCT_CONFIRMED: "true",
      LEGAL_CONFIRMED: "true",
      STRIPE_SECRET_KEY: "sk_test_local_fixture",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_local_fixture",
      BUSINESS_NAME: "Test fixture",
      // Missing fiscal-code configuration must not block checkout activation.
      BUSINESS_CUI: "",
      BUSINESS_ADDRESS: "test",
      CONTACT_EMAIL: "test@example.invalid",
      DELIVERY_ESTIMATE: "48 de ore",
      RETURN_ADDRESS: "test",
      VISITOR_OFFER_ENABLED: "false",
      OFFER_ENDS_AT: "",
      ADMIN_USER: "admin",
      ADMIN_PASSWORD: password,
    },
    stdio: "ignore",
  },
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready);
  const diagnosticResponse = await fetch(origin + '/diagnostic');
  const diagnostic = await diagnosticResponse.text();
  assert.equal(diagnosticResponse.status, 200);
  assert.match(diagnosticResponse.headers.get('cache-control'), /no-store/);
  assert.match(diagnostic, /configurare completată/);
  assert.match(diagnostic, /autentificare disponibilă/);
  assert.match(diagnostic, /noindex/);
  for (const secret of [password, 'sk_test_local_fixture', 'Test fixture', 'test@example.invalid']) assert.ok(!diagnostic.includes(secret));
  const requestId = randomUUID();
  const send = (body, originHeader = origin) =>
    fetch(origin + "/api/checkout", {
      method: "POST",
      headers: { Origin: originHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const body = { color: "v04", quantity: 2, requestId, amount: 1 };
  assert.equal((await send(body, "https://untrusted.example")).status, 403);
  assert.equal((await send({ ...body, quantity: 6 })).status, 400);
  assert.equal((await send({ ...body, requestId: "bad" })).status, 400);
  assert.equal(requests.length, 0);
  const response = await send(body);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    (await response.json()).clientSecret,
    "cs_test_local_secret_fixture",
  );
  const params = new URLSearchParams(requests.at(-1).body);
  assert.equal(params.get("ui_mode"), "elements");
  assert.equal(params.get("wallet_options[link][display]"), "never");
  assert.equal(params.get("line_items[0][price_data][unit_amount]"), "13950");
  assert.equal(params.get("line_items[0][quantity]"), "2");
  assert.equal(
    params.get("shipping_address_collection[allowed_countries][0]"),
    "RO",
  );
  assert.equal(params.get("metadata[color]"), "Bej nisipiu");
  assert.equal(
    params.get("return_url"),
    origin + "/comanda/succes?session_id={CHECKOUT_SESSION_ID}",
  );
  const idempotency = requests.at(-1).headers["idempotency-key"];
  assert.ok(idempotency.includes(requestId));
  assert.ok(idempotency.startsWith("pp-checkout:no-link-v1:"));
  await send(body);
  assert.equal(requests.at(-1).headers["idempotency-key"], idempotency);
  assert.equal((await send({variants:[],requestId})).status,400);
  assert.equal((await send({variants:['v04','missing'],requestId})).status,400);
  await send({variants:['v04','v03','v12'],requestId,total:1,unitAmount:1});
  const mixed = new URLSearchParams(requests.at(-1).body);
  assert.equal(mixed.get('metadata[variants]'),'v04,v03,v12');
  assert.equal(mixed.get('metadata[expected_total]'),'39900');
  assert.equal(mixed.get('line_items[2][price_data][unit_amount]'),'13300');
  assert.equal(mixed.get('line_items[2][price_data][product_data][metadata][color]'),'v12');
  assert.notEqual(requests.at(-1).headers['idempotency-key'],idempotency);
  await send({variants:['v03','v03','v04','v12','v15'],requestId});
  const five = new URLSearchParams(requests.at(-1).body);
  assert.equal(five.get('metadata[expected_total]'),'62900');
  assert.equal(five.get('line_items[0][quantity]'),'2');
  assert.equal(five.get('line_items[0][price_data][unit_amount]'),'12580');
  failCreate = true;
  assert.equal((await send({ ...body, requestId: randomUUID() })).status, 502);
  failCreate = false;

  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Simulate only the SDK contract to test our form. No payment/card data is sent.
  await page.addInitScript(() => {
    window.__checkoutCalls = [];
    window.__checkoutResult = "decline";
    window.Stripe = () => ({
      elements() {},
      createToken() {},
      createPaymentMethod() {},
      confirmCardPayment() {},
      registerAppInfo() {},
      _registerWrapper() {},
      initCheckoutElementsSdk() {
        const session = {
          id: "cs_test_local",
          currency: "ron",
          status: { type: "open" },
          total: { total: { minorUnitsAmount: 27900, amount: "279.00" } },
        };
        return {
          on() {},
          changeAppearance() {},
          loadActions: async () => ({
            type: "success",
            actions: {
              getSession: () => session,
              confirm: async (args) => {
                window.__checkoutCalls.push(args);
                await new Promise((r) => setTimeout(r, 300));
                return window.__checkoutResult === "success"
                  ? {
                      type: "success",
                      session: {
                        ...session,
                        status: { type: "complete", paymentStatus: "paid" },
                      },
                    }
                  : {
                      type: "error",
                      error: { message: "Card refuzat pentru test." },
                    };
              },
            },
          }),
          createPaymentElement(options) {
            window.__paymentElementOptions = options;
            const handlers = {};
            return {
              on(event, handler) {
                handlers[event] = handler;
              },
              off(event) {
                delete handlers[event];
              },
              mount(target) {
                target.textContent =
                  "Simulare SDK exclusiv pentru testul automat.";
                setTimeout(() => handlers.ready?.(), 50);
              },
              update() {},
              destroy() {},
            };
          },
        };
      },
    });
  });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page
    .locator("#produs")
    .getByRole("radio", { name: "2 seturi, 279 lei", exact:true })
    .check();
  await page.locator("#produs .buy").click();
  await page.waitForURL("**/comanda?culori=v04%2Cv04");
  await page.waitForFunction(
    () => !document.querySelector(".checkout-pay").disabled,
  );
  assert.equal(await page.evaluate(() => window.__paymentElementOptions.wallets.link), "never");
  const firstCheckoutKey = requests.filter((r) => r.method === "POST").at(-1)
    .headers["idempotency-key"];
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(
    () => !document.querySelector(".checkout-pay").disabled,
  );
  assert.equal(
    requests.filter((r) => r.method === "POST").at(-1).headers[
      "idempotency-key"
    ],
    firstCheckoutKey,
    "reload reuses the same checkout session",
  );
  assert.match(await page.locator(".checkout-total dd").innerText(), /279/);
  const fill = async (name, value) =>
    page.locator(`[name="${name}"]`).fill(value);
  await fill("email", "client@example.invalid");
  await fill("phone", "0755436284");
  await fill("shippingName", "Client Test");
  await fill("shippingLine1", "Strada Test 1");
  await fill("shippingCity", "Pucioasa");
  await fill("shippingState", "Dambovita");
  await fill("shippingPostal", "135400");
  assert.equal(
    await page.locator("form").evaluate((form) => form.checkValidity()),
    false,
  );
  await page.locator('[name="terms"]').check();
  assert.equal(
    await page.locator("form").evaluate((form) => form.checkValidity()),
    true,
  );
  await page.locator('[name="sameBilling"]').uncheck();
  assert.equal(
    await page.locator("form").evaluate((form) => form.checkValidity()),
    false,
  );
  await fill("billingName", "Facturare Test");
  await fill("billingLine1", "Strada Facturare 2");
  await fill("billingCity", "Bucuresti");
  await fill("billingState", "Sector 1");
  await fill("billingPostal", "010001");
  await page.locator(".checkout-pay").dblclick();
  await page
    .getByRole("alert")
    .filter({ hasText: "Card refuzat pentru test." })
    .waitFor();
  assert.equal(await page.evaluate(() => window.__checkoutCalls.length), 1);
  const args = await page.evaluate(() => window.__checkoutCalls[0]);
  assert.equal(args.email, "client@example.invalid");
  assert.equal(args.phoneNumber, "+40755436284");
  assert.equal(args.shippingAddress.address.country, "RO");
  assert.equal(args.shippingAddress.address.line1, "Strada Test 1");
  assert.equal(args.billingAddress.name, "Facturare Test");
  assert.equal(args.redirect, "if_required");
  assert.equal(
    await page.locator('[name="shippingName"]').inputValue(),
    "Client Test",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.evaluate(() => {
    window.__checkoutResult = "success";
  });
  await page.locator(".checkout-pay").click();
  await page.waitForURL("**/comanda/succes?session_id=cs_test_local");
  assert.match(await page.locator("h1").innerText(), /mulțumim/);
  paymentStatus = "unpaid";
  await page.reload();
  assert.match(await page.locator("h1").innerText(), /Verificăm plata/);
  paymentStatus = "paid";
  wrongAmount = true;
  await page.reload();
  assert.match(await page.locator("h1").innerText(), /Verificăm plata/);
  wrongAmount = false;
  const admin = await fetch(origin + "/admin", {
    headers: {
      Authorization:
        "Basic " + Buffer.from("admin:" + password).toString("base64"),
    },
  });
  const adminText = await admin.text();
  assert.equal(admin.status, 200);
  for (const value of [
    "Client Test",
    "client@example.invalid",
    "Strada Test 1",
    "Bej nisipiu",
  ])
    assert.ok(adminText.includes(value));
  assert.deepEqual(errors, []);
  console.log(
    "PASS (local Stripe fixtures, not real payments): custom session API, server prices, idempotency, failure handling, contact/shipping/billing transfer, double-click protection, retry preservation, server-confirmed success and admin details.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise((resolve) => fixture.close(resolve));
}
