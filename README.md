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

- Responsive product page with all 19 original photographs and stable variant IDs v01–v19 matching supplied filenames. Session storage remembers the selected package and colors. Choose 1, 2, 3 or 5 sets, with one color per set; totals are recalculated on the server.
- Custom checkout at `/comanda`, using Stripe Checkout Sessions (`ui_mode: elements`) and Payment Element. Our page collects contact and shipping details; the shipping address is also used for billing. Stripe-secured card fields handle payment data. Free shipping and price are enforced on the server. Confirmation verifies the paid session, product, currency and exact amount; retrying session creation uses an idempotency key.
- `/admin` uses HTTP Basic authentication with a random password of at least 32 characters. Paginated Stripe sessions show customer, delivery address, all selected colors with quantities, total and payment state. No sample customer data.
- Orders remain in Stripe; there is no ephemeral local order database. The dashboard is read-only. Refunds are managed in Stripe Dashboard; initial Checkout payment state does not reflect later refunds or shipment state.
- SEO metadata, canonical, robots, sitemap, Product/Offer structured data and Search Console verification support. Indexing is disabled before launch configuration.
- The homepage includes owner-supplied reviews and ratings, with purchase-verification labels based on the owner’s explicit confirmation. No aggregate rating markup, invented stock claims, advertising or analytics trackers.

## Vercel and Stripe setup

1. Import this repository into Vercel with the Next.js preset. Add `pucioasa-premium.ro` and its www variant, configure the DNS records Vercel supplies, and redirect the secondary hostname to the primary domain. The owner currently opens checkout on `www.pucioasa-premium.ro`.
2. Set variables from `.env.example` through secure project settings, never in Git or chat. Production `SITE_URL` must exactly match the final browser origin, currently `https://www.pucioasa-premium.ro`, without a checkout path or query string.
3. Start on a protected test deployment with matching `STRIPE_SECRET_KEY=sk_test_…` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…` from the same Stripe account. Configure receipt emails, business information and payment settings. The SDK is Stripe 23 with React Stripe.js 7 and Stripe.js 10. The session uses `ui_mode: elements` and `allowed_payment_method_types`. See [STRIPE_SETUP.md](STRIPE_SETUP.md) for the step-by-step Romanian guide.
4. Confirm product material, legal company name, CUI, business and return addresses, variant availability, and the ambiguous 25 cm sheet height. The page currently shows 180 × 200 cm, without the tolerance at the merchant's request.
5. Review the policies in `app/informatii/[slug]/page.tsx` before setting `LEGAL_CONFIRMED=true`. They use the merchant-supplied name/address, Fan Curier Express, customer-paid ordinary return shipping, seller-paid nonconformity remedies, withdrawal/refund timeframes and retention criteria. Confirm these match actual business practice. The flag records merchant review; it is not a compliance certification.
6. Set `PRODUCT_CONFIRMED=true`, `LEGAL_CONFIRMED=true`, `STORE_LIVE=true` only after review. With the test key, verify a successful order, rejected payment, cancelled checkout and the complete order in admin. Then switch to the matching live secret/public key pair and redeploy.
7. Configure `ADMIN_USER` and a random `ADMIN_PASSWORD` of at least 32 characters. Use HTTPS and Vercel access protection. Basic auth supports one administrator; roles, password recovery and audit are not included.

The public Stripe key is required for Payment Element and must be present at build time. Secret and public keys must both be test keys or both be live keys. Never share a secret key in chat or Git. The order dashboard reads Stripe directly. A signed webhook now supports optional Resend order emails and PDF order confirmations, using delivery markers in the existing Stripe session and Resend idempotency (no separate database); see [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md). These PDFs are not fiscal invoices. Stock changes, fulfillment and fiscal invoicing are not automated. Review stock handling before accepting sales; this version does not reserve inventory.

`BUSINESS_CUI` is displayed in the company information when configured, but is not a technical checkout activation requirement. The merchant remains responsible for the company disclosures; the product/legal confirmation flags and the other readiness checks still apply.

## Google Search Console

Verify the domain with Google's DNS TXT record, or verify a URL property using `GOOGLE_SITE_VERIFICATION`. After production launch, submit `https://www.pucioasa-premium.ro/sitemap.xml` and request indexing of the home page. Technical SEO does not guarantee indexing or ranking. Admin, API and payment confirmation pages are not intended for indexing.

## Genuine deadlines and reviews

`OFFER_ENDS_AT` is an optional absolute ISO timestamp with timezone for a real offer deadline. After expiry new checkout requests are rejected. Existing Stripe sessions can still complete until their own expiry; expire them in Stripe if a strict cutoff is required. Never use a resetting per-visitor countdown.

