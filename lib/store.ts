import "server-only";
import Stripe from "stripe";
import { currentStoreConfigurationIssues } from "@/lib/configuration";
export const siteUrl = process.env.SITE_URL || "https://pucioasa-premium.ro";
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("Stripe nu este configurat.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function storeReady() {
  return currentStoreConfigurationIssues().length === 0;
}
