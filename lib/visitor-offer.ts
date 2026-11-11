import "server-only";
export const offerCookie = "pp_offer_v1";
export function visitorOfferEnabled() {
  return process.env.VISITOR_OFFER_ENABLED === "true";
}
export function offerSecret() {
  const key = process.env.OFFER_SIGNING_SECRET;
  return key && key.length >= 32 ? key : null;
}
