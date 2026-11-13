import test from 'node:test';
import assert from 'node:assert/strict';
import { siteOrigin, indexingAllowed, sitemapUrls, productSchema, serializeSchema, homeSeo } from '../lib/seo.mjs';
const live = { STORE_LIVE: 'true', PRODUCT_CONFIRMED: 'true', LEGAL_CONFIRMED: 'true', SITE_URL: 'https://www.pucioasa-premium.ro', VERCEL_ENV: 'production' };

test('indexing depends on public launch and environment, not payment credentials', () => {
  assert.equal(indexingAllowed(live), true);
  for (const key of ['STORE_LIVE', 'PRODUCT_CONFIRMED', 'LEGAL_CONFIRMED']) {
    assert.equal(indexingAllowed({ ...live, [key]: 'false' }), false);
  }
  for (const VERCEL_ENV of ['preview', 'development']) assert.equal(indexingAllowed({ ...live, VERCEL_ENV }), false);
  for (const SITE_URL of ['http://localhost:3000', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://store.vercel.app', 'https://store.invalid', 'ftp://example.com', 'not a URL']) {
    assert.equal(indexingAllowed({ ...live, SITE_URL }), false, SITE_URL);
  }
});

test('canonicals and sitemap use one origin and only public URLs', () => {
  const origin = siteOrigin(' https://www.pucioasa-premium.ro/path?utm_source=test#product ');
  assert.equal(origin, live.SITE_URL);
  assert.throws(() => siteOrigin('https://user:password@example.com'));
  assert.deepEqual(sitemapUrls(origin, false), []);
  const urls = sitemapUrls(origin, true);
  assert.equal(urls.length, 4);
  assert.equal(new Set(urls).size, 4);
  assert.ok(urls.includes(`${origin}/informatii/livrare-retur`));
  assert.ok(urls.every(u => !/comanda|admin|api|diagnostic|\?/.test(u)));
});

test('product schema describes real catalog prices, photos and policies without invented stock or ratings', () => {
  const schema = productSchema(live.SITE_URL, true);
  assert.equal(schema.offers.price, '149.00');
  assert.equal(schema.offers.priceCurrency, 'RON');
  assert.equal(schema.offers.shippingDetails.shippingRate.value, 0);
  assert.equal(schema.offers.hasMerchantReturnPolicy.merchantReturnDays, 14);
  assert.equal(schema.offers.hasMerchantReturnPolicy.returnFees, 'https://schema.org/ReturnFeesCustomerResponsibility');
  assert.equal(schema.image.length, 19);
  assert.equal(new Set(schema.image).size, 19);
  assert.equal(schema.color.length, 19);
  assert.equal(schema.material, 'Damasc Fine');
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema.offers.availability, undefined);
  assert.equal(productSchema(live.SITE_URL, false).offers, undefined);
  assert.match(homeSeo.description, /149 lei/);
});

test('JSON-LD serialization cannot break out of its script element', () => {
  const value = { description: '</script><script>alert(1)</script>' };
  const encoded = serializeSchema(value);
  assert.ok(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded), value);
});
