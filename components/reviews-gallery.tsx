"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowDown, BadgeCheck, Star } from "lucide-react";
import type { Review } from "@/lib/reviews";

const mobileQuery = "(max-width: 760px)";
function subscribeViewport(onChange: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const serverSnapshot = () => true;

export default function ReviewsGallery({
  entries,
  demo = false,
}: {
  entries: Review[];
  demo?: boolean;
}) {
  const mobile = useSyncExternalStore(
    subscribeViewport,
    mobileSnapshot,
    serverSnapshot,
  );
  const pageSize = mobile ? 3 : 6;
  const [expandedCount, setExpandedCount] = useState<number | null>(null);
  const visibleCount = Math.min(
    entries.length,
    Math.max(pageSize, expandedCount ?? pageSize),
  );
  if (!entries.length) return null;
  const average = (
    entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length
  )
    .toFixed(1)
    .replace(".", ",");
  return (
    <div className={`reviews-showcase${demo ? " reviews-showcase-demo" : ""}`}>
      {demo && (
        <p className="review-demo-banner">
          <strong>
            EXEMPLE DEMONSTRATIVE · NU SUNT RECENZII ALE CLIENȚILOR
          </strong>
          <span>
            Aceste {entries.length} exemple nu reprezintă opinii ale clienților.
            Numele, evaluările și textele sunt exemple fictive. Cele 3 imagini
            sunt fotografii de produs.
          </span>
        </p>
      )}
      <div className="showcase-header">
        <div>
          <span className="eyebrow">
            {demo ? "PROPUNERE DE PREZENTARE" : "EXPERIENȚE DE ACASĂ"}
          </span>
          <h2>
            {demo ? "Un loc pentru" : "Păreri care fac"}
            <br />
            <em>{demo ? "poveștile clienților." : "alegerea mai ușoară."}</em>
          </h2>
        </div>
        <div className="showcase-score">
          {demo ? (
            <>
              <strong>{entries.length}</strong>
              <span>exemple de design</span>
            </>
          ) : (
            <>
              <strong>
                {average}
                <small>/ 5</small>
              </strong>
              <span>
                {entries.length}{" "}
                {entries.length === 1
                  ? "recenzie publicată"
                  : "recenzii publicate"}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="review-grid photo-review-grid">
        {entries.slice(0, visibleCount).map((entry) => (
          <article
            className={`review-card photo-review-card${entry.image ? " has-photo" : ""}`}
            key={entry.id}
          >
            {entry.image && (
              <figure className="review-photo">
                <Image
                  src={entry.image.src}
                  alt={entry.image.alt}
                  fill
                  sizes="(max-width: 760px) 85vw, (max-width: 1050px) 44vw, 30vw"
                />
                <figcaption>
                  {entry.image.kind === "customer" && !demo
                    ? "Fotografie trimisă de client"
                    : "Fotografie de produs"}
                </figcaption>
              </figure>
            )}
            <div className="review-card-content">
              <div className="review-card-top">
                <div
                  className="review-stars"
                  aria-label={`${demo ? "Evaluare demonstrativă: " : ""}${entry.rating} din 5 stele`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={13}
                      fill={index < entry.rating ? "currentColor" : "none"}
                      strokeWidth={1.2}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {!demo &&
                  entry.verification?.method === "manual_order_match" && (
                    <span className="review-verified">
                      <BadgeCheck size={13} />
                      Recenzie verificată
                    </span>
                  )}
              </div>
              {entry.text.trim() && (
                <blockquote className="review-message">{entry.text}</blockquote>
              )}
              <div className="review-author">
                <strong>{entry.displayName}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
      {visibleCount < entries.length && (
        <button
          className="reviews-more"
          onClick={() =>
            setExpandedCount(Math.min(visibleCount + pageSize, entries.length))
          }
        >
          Încarcă mai multe recenzii
          <ArrowDown size={16} />
          <span>
            {visibleCount} / {entries.length}
          </span>
        </button>
      )}
      <p className="reviews-visible-count" aria-live="polite">
        {Math.min(visibleCount, entries.length)} din {entries.length}{" "}
        {demo ? "exemple demonstrative" : "recenzii"}
      </p>
    </div>
  );
}
