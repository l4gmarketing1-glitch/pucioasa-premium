import "server-only";
import { storeConfigurationIssues } from "./configuration.mjs";

export function currentStoreConfigurationIssues() {
  // Keep this access explicit: Next.js substitutes NEXT_PUBLIC_* at build time.
  return storeConfigurationIssues({
    ...process.env,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
}
