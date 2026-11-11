import Link from "next/link";
import ReviewsGallery from "@/components/reviews-gallery";
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
      <ReviewsGallery entries={reviewExamples} demo />
      <p className="review-preview-note">
        Această pagină de previzualizare este protejată. Aceleași exemple apar
        pe pagina principală cu mențiunea vizibilă că sunt demonstrative.
        Numele, evaluările și textele sunt fictive. „Recenzie verificată” se
        afișează doar pentru opinii autentice asociate unor comenzi reale.
      </p>
    </main>
  );
}
