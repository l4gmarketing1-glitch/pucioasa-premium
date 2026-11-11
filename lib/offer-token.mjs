import { createHmac, timingSafeEqual } from "node:crypto";
export const offerDurationMs = 86 * 60 * 1000;
export function createOfferToken(secret, now = Date.now()) {
  if (!secret || secret.length < 32)
    throw new Error("Missing offer signing secret");
  const data = { issuedAt: now, expiresAt: now + offerDurationMs };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
export function readOfferToken(token, secret, now = Date.now()) {
  if (
    !secret ||
    secret.length < 32 ||
    typeof token !== "string" ||
    token.length > 512
  )
    return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const supplied = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", secret).update(payload).digest();
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      !Number.isSafeInteger(data.issuedAt) ||
      !Number.isSafeInteger(data.expiresAt) ||
      data.issuedAt > now + 5000 ||
      data.expiresAt !== data.issuedAt + offerDurationMs
    )
      return null;
    // Expired tokens remain valid records, so a reload cannot issue a fresh offer.
    return { issuedAt: data.issuedAt, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}