Publish customer testimonials only with author permission and a documented verification process. Illustrative examples are identified visibly as fictitious and are never described as verified customer reviews.

## Outstanding before launch

Stripe, Vercel and Search Console credentials are not connected here, and no real or Stripe test payment has been executed. The header uses a typographic brand treatment inspired by the supplied logo; the original inline logo is not available as a local asset. All 19 JPG photographs from the ZIP are integrated. The material name Damasc Fine is provided by the merchant. The owner supplied Pucioasa Premium as the trader name and confirmed the business/return address as Strada 8 Martie, fără număr, Pucioasa, județul Dâmbovița, România; these declarations have not been independently checked against a registry. Fiscal-code configuration is optional for checkout activation. Merchant review of the published information and policies remains required. The admin panel displays orders but does not manage stock, shipping or refunds.

## Reviews

The reviews section shows the owner-supplied collection followed by an invitation to submit further reviews. The accessible modal prepares a `mailto:` message; the customer must send it from their email app. It does not store or automatically publish submissions. After manually verifying a purchase and the publication consent, add only the public fields to `lib/reviews.ts`. Never include the private order reference.

## Current pricing and optional 86-minute offer

The selling price is 149 RON, with shipping included, sourced from `product.amount` in `lib/catalog.mjs`. The merchant has supplied the material name Damasc Fine. Public checkout labels use “Plată securizată cu cardul”; Stripe remains the actual provider and is accurately identified in the legal/privacy disclosures.

The merchant confirmed a reference price of 199 RON and a selling price of 149 RON. The product selector displays the struck-through reference price and a rounded 25% discount (actual reduction approximately 25.13%). This reference-price comparison applies to a single set. Bundles instead compare against the current individual price of 149 RON, so their additional savings are explicit. `REFERENCE_PRICE_RON` optionally overrides the confirmed catalog reference; an empty or absent value uses 199 RON. Any future override must reflect the actual reference price.

To enable the genuine visitor window, set `VISITOR_OFFER_ENABLED=true` and a cryptographically random `OFFER_SIGNING_SECRET` of at least 32 characters in Vercel's secure environment settings, then redeploy. Generate locally with `openssl rand -hex 32`; never commit or paste the value in chat. The window starts only once the store is configured to accept orders. The offer API signs an 86-minute deadline in an HttpOnly, SameSite cookie. Reloads retain it, including after expiry. Checkout checks the signature and expiry on the server before contacting Stripe. An optional global `OFFER_ENDS_AT` can close the window earlier.

This limits the time to **start** an online order. A checkout already opened in time may be completed on Stripe until that session expires. The mechanism does not reserve physical stock, does not claim scarcity, and cannot identify an anonymous visitor after they remove cookies or use another browser. The cookie lasts up to one year to retain the campaign's expiry. Keep the signing key stable; rotating it invalidates existing offers. A later campaign needs an intentional cookie/version migration rather than automatically resetting the deadline.

Checks: `node tests/promotion.mjs` tests the optional reference price and absolute deadline; `node tests/visitor-offer.mjs` tests the signed visitor window using isolated fixture settings and no Stripe payment requests.

## Photo review presentation and private preview

The public review gallery appears before the “Momente mici” invitation card. `lib/reviews.ts` contains the 41 display names supplied by the store owner, the supplied messages, and five-star ratings explicitly confirmed by the owner on 2026-11-11. Nine author/message pairings were explicitly supplied. There are 20 cards with text and 21 without text. Exactly three images are product photographs, labeled accordingly; they are not represented as customer photographs. On 2026-11-11, the owner explicitly confirmed having checked that all 41 reviews came from purchasers. Each record therefore includes `manual_order_match` verification attributed to `store_owner`, and displays “Recenzie verificată” with a checkmark beside the stars. This records the owner’s verification, not an independent audit by the assistant. Future verification records should only be added after a purchase check. No aggregate review schema is added.

Both order cards show the same rating badge, calculated from the public review collection. The count and star fill update from the actual records. `/admin/recenzii-preview` remains protected and excluded from indexing, and previews the same published collection and badge.

The gallery initially displays seven cards on mobile and eleven on desktop. “Vezi mai multe recenzii” loads seven more on mobile (7 → 14 → 21 → 28 → 35 → 41) or ten more on desktop (11 → 21 → 31 → 41), capped at the available records. Expanded cards remain visible across viewport changes. The gallery has no numerical pagination counters. Review text uses Georgia at 17px desktop and 16px mobile; author names are 18px desktop and 19px mobile.

