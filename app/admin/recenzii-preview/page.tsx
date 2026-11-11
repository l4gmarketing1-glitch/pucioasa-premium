import Link from "next/link";
import ReviewsGallery from "@/components/reviews-gallery";
import { colors } from "@/lib/catalog.mjs";
import type { Review } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Previzualizare privată recenzii",
  robots: { index: false, follow: false },
};

// Server-only fixtures for the protected admin preview. Never imported into the public review collection.
const sampleText = [
  "Exemplu de prezentare: o impresie despre culoarea aleasă și felul în care se potrivește în dormitor.",
  "Exemplu de prezentare: aici poate apărea povestea unui client despre prima comandă și experiența de livrare.",
  "Exemplu de prezentare: o părere despre dimensiunile setului, însoțită de fotografia trimisă de client.",
  "Exemplu de prezentare: un mesaj scurt despre detaliile preferate ale lenjeriei.",
  "Exemplu de prezentare: o recenzie mai detaliată despre folosirea și întreținerea produsului, publicată cu acordul autorului.",
  "Exemplu de prezentare: aici poate apărea un sfat util pentru cineva care alege prima sa nuanță.",
];
const examples: Review[] = Array.from({ length: 41 }, (_, index) => {
  const color = colors[index % colors.length];
  return {
    id: `demo-${index + 1}`,
    displayName: `Exemplu ${String(index + 1).padStart(2, "0")}`,
    rating: index % 4 === 0 ? 4 : 5,
    text: sampleText[index % sampleText.length],
    colorName: color.name,
    publishedAt: "2026-11-11",
    ...(index % 3 !== 1
      ? {
          image: {
            src: color.image,
            alt: `Fotografie de produs pentru exemplul demonstrativ ${index + 1}`,
            kind: "product" as const,
          },
        }
      : {}),
  };
});

export default function ReviewPreview() {
  return (
    <main className="review-preview-page">
      <Link href="/admin" className="text-link">
        ← Înapoi la administrare
      </Link>
      <ReviewsGallery entries={examples} demo />
      <p className="review-preview-note">
        Pagina este protejată de autentificarea administratorului. Exemplele nu
        apar în magazinul public. Insigna „Recenzie verificată” este disponibilă
        doar pentru recenzii autentice asociate unei comenzi verificate.
      </p>
    </main>
  );
}
