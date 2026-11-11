import Link from "next/link";
import ReviewsGallery from "@/components/reviews-gallery";
import ReviewRating from "@/components/review-rating";
import { Truck } from "lucide-react";
import { reviewExamples } from "@/lib/review-examples";

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
        <p className="review-demo-note">
          Previzualizare de design · 41 de evaluări fictive pentru ilustrare.
        </p>
        <div className="product-info">
          <ReviewRating entries={reviewExamples} />
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
        <ReviewsGallery entries={reviewExamples} demo />
      </div>
      <p className="review-preview-note">
        Această pagină de previzualizare este protejată. Aceleași exemple apar
        pe pagina principală cu mențiunea vizibilă că sunt demonstrative.
        Numele, evaluările și textele sunt fictive. „Recenzie verificată” se
        afișează doar pentru opinii autentice asociate unor comenzi reale.
      </p>
    </main>
  );
}
