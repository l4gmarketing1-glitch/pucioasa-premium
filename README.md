# Pucioasa Premium

Next.js storefront: 6-piece bedding set, 149 RON, 19 supplied photographs, free shipping in Romania and stated 48-hour delivery.

## Development

Node 24 and npm 11. Use the existing checkout; the cloud environment is already isolated.

```sh
npm ci
# Copy only if .env.local does not already exist:
cp .env.example .env.local
npm run dev
```

If the default npm cache is not writable, use `npm --cache /tmp/npm-cache ci`.

Validation: `npm test`, `npm run typecheck`, `npm run build`, then `npm start`.

## Implemented

- Responsive product page with all 19 original photographs and stable variant IDs v01–v19 matching supplied filenames. Session storage remembers the selected variant. Quantities 1–5; amount validated on the server.
- Hosted Stripe Checkout collects phone, email and Romanian delivery address. Free shipping. Confirmation verifies payment with Stripe.
- `/admin` uses HTTP Basic authentication with a random password of at least 32 characters. Paginated Stripe sessions show customer, delivery address, variant, quantity and payment state. No sample customer data.
- Orders remain in Stripe; there is no ephemeral local order database. The dashboard is read-only. Refunds are managed in Stripe Dashboard; initial Checkout payment state does not reflect later refunds or shipment state.
- SEO metadata, canonical, robots, sitemap, Product/Offer structured data and Search Console verification support. Indexing is disabled before launch configuration.
- No fabricated reviews, ratings, stock claims or previous prices. No advertising or analytics trackers.

## Vercel and Stripe setup

1. Import this repository into Vercel with the Next.js preset. Add `pucioasa-premium.ro`, configure the DNS records Vercel supplies and redirect www to the primary domain.
2. Set variables from `.env.example` through secure project settings, never in Git or chat. Production `SITE_URL` must be `https://pucioasa-premium.ro`.
3. Start with a Stripe test secret key. Configure Stripe branding, receipt emails, business information and payment settings. The SDK is Stripe 23 and uses `allowed_payment_method_types`.
4. Confirm product material, legal company name, CUI, business and return addresses, variant availability, and the ambiguous 25 cm sheet height. The page currently shows 180 × 200 cm, without the tolerance at the merchant's request.
5. Complete the draft policies in `app/informatii/[slug]/page.tsx`: return shipping costs, reimbursement process, carrier and retention periods. `LEGAL_CONFIRMED=true` confirms actual review; it does not complete these texts automatically.
6. Set `PRODUCT_CONFIRMED=true`, `LEGAL_CONFIRMED=true`, `STORE_LIVE=true` only after review. With the test key, verify a successful order, rejected payment, cancelled checkout and the complete order in admin. Then switch to the live key and redeploy.
7. Configure `ADMIN_USER` and a random `ADMIN_PASSWORD` of at least 32 characters. Use HTTPS and Vercel access protection. Basic auth supports one administrator; roles, password recovery and audit are not included.

No public Stripe key is needed for hosted checkout. This version reads Stripe directly and has no webhook. Automated stock changes, fulfillment, custom emails and invoices require a signed, idempotent webhook with persistent storage before those operations are added. Review stock handling before accepting sales; this version does not reserve inventory.

## Google Search Console

Verify the domain with Google's DNS TXT record, or verify a URL property using `GOOGLE_SITE_VERIFICATION`. After production launch, submit `https://pucioasa-premium.ro/sitemap.xml` and request indexing of the home page. Technical SEO does not guarantee indexing or ranking. Admin, API and payment confirmation pages are not intended for indexing.

## Genuine deadlines and reviews

`OFFER_ENDS_AT` is an optional absolute ISO timestamp with timezone for a real offer deadline. After expiry new checkout requests are rejected. Existing Stripe sessions can still complete until their own expiry; expire them in Stripe if a strict cutoff is required. Never use a resetting per-visitor countdown.

Publish only genuine reviews with author permission and a documented verification process. No demonstration reviews or ratings are published.

## Outstanding before launch

Stripe, Vercel and Search Console credentials are not connected here, and no real or Stripe test payment has been executed. The header uses a typographic brand treatment inspired by the supplied logo; the original inline logo is not available as a local asset. All 19 JPG photographs from the ZIP are integrated. The material name Damasc Fine is provided by the merchant; legal business details remain required. The admin panel displays orders but does not manage stock, shipping or refunds.

## Reviews

The reviews section shows an honest empty state until genuine reviews are available. The accessible modal prepares a `mailto:` message; the customer must send it from their email app. It does not store or automatically publish submissions. After manually verifying a purchase and the publication consent, add only the public fields to `lib/reviews.ts`. Never include the private order reference.

## Current pricing and optional 86-minute offer

The selling price is 149 RON, with shipping included, sourced from `product.amount` in `lib/catalog.mjs`. The merchant has supplied the material name Damasc Fine. Public checkout labels use “Plată securizată cu cardul”; Stripe remains the actual provider and is accurately identified in the legal/privacy disclosures.

`REFERENCE_PRICE_RON` must be an actual confirmed reference price. Leave it blank otherwise. A calculated comparison price is not evidence of a prior selling price; no 28% badge is active by default.

To enable the genuine visitor window, set `VISITOR_OFFER_ENABLED=true` and a cryptographically random `OFFER_SIGNING_SECRET` of at least 32 characters in Vercel's secure environment settings, then redeploy. Generate locally with `openssl rand -hex 32`; never commit or paste the value in chat. The window starts only once the store is configured to accept orders. The offer API signs an 86-minute deadline in an HttpOnly, SameSite cookie. Reloads retain it, including after expiry. Checkout checks the signature and expiry on the server before contacting Stripe. An optional global `OFFER_ENDS_AT` can close the window earlier.

This limits the time to **start** an online order. A checkout already opened in time may be completed on Stripe until that session expires. The mechanism does not reserve physical stock, does not claim scarcity, and cannot identify an anonymous visitor after they remove cookies or use another browser. The cookie lasts up to one year to retain the campaign's expiry. Keep the signing key stable; rotating it invalidates existing offers. A later campaign needs an intentional cookie/version migration rather than automatically resetting the deadline.

Checks: `node tests/promotion.mjs` tests the optional reference price and absolute deadline; `node tests/visitor-offer.mjs` tests the signed visitor window using isolated fixture settings and no Stripe payment requests.
