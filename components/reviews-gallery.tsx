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
  const initialCount = mobile ? 3 : 11;
  const pageSize = mobile ? 3 : 10;
  const [expandedCount, setExpandedCount] = useState<number | null>(null);
  const visibleCount = Math.min(
    entries.length,
    Math.max(initialCount, expandedCount ?? initialCount),
  );
  if (!entries.length) return null;
  return (
    <div className={`reviews-showcase${demo ? " reviews-showcase-demo" : ""}`}>
      {demo && (
        <p className="review-demo-note">
          Exemple de prezentare — numele abreviate și evaluările sunt fictive.
          Numele complete și textele au fost furnizate de magazin; asocierea
          dintre ele este ilustrativă.
        </p>
      )}
      <div className="showcase-header">
        <div>
          {!demo && <span className="eyebrow">EXPERIENȚE DE ACASĂ</span>}
          <h2>
            {demo ? "Un loc pentru" : "Păreri care fac"}
            <br />
            <em>{demo ? "poveștile clienților." : "alegerea mai ușoară."}</em>
          </h2>
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
          Vezi mai multe recenzii
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
