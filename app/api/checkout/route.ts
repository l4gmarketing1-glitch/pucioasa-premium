import type Stripe from "stripe";
import { checkoutParameters } from "@/lib/checkout.mjs";
import {
  offerCookie,
  offerSecret,
  visitorOfferEnabled,
} from "@/lib/visitor-offer";
import { readOfferToken } from "@/lib/offer-token.mjs";
import { NextRequest, NextResponse } from "next/server";
import { stripeClient, storeReady, siteUrl } from "@/lib/store";
import { product, validateSelection } from "@/lib/catalog.mjs";
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== new URL(siteUrl).origin)
    return NextResponse.json(
      { error: "Cerere neautorizată." },
      { status: 403 },
    );
  if (!storeReady())
    return NextResponse.json(
      { error: "Magazinul este în pregătire. Comenzile nu sunt încă active." },
      { status: 503 },
    );
  if (
    process.env.OFFER_ENDS_AT &&
    Date.parse(process.env.OFFER_ENDS_AT) <= Date.now()
  )
    return NextResponse.json(
      { error: "Perioada acestei oferte s-a încheiat." },
      { status: 409 },
    );
  if (visitorOfferEnabled()) {
    const offer = readOfferToken(
      req.cookies.get(offerCookie)?.value,
      offerSecret(),
    );
    if (!offer)
      return NextResponse.json(
        { error: "Revino la pagina produsului pentru a verifica oferta." },
        { status: 403 },
      );
    if (offer.expiresAt <= Date.now())
      return NextResponse.json(
        { error: "Perioada acestei oferte s-a încheiat." },
        { status: 409 },
      );
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const selection = validateSelection(body);
  if (!selection)
    return NextResponse.json(
      { error: "Alege o culoare și între 1 și 5 seturi." },
      { status: 400 },
    );
  if (
    typeof body.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.requestId,
    )
  ) {
    return NextResponse.json(
      { error: "Reîncarcă pagina de comandă și încearcă din nou." },
      { status: 400 },
    );
  }
  // Prices and labels are resolved server-side. Retrying the same request reuses the session.
  try {
    const session = await stripeClient().checkout.sessions.create(
      checkoutParameters(
        selection,
        siteUrl,
      ) as Stripe.Checkout.SessionCreateParams,
      {
        idempotencyKey: `pp-checkout:${body.requestId}:${selection.color}:${selection.quantity}:${product.amount}`,
      },
    );
    if (!session.client_secret)
      throw new Error("Missing checkout client secret");
    return NextResponse.json(
      { clientSecret: session.client_secret, sessionId: session.id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error("Checkout session creation failed");
    return NextResponse.json(
      { error: "Plata nu a putut fi inițiată. Încearcă din nou." },
      { status: 502 },
    );
  }
}
