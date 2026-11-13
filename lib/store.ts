import "server-only";
import Stripe from "stripe";
import { currentStoreConfigurationIssues } from "@/lib/configuration";
import { siteOrigin } from "@/lib/seo.mjs";
export const siteUrl = siteOrigin();
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Stripe nu este configurat.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function storeReady() {
  return currentStoreConfigurationIssues().length === 0;
}
