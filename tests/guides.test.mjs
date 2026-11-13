import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { guides, getGuide, guideStructuredData } from '../lib/guides.mjs';
import { sitemapUrls } from '../lib/seo.mjs';
const origin = 'https://www.pucioasa-premium.ro';

test('all five guides have distinct metadata, existing photos and valid cross-links', async () => {
  assert.equal(guides.length, 5);
  for (const field of ['slug', 'title', 'metaTitle', 'description']) assert.equal(new Set(guides.map(g => g[field])).size, 5);
  const sitemap = sitemapUrls(origin, true);
  for (const guide of guides) {
    assert.equal(getGuide(guide.slug), guide);
    await access(new URL(`../public${guide.image}`, import.meta.url));
    assert.ok(sitemap.includes(`${origin}/ghiduri/${guide.slug}`));
    assert.equal(new Set(guide.sections.map(s => s.id)).size, guide.sections.length);
    for (const slug of guide.related) {
      assert.notEqual(slug, guide.slug);
      assert.ok(getGuide(slug), `related guide exists: ${slug}`);
    }
    assert.ok(guides.some(g => g.related.includes(guide.slug)), 'each guide has an incoming editorial link');
  }
  assert.equal(getGuide('constructor'), undefined);
  assert.equal(getGuide('unknown'), undefined);
});

test('article and breadcrumb schemas describe the visible guide, not extra products or reviews', () => {
  for (const guide of guides) {
    const schema = guideStructuredData(guide, origin);
    const article = schema['@graph'][0];
    assert.equal(article.headline, guide.title);
    assert.equal(article.description, guide.description);
    assert.equal(article.image[0], `${origin}${guide.image}`);
    assert.equal(article.mainEntityOfPage['@id'], `${origin}/ghiduri/${guide.slug}`);
    assert.equal(article.inLanguage, 'ro-RO');
    assert.equal(article.offers, undefined);
    assert.equal(article.aggregateRating, undefined);
    const crumbs = schema['@graph'][1].itemListElement;
    assert.equal(crumbs[0].item, `${origin}/`);
    assert.equal(crumbs[1].item, article.mainEntityOfPage['@id']);
  }
});
