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
- The homepage includes a prominently labeled demonstration gallery, without verified-review claims or aggregate rating markup. Genuine reviews are kept separately. No invented stock claims or prior prices; no advertising or analytics trackers.

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

Publish customer testimonials only with author permission and a documented verification process. Illustrative examples are identified visibly as fictitious and are never described as verified customer reviews.

## Outstanding before launch

Stripe, Vercel and Search Console credentials are not connected here, and no real or Stripe test payment has been executed. The header uses a typographic brand treatment inspired by the supplied logo; the original inline logo is not available as a local asset. All 19 JPG photographs from the ZIP are integrated. The material name Damasc Fine is provided by the merchant; legal business details remain required. The admin panel displays orders but does not manage stock, shipping or refunds.

## Reviews

The reviews section shows a clearly disclosed demonstration gallery followed by the invitation to submit genuine reviews. Once genuine reviews are available, they replace the examples. The accessible modal prepares a `mailto:` message; the customer must send it from their email app. It does not store or automatically publish submissions. After manually verifying a purchase and the publication consent, add only the public fields to `lib/reviews.ts`. Never include the private order reference.

## Current pricing and optional 86-minute offer

The selling price is 149 RON, with shipping included, sourced from `product.amount` in `lib/catalog.mjs`. The merchant has supplied the material name Damasc Fine. Public checkout labels use “Plată securizată cu cardul”; Stripe remains the actual provider and is accurately identified in the legal/privacy disclosures.

The merchant confirmed a reference price of 199 RON and a selling price of 149 RON. The product selector displays the struck-through reference price and a rounded 25% discount (actual reduction approximately 25.13%). Both amounts scale with quantity. `REFERENCE_PRICE_RON` optionally overrides the confirmed catalog reference; an empty or absent value uses 199 RON. Any future override must reflect the actual reference price.

To enable the genuine visitor window, set `VISITOR_OFFER_ENABLED=true` and a cryptographically random `OFFER_SIGNING_SECRET` of at least 32 characters in Vercel's secure environment settings, then redeploy. Generate locally with `openssl rand -hex 32`; never commit or paste the value in chat. The window starts only once the store is configured to accept orders. The offer API signs an 86-minute deadline in an HttpOnly, SameSite cookie. Reloads retain it, including after expiry. Checkout checks the signature and expiry on the server before contacting Stripe. An optional global `OFFER_ENDS_AT` can close the window earlier.

This limits the time to **start** an online order. A checkout already opened in time may be completed on Stripe until that session expires. The mechanism does not reserve physical stock, does not claim scarcity, and cannot identify an anonymous visitor after they remove cookies or use another browser. The cookie lasts up to one year to retain the campaign's expiry. Keep the signing key stable; rotating it invalidates existing offers. A later campaign needs an intentional cookie/version migration rather than automatically resetting the deadline.

Checks: `node tests/promotion.mjs` tests the optional reference price and absolute deadline; `node tests/visitor-offer.mjs` tests the signed visitor window using isolated fixture settings and no Stripe payment requests.

## Photo review presentation and private preview

The public review gallery appears before the “Momente mici” invitation card. `lib/reviews.ts` contains the 41 display names supplied by the store owner, the supplied messages, and five-star ratings explicitly confirmed by the owner on 2026-11-11. Nine author/message pairings were explicitly supplied. There are 20 cards with text and 21 without text. Exactly three images are product photographs, labeled accordingly; they are not represented as customer photographs. No purchase-verification records have been supplied, so the cards do not display “Recenzie verificată”. Only add such a record after matching a submission to a genuine order. No aggregate review schema is added.

Both order cards show the same rating badge, calculated from the public review collection. The count and star fill update from the actual records. `/admin/recenzii-preview` remains protected and excluded from indexing, and previews the same published collection and badge.

The gallery initially displays three cards on mobile and eleven on desktop. “Vezi mai multe recenzii” loads three more on mobile or ten more on desktop (11 → 21 → 31 → 41), capped at the available records. Expanded cards remain visible across viewport changes. The gallery has no numerical pagination counters. Review text uses Georgia at 17px desktop and 16px mobile; author names are 18px desktop and 19px mobile.

The homepage hero uses the owner-supplied `public/images/hero-lenjerie-visinie.jpg`. Product variant photographs remain in `public/products/`.
