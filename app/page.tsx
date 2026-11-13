import { visitorOfferEnabled } from "@/lib/visitor-offer";
import Storefront from "@/components/storefront";
import { product, referenceDiscount } from "@/lib/catalog.mjs";
import { storeReady, siteUrl } from "@/lib/store";
import { publicPageMetadata } from "@/lib/seo";
import { homeSeo, indexingAllowed, productSchema, serializeSchema } from "@/lib/seo.mjs";
export const metadata = publicPageMetadata(siteUrl, homeSeo.title, homeSeo.description, '/');
export const dynamic = "force-dynamic";
export default function Home() {
  const ready = storeReady();
  const expired = Boolean(process.env.OFFER_ENDS_AT && Date.parse(process.env.OFFER_ENDS_AT) <= Date.now());
  const schema = productSchema(siteUrl, ready && !expired);
  return (
    <>
      {indexingAllowed() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeSchema(schema),
          }}
        />
      )}
      <Storefront
        visitorOffer={visitorOfferEnabled()}
        discount={referenceDiscount(
          process.env.REFERENCE_PRICE_RON?.trim() ||
            String(product.referenceAmount / 100),
        )}
        ready={ready}
        deadline={process.env.OFFER_ENDS_AT || ""}
        delivery={process.env.DELIVERY_ESTIMATE || ""}
      />
    </>
  );
}
