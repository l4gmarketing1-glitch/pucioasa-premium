import { stripeKeysMatch } from "./checkout.mjs";

// Return only fixed messages and variable names, never configured values.
export function storeConfigurationIssues(env) {
  const issues = [];
  for (const variable of [
    "STORE_LIVE",
    "PRODUCT_CONFIRMED",
    "LEGAL_CONFIRMED",
  ]) {
    if (env[variable] !== "true")
      issues.push({
        variable,
        message: env[variable]
          ? "Valoarea trebuie să fie exact true, cu litere mici, fără ghilimele sau spații."
          : "Variabila lipsește sau este goală în deployment-ul curent.",
      });
  }
  const secret = env.STRIPE_SECRET_KEY || "";
  const publicKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  if (!secret)
    issues.push({
      variable: "STRIPE_SECRET_KEY",
      message: "Cheia secretă lipsește din deployment-ul curent.",
    });
  if (!publicKey)
    issues.push({
      variable: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      message:
        "Cheia publică lipsește. Salvează variabila pentru Production înainte de noul deploy.",
    });
  if (secret && publicKey && !stripeKeysMatch(secret, publicKey))
    issues.push({
      variable: "STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      message:
        "Formatul sau modurile cheilor nu corespund. Folosește perechea Live sau perechea Test din același cont Stripe, fără spații sau ghilimele.",
    });
  for (const variable of [
    "BUSINESS_NAME",
    "BUSINESS_ADDRESS",
    "CONTACT_EMAIL",
    "DELIVERY_ESTIMATE",
    "RETURN_ADDRESS",
  ]) {
    if (!env[variable])
      issues.push({
        variable,
        message: "Variabila lipsește sau este goală în deployment-ul curent.",
      });
  }
  if (
    env.VISITOR_OFFER_ENABLED === "true" &&
    (!env.OFFER_SIGNING_SECRET || env.OFFER_SIGNING_SECRET.length < 32)
  )
    issues.push({
      variable: "OFFER_SIGNING_SECRET",
      message:
        "Oferta temporizată este activă și necesită o cheie de minimum 32 de caractere.",
    });
  return issues;
}

export function adminConfigurationIssues(env) {
  if (!env.ADMIN_PASSWORD)
    return [
      {
        variable: "ADMIN_PASSWORD",
        message: "Parola lipsește sau este goală în deployment-ul curent.",
      },
    ];
  if (env.ADMIN_PASSWORD.length < 32)
    return [
      {
        variable: "ADMIN_PASSWORD",
        message:
          "Parola este prea scurtă. Setează o parolă de minimum 32 de caractere.",
      },
    ];
  return [];
}
