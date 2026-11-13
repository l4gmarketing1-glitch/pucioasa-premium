import { product, colors } from './catalog.mjs';
import { guideSlugs } from './guides.mjs';

export const brandName = 'Pucioasa Premium';
export const homeSeo = {
  title: 'Lenjerii de pat Pucioasa, 6 piese | Pucioasa Premium',
  description: `Lenjerii de pat Pucioasa din Damasc Fine: set de 6 piese, ${product.amount / 100} lei, 19 culori. Transport gratuit în România. Alege și combină culorile preferate.`,
};
export const socialImage = {
  url: '/brand/share-logo-v1.jpg', width: 1200, height: 630,
  alt: 'Pucioasa Premium — Lenjerii de pat',
  type: 'image/jpeg',
};
/** @type {Record<string, {title: string, description: string}>} */
export const informationPages = {
  termeni: {
    title: 'Termeni și condiții',
    description: 'Condițiile de cumpărare de la Pucioasa Premium: produse, prețuri, plata cu cardul, confirmarea comenzii și asistență pentru clienți.',
  },
  'livrare-retur': {
    title: 'Livrare gratuită și retur',
    description: 'Informații despre livrarea gratuită în România, termenul de livrare, dreptul de retragere în 14 zile, returnarea produselor și rambursare.',
  },
  confidentialitate: {
    title: 'Politica de confidențialitate',
    description: 'Cum folosește Pucioasa Premium datele pentru comenzi, plăți, livrare și emailuri. Informații despre furnizori, păstrarea datelor și drepturile tale.',
  },
};

export function siteOrigin(value = process.env.SITE_URL) {
  const url = new URL(value?.trim() || 'https://www.pucioasa-premium.ro');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    throw new Error('SITE_URL must be a public HTTP(S) origin without credentials');
  return url.origin;
}

export function indexingAllowed(env = process.env) {
  if (['STORE_LIVE', 'PRODUCT_CONFIRMED', 'LEGAL_CONFIRMED'].some(key => env[key] !== 'true')) return false;
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'production') return false;
  let url;
  try { url = new URL(siteOrigin(env.SITE_URL)); } catch { return false; }
  // Public search results must not point at development or Vercel preview hosts.
  return url.protocol === 'https:' && !/^(localhost|\[.*\]|\d+(\.\d+){3})$/.test(url.hostname) &&
    !/\.(localhost|local|test|invalid|vercel\.app)$/.test(url.hostname);
}

export function sitemapUrls(origin, enabled) {
  return enabled ? ['/', ...Object.keys(informationPages).map(slug => `/informatii/${slug}`), ...guideSlugs.map(slug => `/ghiduri/${slug}`)]
    .map(path => new URL(path, origin).href) : [];
}

export function productSchema(origin, acceptingOrders) {
  const url = new URL('/', origin).href;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#produs`,
    name: 'Lenjerie de pat Pucioasa Premium din Damasc Fine — 6 piese',
    url, sku: product.id, category: 'Lenjerii de pat', material: product.material,
    image: [new URL('/products/4.jpg', origin).href, ...colors.filter(c => c.id !== 'v04').map(c => new URL(c.image, origin).href)],
    description: 'Set de lenjerie de pat din Damasc Fine: un cearșaf de pilotă, un cearșaf de pat și patru fețe de pernă. Disponibil în 19 culori.',
    brand: { '@type': 'Brand', name: brandName },
    color: colors.map(c => c.name),
    ...(acceptingOrders ? { offers: {
      '@type': 'Offer', url, priceCurrency: 'RON', price: (product.amount / 100).toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: brandName, url },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'RON' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RO' },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy', applicableCountry: 'RO',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
        merchantReturnLink: new URL('/informatii/livrare-retur', origin).href,
      },
    } } : {}),
  };
  return schema;
}

export function serializeSchema(schema) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
