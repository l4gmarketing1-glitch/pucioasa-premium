import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Test-only offer values: these are not merchant price history or a live promotion.
const now = Date.now();
const deadline = new Date(now + 45 * 60 * 1000).toISOString();
const origin = 'http://localhost:3101';
const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3101'], {
  env: { ...process.env, SITE_URL: origin, STORE_LIVE: 'false', REFERENCE_PRICE_RON: '235', OFFER_ENDS_AT: deadline },
  stdio: 'ignore',
});
let browser;
try {
  let ready = false;
  for (let i=0;i<60;i++) {
    try { if ((await fetch(origin)).ok) { ready=true;break; } } catch {}
    await new Promise(r=>setTimeout(r,500));
  }
  assert.ok(ready);
  browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:320,height:844},reducedMotion:'reduce'});
  await page.clock.install({time: new Date(now)});
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.match(await page.locator('.discount-line').innerText(),/235 lei/);
  assert.match(await page.locator('.discount-line').innerText(),/37%/);
  assert.ok(await page.getByRole('timer').isVisible());
  await page.getByRole('button',{name:'Mărește cantitatea'}).click();
  assert.match(await page.locator('.discount-line').innerText(),/470 lei/);
  assert.match(await page.locator('.price-row>strong').innerText(),/298/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.clock.fastForward(46*60*1000);
  assert.ok(await page.locator('.buy').isDisabled());
  assert.equal(await page.locator('.discount-line').count(),0);
  assert.equal(await page.getByRole('timer').count(),0);
  assert.match(await page.locator('.offer-ended').innerText(),/s-a încheiat/);
  await page.reload({waitUntil:'networkidle'});
  assert.ok(await page.locator('.buy').isDisabled(),'reloading does not reset the deadline');
  console.log('PASS: reference price, quantity totals, mobile promotion layout, expiry and no deadline reset.');
} finally { await browser?.close();server.kill('SIGTERM'); }
