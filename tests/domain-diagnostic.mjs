import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const port = 3107;
const origin = `http://localhost:${port}`;
const alias = `http://127.0.0.1:${port}`;
const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  env: { ...process.env, SITE_URL: origin, STORE_LIVE: 'false' },
  stdio: 'ignore',
});
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin + '/diagnostic')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready);
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/diagnostic');
  await page.locator('[data-domain-status="matched"]').waitFor();
  await page.goto(alias + '/diagnostic');
  await page.locator('[data-domain-status="mismatch"]').waitFor();
  assert.match(await page.locator('[data-domain-status] .notice').innerText(), /Cerere neautorizată/);
  const body = await page.locator('[data-domain-status]').innerText();
  assert.ok(body.includes(origin));
  assert.ok(body.includes(alias));
  // No Stripe requests: accepted origins stop at the disabled-store guard.
  for (const route of ['/api/checkout', '/api/offer']) {
    for (const requestOrigin of [origin, alias, 'https://untrusted.example']) {
      const response = await fetch(origin + route, {
        method: 'POST',
        headers: { Origin: requestOrigin, 'Content-Type': 'application/json', 'X-Forwarded-Host': `localhost:${port}` },
        body: '{}',
      });
      assert.equal(response.status, requestOrigin === origin ? 503 : 403);
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: diagnostic compares actual browser origin, detects hostname mismatch, and checkout/offer still reject untrusted origins despite forwarded host headers. No Stripe requests.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