The homepage hero uses the owner-supplied `public/images/hero-lenjerie-visinie.jpg`. Product variant photographs remain in `public/products/`.

## Custom checkout validation

`npm test` covers server-controlled prices, variant validation, matched test/live keys and paid-session validation. `node tests/browser.mjs` checks the prelaunch checkout, product summary and responsive layout. `node tests/checkout-integration.mjs` uses a local Stripe HTTP fixture and a simulated browser SDK to exercise session parameters, idempotency, retry behavior, automatic reuse of shipping details for billing, double-click protection, server confirmation and admin details. It does not send requests or payments to Stripe. `node tests/visitor-offer.mjs` checks that expired/missing offer tokens still prevent checkout.

A successful real Stripe sandbox payment, declined card and 3D Secure flow remain required after keys are configured. No real or sandbox Stripe transaction was performed in this environment. The page remains safely disabled until configuration is complete. See [STRIPE_SETUP.md](STRIPE_SETUP.md).

## Quantity bundles

`lib/bundles.mjs` is the shared pricing source: 1 set = 149 RON; 2 = 279 RON (save 19); 3 = 399 RON (save 48); 5 = 629 RON (save 116). Unit prices decrease from 149 to 139.50, 133 and 125.80 RON. The merchant delegated these prices; costs and margins are not available in the repository. Savings compare with separate sets at 149 RON, not the historical 199 RON price. Shipping remains free. “Recomandat” is an editorial suggestion, not a sales-popularity claim.

Both product sections share the package, active set and colors. One set is selected initially. Each set can use any of the 19 variants. Selecting a set updates the shared palette/gallery; there is an explicit action to apply a color to all sets. Switching sizes preserves previously chosen colors during the visit. Session storage persists the current cart for checkout/back/reload.

`/comanda?culori=v04,v03,v12` represents a mixed three-set package. Old `culoare` / `cantitate` links remain supported, including four sets at the standard price. Stripe line items group identical variants at the discounted unit amount; the server ignores client prices. Metadata records the color list, bundle ID and agreed amount for later confirmation and admin display. Confirmation uses this server-created price snapshot so subsequent price edits do not invalidate already-open sessions; legacy sessions retain their old validation. No separate Stripe coupon or product setup is necessary.

Tests cover all tiers, exact totals, mixed/duplicate colors, invalid selections, persistence, synchronized controls, 320px layouts, Stripe session parameters and confirmation. Real Stripe sandbox transactions remain a separate setup step.

## Merchant details and policy review

The legal pages use the owner-confirmed trader name and address as defaults; `BUSINESS_NAME`, `BUSINESS_ADDRESS`, `RETURN_ADDRESS` and `CONTACT_EMAIL` override them. A configured fiscal code is shown; no placeholder fiscal code is published. The readiness checks still require the other company/contact environment variables. `.env.example` contains the supplied public details; copying this file does not update Vercel automatically.

Set `PRODUCT_CONFIRMED=true` after checking the product information, and `LEGAL_CONFIRMED=true` after reviewing the terms, delivery/returns and privacy pages. In particular, confirm the proposed customer-paid ordinary return shipping rule. These flags do not verify legal identity or implement retention/deletion workflows. Production secrets and confirmation flags must be configured in Vercel, followed by a deployment.

## Order emails and PDF confirmations

See [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md) for Resend domain verification, secure variables, the Stripe payment webhook and delivery monitoring. Emails are disabled by default. The sender is Pucioasa Premium; customer and merchant messages include a Romanian PDF order confirmation. No fiscal invoice is created. Local tests cover signatures, paid-order validation, concurrency, bounded retries and duplicate prevention; real delivery requires provider configuration.

## SEO configuration and validation

See [SEO_SETUP.md](SEO_SETUP.md) for production domain settings, Search Console DNS verification, sitemap submission and post-deployment checks. Public pages have canonical URLs, distinct descriptions, social metadata and catalog-based Product structured data. Indexing follows the merchant launch flags and excludes preview/local environments, independently of payment credentials. `node tests/seo-http.mjs` checks production, preview and prelaunch HTML after a build.

## Editorial guides

Five Romanian guides live under `/ghiduri/[slug]`, with separate metadata, Article/BreadcrumbList structured data and responsive article layouts. They are linked from the sitemap and from one another; the existing homepage and menu are unchanged. See the route list and publishing checks in [SEO_SETUP.md](SEO_SETUP.md). Content and related-guide links are maintained in `lib/guides.mjs`.
