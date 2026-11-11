import Link from "next/link";
import ReviewsGallery from "@/components/reviews-gallery";
import ReviewRating from "@/components/review-rating";
import { Truck } from "lucide-react";
import { reviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Previzualizare privată recenzii",
  robots: { index: false, follow: false },
};

export default function ReviewPreview() {
  return (
    <main className="review-preview-page">
      <Link href="/admin" className="text-link">
        ← Înapoi la administrare
      </Link>
      <section
        className="rating-design-preview"
        aria-label="Previzualizare badge în cardul de comandă"
      >
        <p className="review-preview-note">
          Previzualizare a badge-ului și a recenziilor publicate.
        </p>
        <div className="product-info">
          <ReviewRating entries={reviews} />
          <h2>Lenjerii de pat Pucioasa Premium</h2>
          <p className="product-description">
            Alege nuanța preferată și bucură-te de un set complet.
          </p>
          <div className="discount-line">
            <span>
              Preț anterior <s>199 lei</s>
            </span>
            <strong>−25%</strong>
          </div>
          <div className="price-row">
            <strong>
              149 <span>lei</span>
            </strong>
            <span className="free-tag">
              <Truck size={15} /> Transport gratuit
            </span>
          </div>
          <p className="price-footnote">Prețul setului complet.</p>
        </div>
      </section>
      <div id="recenzii">
        <ReviewsGallery entries={reviews} />
      </div>
      <p className="review-preview-note">
        Cele 41 de nume și textele au fost furnizate de magazin, care a
        confirmat că toate evaluările sunt de cinci stele. Fotografiile sunt
        imagini de produs. „Recenzie verificată” apare doar după verificarea
        unei comenzi.
      </p>
    </main>
  );
}
