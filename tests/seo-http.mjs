import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { guides } from '../lib/guides.mjs';
const canonical = 'https://www.pucioasa-premium.ro';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  for (const mode of ['production', 'preview', 'prelaunch']) {
    const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3105'], {
      env: { ...process.env, SITE_URL: canonical, VERCEL_ENV: mode === 'preview' ? 'preview' : 'production',
        STORE_LIVE: mode === 'prelaunch' ? 'false' : 'true', PRODUCT_CONFIRMED: 'true', LEGAL_CONFIRMED: 'true',
        // Public SEO remains available even if a payment credential is absent.
        STRIPE_SECRET_KEY: '', VISITOR_OFFER_ENABLED: 'false' },
      stdio: 'ignore',
    });
    const origin = 'http://localhost:3105';
    let page;
    try {
      let ready = false;
      for (let i = 0; i < 60; i++) {
        try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      assert.ok(ready, `${mode}: server ready`);
      page = await browser.newPage({ javaScriptEnabled: false });
      await page.goto(`${origin}/?utm_source=seo-test`);
      assert.match(await page.title(), /Lenjerii de pat Pucioasa, 6 piese/);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('a[href^="/ghiduri/"]').count(), 0, 'homepage has no guide links');
      assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).href, `${canonical}/`);
      assert.match(await page.locator('meta[name="description"]').getAttribute('content'), /Damasc Fine.*149 lei.*19 culori/);
      assert.equal(new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).href, `${canonical}/`);
      assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), 'ro_RO');
      assert.equal(await page.locator('meta[property="og:site_name"]').getAttribute('content'), 'Pucioasa Premium');
      assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image');
      const image = await page.locator('meta[property="og:image"]').getAttribute('content');
      assert.equal((await fetch(origin + new URL(image).pathname)).status, 200);
      const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
      const robots = await (await fetch(`${origin}/robots.txt`)).text();
      const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
      if (mode === 'production') {
        assert.match(robotsMeta, /^index, follow$/);
        assert.match(robots, /Allow: \/\n/);
        assert.ok(!robots.includes('Disallow: /comanda'));
        assert.equal((sitemap.match(/<loc>/g) || []).length, 9);
        const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
        assert.equal(schema.sku, 'lenjerie-6-piese');
        assert.equal(schema.offers, undefined, 'payment unavailable: no purchasable offer advertised');
      } else {
        assert.match(robotsMeta, /noindex/);
        assert.match(robots, /Disallow: \/\n/);
        assert.equal((sitemap.match(/<loc>/g) || []).length, 0);
        assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
      }
      if (mode === 'production') {
        const descriptions = new Set();
        for (const slug of ['termeni', 'livrare-retur', 'confidentialitate']) {
          assert.equal((await page.goto(`${origin}/informatii/${slug}`)).status(), 200);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${canonical}/informatii/${slug}`);
          descriptions.add(await page.locator('meta[name="description"]').getAttribute('content'));
        }
        assert.equal(descriptions.size, 3);
        assert.equal((await page.goto(`${origin}/informatii/inexistent`)).status(), 404);
        for (const path of ['/comanda', '/comanda/succes', '/diagnostic']) {
          await page.goto(origin + path);
          assert.match(await page.locator('meta[name="robots"]').first().getAttribute('content'), /noindex/);
          assert.ok(!sitemap.includes(`${canonical}${path}`));
        }
      }
      for (const guide of guides) {
        const response = await page.goto(`${origin}/ghiduri/${guide.slug}`);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('h1').innerText(), guide.title);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${canonical}/ghiduri/${guide.slug}`);
        assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), guide.description);
        assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
        assert.equal(await page.locator('article section').count(), guide.sections.length + 1);
        assert.equal(await page.locator('a[href^="/ghiduri/"]').count(), guide.related.length);
        assert.ok(await page.locator('a[href="/#produs"]').count() > 0);
        if (mode === 'production') {
          assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /^index, follow$/);
          assert.ok(sitemap.includes(`${canonical}/ghiduri/${guide.slug}`));
          const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
          assert.equal(schema['@graph'][0].headline, guide.title);
          assert.equal(schema['@graph'][0]['@type'], 'Article');
          assert.equal(schema['@graph'][1]['@type'], 'BreadcrumbList');
          for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 960 });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${guide.slug}: no overflow at ${width}px`);
            if (width <= 390) assert.ok(await page.locator('table').evaluateAll(tables => tables.every(table => table.scrollWidth <= table.parentElement.clientWidth)), 'mobile tables are readable without horizontal clipping');
          }
          if (guide === guides[0]) {
            await page.screenshot({ path: '/tmp/pucioasa-guide-mobile.png', fullPage: true });
            await page.setViewportSize({ width: 1440, height: 1000 });
            await page.screenshot({ path: '/tmp/pucioasa-guide-desktop.png', fullPage: true });
          }
        } else {
          assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
          assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
        }
      }
      assert.equal((await page.goto(`${origin}/ghiduri/nu-exista`)).status(), 404);
      console.log(`PASS SEO: ${mode}, server-rendered metadata, canonical, robots, sitemap and structured data.`);
    } finally {
      await page?.close();
      const exit = new Promise(resolve => server.once('exit', resolve));
      server.kill('SIGTERM');
      await exit;
    }
  }
} finally { await browser.close(); }
