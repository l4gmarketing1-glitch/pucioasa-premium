import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { colors } from "../lib/catalog.mjs";
const password = randomBytes(32).toString("hex");
const port = 3100,
  origin = `http://localhost:${port}`;
const server = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    env: {
      ...process.env,
      ADMIN_PASSWORD: password,
      ADMIN_USER: "admin",
      SITE_URL: origin,
      STORE_LIVE: "false",
    },
    stdio: "ignore",
  },
);
let browser;
try {
  let ready = false;
  for (let n = 0; n < 60; n++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, "server started");
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin, { waitUntil: "networkidle" });
  const primaryProduct = page.locator("#produs");
  const repeatProduct = page.locator("#comanda");
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator(".hero .eyebrow").count(), 0);
  assert.equal(await page.locator(".editorial").count(), 0);
  assert.equal(await repeatProduct.locator(".swatch").count(), 19);
  assert.equal(await repeatProduct.locator(".product-questions").count(), 0);
  assert.equal(await repeatProduct.locator(".checkout-trust").count(), 1);
  assert.equal(await repeatProduct.getByRole("link", { name: /Comandă telefonic/ }).getAttribute("href"), "tel:+40755436284");
  assert.ok(await page.evaluate(() => {
    const sections = [...document.querySelector('main').children];
    return sections[0].classList.contains('hero') && sections[1].id === 'produs' && sections[2].id === 'recenzii' && sections[3].id === 'comanda';
  }));
  assert.deepEqual(await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  }), []);
  assert.equal(await primaryProduct.locator(".swatch").count(), 19);
  assert.equal(await page.locator(".benefits").count(), 0);
  assert.equal(
    await page.locator("#produs #detalii .included-grid>div").count(),
    4,
  );
  assert.equal(await page.locator("#produs #intrebari details").count(), 4);
  assert.equal(
    await page
      .locator("body")
      .getByText(/Nuanța \d/)
      .count(),
    0,
  );
  await page
    .getByRole("button", { name: "Scrie o recenzie", exact: true })
    .click();
  const reviewDialog = page.getByRole("dialog");
  assert.ok(await reviewDialog.isVisible());
  assert.equal(
    await reviewDialog.locator("form").evaluate((form) => form.checkValidity()),
    false,
  );
  await reviewDialog
    .getByRole("radio", { name: "5 stele", exact: true })
    .check();
  await reviewDialog
    .getByLabel("Numele de afișat", { exact: true })
    .fill("Client test");
  await reviewDialog
    .getByLabel("Experiența ta", { exact: true })
    .fill("Text pentru verificarea formularului, fără publicare.");
  await reviewDialog.getByRole("checkbox").check();
  assert.equal(
    await reviewDialog.locator("form").evaluate((form) => form.checkValidity()),
    true,
  );
  await reviewDialog
    .getByRole("button", { name: "Pregătește emailul" })
    .click();
  await page.screenshot({ path: "/tmp/pucioasa-review-dialog.png" });
  assert.match(
    await reviewDialog.getByRole("status").innerText(),
    /doar după ce trimiți mesajul/,
  );
  const reviewEmail = await reviewDialog
    .getByRole("link", { name: "Deschide aplicația de email" })
    .getAttribute("href");
  assert.ok(reviewEmail.startsWith("mailto:contact@pucioasa-premium.ro?"));
  assert.match(new URL(reviewEmail).searchParams.get("body"), /Evaluare: 5\/5/);
  await reviewDialog
    .getByLabel("Experiența ta", { exact: true })
    .fill("O altă opinie de test care trebuie pregătită din nou.");
  assert.equal(
    await reviewDialog
      .getByRole("link", { name: "Deschide aplicația de email" })
      .count(),
    0,
  );
  await page.keyboard.press("Escape");
  assert.equal(await reviewDialog.isVisible(), false);
  assert.equal(
    await page
      .getByRole("button", { name: "Scrie o recenzie", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page
    .locator("#recenzii")
    .screenshot({ path: "/tmp/pucioasa-recenzii.png" });
  await page.getByText("Livrare & transport", { exact: true }).click();
  assert.match(
    await page.locator("#intrebari details[open] p").innerText(),
    /48 de ore/,
  );
  await page.getByText("Livrare & transport", { exact: true }).click();
  for (let n = 1; n <= 19; n++) {
    await primaryProduct
      .getByRole("button", { name: `Alege ${colors[n - 1].name}`, exact: true })
      .click();
    await primaryProduct.locator(".product-photo img").evaluate((img) => img.decode());
    assert.equal(
      await primaryProduct.locator(".photo-caption").innerText(),
      colors[n - 1].name,
    );
    assert.match(
      await primaryProduct.locator(".product-photo img").getAttribute("src"),
      new RegExp(`(?:%2F|/)${n}\\.jpg`),
    );
  }
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await primaryProduct
      .getByRole("button", { name: "Alege Gri antracit", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await primaryProduct.getByRole("button", { name: "Mărește cantitatea" }).click();
  assert.match(await primaryProduct.locator(".price-row>strong").innerText(), /298/);
  await primaryProduct.locator(".buy").click();
  assert.match(await primaryProduct.locator(".form-error").innerText(), /Pregătim/);
  assert.match(await repeatProduct.locator(".price-row>strong").innerText(), /298/);
  assert.equal(await repeatProduct.locator(".photo-caption").innerText(), "Gri antracit");
  await repeatProduct.getByRole("button", { name: "Alege Verde mentă", exact: true }).click();
  assert.equal(await primaryProduct.locator(".photo-caption").innerText(), "Verde mentă");
  await repeatProduct.getByRole("button", { name: "Mărește cantitatea" }).click();
  assert.match(await primaryProduct.locator(".price-row>strong").innerText(), /447/);
  await repeatProduct.locator(".buy").click();
  assert.match(await repeatProduct.locator(".form-error").innerText(), /Pregătim/);
  await repeatProduct.screenshot({ path: "/tmp/pucioasa-comanda-desktop.png" });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/tmp/pucioasa-desktop.png", fullPage: true });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `no overflow at ${width}`,
    );
    await page.getByRole("button", { name: "Deschide meniul" }).click();
    await page.locator(".nav").getByText("Ce conține setul").click();
    assert.equal(
      await page
        .getByRole("button", { name: "Deschide meniul" })
        .getAttribute("aria-expanded"),
      "false",
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator("#recenzii")
    .screenshot({
      path: "/tmp/pucioasa-recenzii-mobil.png",
      style: ".mobile-buy { visibility: hidden; }",
    });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(".mobile-buy .primary").waitFor({ state: "visible" });
  await page.screenshot({ path: "/tmp/pucioasa-mobile.png", fullPage: false });
  await page
    .locator("#produs .product-info")
    .screenshot({
      path: "/tmp/pucioasa-selectie-mobil.png",
      style: ".mobile-buy { visibility: hidden; }",
    });
  await repeatProduct.screenshot({ path: "/tmp/pucioasa-comanda-mobil.png", style: ".mobile-buy { visibility: hidden; }" });
  assert.equal((await fetch(origin + "/admin")).status, 401);
  assert.equal((await fetch(origin + "/admin/recenzii-preview")).status,401);
  assert.equal(await page.locator('.review-demo-note').count(),1);
  assert.match(await page.locator('.review-demo-note').innerText(), /evaluările sunt fictive/);
  assert.equal(await page.locator('.photo-review-card').count(),3);
  assert.ok(await page.evaluate(()=>Boolean(document.querySelector('.reviews-showcase').compareDocumentPosition(document.querySelector('.review-invitation')) & Node.DOCUMENT_POSITION_FOLLOWING)));
  await page.getByRole('button',{name:/Încarcă mai multe recenzii/}).click();
  assert.equal(await page.locator('.photo-review-card').count(),6);
  assert.equal(await page.locator('.review-verified').count(),0);
  assert.equal(await page.locator('.review-demo-label').count(),0);
  assert.equal(await page.locator('.review-verification-demo').count(),0);
  const adminContext=await browser.newContext({httpCredentials:{username:'admin',password},viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const preview=await adminContext.newPage();
  const previewResponse=await preview.goto(origin+'/admin/recenzii-preview',{waitUntil:'networkidle'});
  assert.equal(previewResponse.status(),200);
  assert.match(previewResponse.headers()['x-robots-tag'],/noindex/);
  assert.match(await preview.locator('.review-demo-note').innerText(),/evaluările sunt fictive/);
  assert.equal(await preview.locator('.photo-review-card').count(),6);
  assert.equal(await preview.locator('.review-verified').count(),0);
  await preview.screenshot({path:'/tmp/pucioasa-demo-recenzii.png',fullPage:true});
  await preview.setViewportSize({width:390,height:844});
  await preview.waitForFunction(()=>document.querySelectorAll('.photo-review-card').length===3);
  assert.ok(await preview.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await preview.screenshot({path:'/tmp/pucioasa-demo-recenzii-mobil.png',fullPage:true});
  await preview.getByRole('button',{name:/Încarcă mai multe recenzii/}).click();
  assert.equal(await preview.locator('.photo-review-card').count(),6);
  await preview.setViewportSize({width:1440,height:1000});
  await preview.getByRole('button',{name:/Încarcă mai multe recenzii/}).click();
  assert.equal(await preview.locator('.photo-review-card').count(),12);
  await preview.setViewportSize({width:390,height:844});
  assert.equal(await preview.locator('.photo-review-card').count(),12);
  for(let batch=0;batch<10;batch++) await preview.getByRole('button',{name:/Încarcă mai multe recenzii/}).click();
  assert.equal(await preview.locator('.photo-review-card').count(),41);
  assert.equal(await preview.locator('.review-photo').count(),3);
  assert.equal(await preview.locator('.review-stars[aria-label="Evaluare demonstrativă: 5 din 5 stele"]').count(),41);
  assert.equal(await preview.locator('.review-verified').count(),0);
  assert.equal(await preview.locator('.review-verification-demo').count(),0);
  assert.equal(await preview.locator('.review-message').count(),31);
  assert.equal(await preview.locator('.photo-review-card').filter({hasNot:preview.locator('.review-message')}).count(),10);
  assert.equal(await preview.getByRole('button',{name:/Încarcă mai multe recenzii/}).count(),0);
  await adminContext.close();

  assert.equal(
    (
      await fetch(origin + "/admin", {
        headers: {
          Authorization:
            "Basic " + Buffer.from(`admin:${password}`).toString("base64"),
        },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await fetch(origin + "/api/checkout", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ color: "v01", quantity: 1 }),
      })
    ).status,
    503,
  );
  assert.equal(
    (
      await fetch(origin + "/api/checkout", {
        method: "POST",
        headers: {
          Origin: "https://untrusted.example",
          "Content-Type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  await page.goto(origin + "/comanda/succes?session_id=invalid");
  assert.match(await page.locator("h1").innerText(), /Nu putem confirma/);
  for (const slug of ["termeni", "livrare-retur", "confidentialitate"])
    assert.equal((await fetch(origin + "/informatii/" + slug)).status, 200);
  assert.match(
    await (await fetch(origin + "/robots.txt")).text(),
    /Disallow: \//,
  );
  assert.deepEqual(errors, [], "no browser runtime errors");
  console.log(
    "PASS: 19 variant images, persistence, quantity total, prelaunch feedback, 320/390px layouts, mobile menu, admin auth, checkout origin/config guards, false confirmation prevention, legal pages and prelaunch robots.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
