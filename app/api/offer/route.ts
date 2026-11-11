import { NextRequest, NextResponse } from "next/server";
import { siteUrl, storeReady } from "@/lib/store";
import {
  offerCookie,
  offerSecret,
  visitorOfferEnabled,
} from "@/lib/visitor-offer";
import { createOfferToken, readOfferToken } from "@/lib/offer-token.mjs";
export async function POST(req: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (req.headers.get("origin") !== new URL(siteUrl).origin)
    return NextResponse.json(
      { error: "Cerere neautorizată." },
      { status: 403, headers },
    );
  const secret = offerSecret();
  if (!visitorOfferEnabled() || !secret || !storeReady())
    return NextResponse.json(
      { error: "Oferta nu este activă." },
      { status: 503, headers },
    );
  const existing = req.cookies.get(offerCookie)?.value;
  const token = existing ?? createOfferToken(secret);
  const data = readOfferToken(token, secret);
  if (!data)
    return NextResponse.json(
      { error: "Oferta nu poate fi verificată." },
      { status: 409, headers },
    );
  const globalEnd = Date.parse(process.env.OFFER_ENDS_AT || "");
  const expiresAt = Number.isFinite(globalEnd)
    ? Math.min(data.expiresAt, globalEnd)
    : data.expiresAt;
  const response = NextResponse.json(
    { expiresAt, expired: expiresAt <= Date.now() },
    { headers },
  );
  if (!existing)
    response.cookies.set(offerCookie, token, {
      httpOnly: true,
      secure: new URL(siteUrl).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  return response;
}
