import { Star } from "lucide-react";
import { reviews, type Review } from "@/lib/reviews";

export default function ReviewRating({
  entries = reviews,
}: {
  entries?: Review[];
}) {
  if (!entries.length) {
    return <span className="eyebrow">COLECȚIA PREMIUM</span>;
  }

  const average =
    entries.reduce((sum, review) => sum + review.rating, 0) / entries.length;
  const score = new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 1,
  }).format(average);

  return (
    <a
      className="product-review-rating"
      href="#recenzii"
      aria-label={`${entries.length} recenzii, evaluare medie ${score} din 5 stele`}
    >
      <span className="product-rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className="product-rating-star" key={index}>
            <Star size={15} strokeWidth={1.5} />
            <span
              style={{
                width: `${Math.min(1, Math.max(0, average - index)) * 100}%`,
              }}
            >
              <Star size={15} fill="currentColor" strokeWidth={1.5} />
            </span>
          </span>
        ))}
      </span>
      <span>
        {entries.length} {entries.length === 1 ? "recenzie" : "recenzii"}
      </span>
    </a>
  );
}
