// Test process only: Stripe HTTPS requests go to the local fixture, never to Stripe.
const https = require("node:https");
const http = require("node:http");
const original = https.request;
https.request = function (options, callback) {
  if (
    options.hostname === "api.stripe.com" ||
    options.host === "api.stripe.com"
  ) {
    if (!process.env.STRIPE_FIXTURE_PORT)
      throw new Error("Missing local Stripe fixture");
    return http.request(
      {
        ...options,
        agent: undefined,
        protocol: "http:",
        hostname: "127.0.0.1",
        host: "127.0.0.1",
        port: Number(process.env.STRIPE_FIXTURE_PORT),
      },
      callback,
    );
  }
  return original.apply(this, arguments);
};
