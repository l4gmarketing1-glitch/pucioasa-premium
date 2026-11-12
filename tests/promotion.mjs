import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Test-only deadline; an empty override exercises the confirmed catalog reference price.
const now = Date.now();
const deadline = new Date(now + 45 * 60 * 1000).toISOString();
const origin = 'http://localhost:3101';
const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3101'], {
  env: { ...process.env, SITE_URL: origin, STORE_LIVE: 'false', REFERENCE_PRICE_RON: '', OFFER_ENDS_AT: deadline },
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
  const product = page.locator('#produs');
  assert.match(await product.locator('.discount-line').innerText(),/199 lei/);
  assert.match(await product.locator('.discount-line').innerText(),/25%/);
  assert.ok(await product.getByRole('timer').isVisible());
  await product.getByRole('radio',{name:'2 seturi, 279 lei',exact:true}).check();
  assert.match(await product.locator('.discount-line').innerText(),/298 lei/);
  assert.match(await product.locator('.price-row>strong').innerText(),/279/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await product.getByRole('radio',{name:'1 set, 149 lei',exact:true}).check();
  await page.clock.fastForward(46*60*1000);
  assert.ok(await product.locator('.buy').isDisabled());
  assert.equal(await product.locator('.discount-line').count(),0);
  assert.equal(await product.getByRole('timer').count(),0);
  assert.match(await product.locator('.offer-ended').innerText(),/s-a încheiat/);
  await page.reload({waitUntil:'networkidle'});
  assert.ok(await product.locator('.buy').isDisabled(),'reloading does not reset the deadline');
  console.log('PASS: reference price, quantity totals, mobile promotion layout, expiry and no deadline reset.');
} finally { await browser?.close();server.kill('SIGTERM'); }
