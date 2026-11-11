import { visitorOfferEnabled } from "@/lib/visitor-offer";
import Storefront from "@/components/storefront";
import { product, referenceDiscount } from "@/lib/catalog.mjs";
import { storeReady, siteUrl } from "@/lib/store";
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    images: [
      {
        url: "/products/1.jpg",
        width: 1540,
        height: 1427,
        alt: "Lenjerie Pucioasa Premium, 6 piese",
      },
    ],
  },
};
export const dynamic = "force-dynamic";
export default function Home() {
  const ready = storeReady();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Lenjerie de pat Pucioasa Premium — 6 piese",
    image: [`${siteUrl}/products/1.jpg`],
    description:
      "Un cearșaf de pilotă, un cearșaf de pat și patru fețe de pernă.",
    brand: { "@type": "Brand", name: "Pucioasa Premium" },
    offers: {
      "@type": "Offer",
      url: siteUrl,
      priceCurrency: "RON",
      price: (product.amount / 100).toFixed(2),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "RON" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "RO" },
      },
    },
  };
  return (
    <>
      {ready && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\u003c"),
          }}
        />
      )}
      <Storefront
        visitorOffer={visitorOfferEnabled()}
        discount={referenceDiscount(
          process.env.REFERENCE_PRICE_RON?.trim() || String(product.referenceAmount / 100),
        )}
        ready={ready}
        deadline={process.env.OFFER_ENDS_AT || ""}
        delivery={process.env.DELIVERY_ESTIMATE || ""}
      />
    </>
  );
}
