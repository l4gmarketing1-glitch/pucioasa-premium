import "server-only";
import Stripe from "stripe";
import { visitorOfferEnabled, offerSecret } from "@/lib/visitor-offer";
export const siteUrl = process.env.SITE_URL || "https://pucioasa-premium.ro";
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Stripe nu este configurat.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function storeReady() {
  return (
    (!visitorOfferEnabled() || Boolean(offerSecret())) &&
    process.env.STORE_LIVE === "true" &&
    process.env.PRODUCT_CONFIRMED === "true" &&
    process.env.LEGAL_CONFIRMED === "true" &&
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    [
      "BUSINESS_NAME",
      "BUSINESS_CUI",
      "BUSINESS_ADDRESS",
      "CONTACT_EMAIL",
      "DELIVERY_ESTIMATE",
      "RETURN_ADDRESS",
    ].every((k) => Boolean(process.env[k]))
  );
}
