"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Heart, Mail, Quote, Star, X } from "lucide-react";
import { reviews } from "@/lib/reviews";

export default function Reviews() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [rating, setRating] = useState(0);
  const [prepared, setPrepared] = useState("");
  const average = reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : null;

  function openReview() {
    setPrepared("");
    dialog.current?.showModal();
  }

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = [
      `Nume de afișat: ${values.get("name")}`,
      `Evaluare: ${values.get("rating")}/5`,
      `Referință comandă: ${values.get("order") || "Nespecificată"}`,
      "",
      String(values.get("review")),
      "",
      "Sunt de acord cu publicarea recenziei și a numelui de afișat, după verificarea comenzii. Referința comenzii rămâne privată.",
    ].join("\n");
    setPrepared(
      `mailto:contact@pucioasa-premium.ro?subject=${encodeURIComponent("Recenzie Pucioasa Premium")}&body=${encodeURIComponent(body)}`,
    );
  }

  return (
    <section
      className="reviews-section"
      id="recenzii"
      aria-labelledby="reviews-title"
    >
      <div className="reviews-intro">
        <span className="eyebrow">
          <span className="little-line" /> RECENZIILE CLIENȚILOR
        </span>
        <h2 id="reviews-title">
          Confortul se simte.
          <br />
          <em>Poveștile se împărtășesc.</em>
        </h2>
        <p>
          Un pat proaspăt aranjat. Culoarea aceea care schimbă camera.
          <br className="reviews-desktop-break" /> Ne-ar plăcea să știm cum e la
          tine acasă.
        </p>
      </div>

      {reviews.length > 0 ? (
        <>
          <div className="reviews-summary">
            <strong>{average}</strong>
            <span>
              din 5 · {reviews.length}{" "}
              {reviews.length === 1
                ? "recenzie publicată"
                : "recenzii publicate"}
            </span>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div
                  className="review-stars"
                  aria-label={`${review.rating} din 5 stele`}
                >
                  {Array.from({ length: review.rating }, (_, index) => (
                    <Star
                      key={index}
                      size={14}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <Quote
                  className="review-quote"
                  size={30}
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <blockquote>{review.text}</blockquote>
                <div className="review-author">
                  <span className="review-initial">
                    {review.displayName.charAt(0)}
                  </span>
                  <div>
                    <strong>{review.displayName}</strong>
                    <small>
                      {review.colorName} ·{" "}
                      {new Date(review.publishedAt).toLocaleDateString(
                        "ro-RO",
                        {
                          timeZone: "Europe/Bucharest",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </small>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button ref={trigger} className="review-write" onClick={openReview}>
            Împărtășește experiența ta <ArrowRight size={16} />
          </button>
        </>
      ) : (
        <div className="review-invitation">
          <div className="review-art" aria-hidden="true">
            <div className="review-art-ring" />
            <Quote size={54} strokeWidth={0.8} />
            <span>
              Momente mici.
              <br />
              <em>Impresii care contează.</em>
            </span>
            <Heart size={22} strokeWidth={1} />
          </div>
          <div className="review-invitation-copy">
            <span className="eyebrow">PRIMA POVESTE POATE FI A TA</span>
            <h3>
              Cum se simte
              <br />
              <em>acasă, în noua culoare?</em>
            </h3>
            <p>
              Încă nu au fost publicate recenzii. Dacă ai încercat lenjeria
              noastră, povestește-ne despre alegerea ta. Părerea ta îi poate
              ajuta și pe ceilalți să o găsească pe a lor.
            </p>
            <button ref={trigger} className="primary" onClick={openReview}>
              Scrie o recenzie <ArrowRight size={17} />
            </button>
            <small>
              <Mail size={13} /> Ne trimiți părerea prin email. O publicăm după
              verificare.
            </small>
          </div>
        </div>
      )}

      <dialog
        ref={dialog}
        className="review-dialog"
        aria-labelledby="review-form-title"
        onClose={() => trigger.current?.focus()}
      >
        <button
          className="review-close"
          aria-label="Închide formularul de recenzie"
          onClick={() => dialog.current?.close()}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">O POVESTE DIN DORMITORUL TĂU</span>
        <h2 id="review-form-title">Părerea ta contează.</h2>
        <p className="review-form-note">
          Completează recenzia și trimite-o din aplicația ta de email. Nu se
          publică automat.
        </p>
        <form onSubmit={prepareEmail} onChange={() => setPrepared("")}>
          <fieldset className="rating-field">
            <legend>Cum a fost experiența ta?</legend>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    required
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    aria-label={`${value} ${value === 1 ? "stea" : "stele"}`}
                  />
                  <span className={value <= rating ? "rating-active" : ""}>
                    <Star
                      size={26}
                      fill={value <= rating ? "currentColor" : "none"}
                      strokeWidth={1.2}
                    />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="review-field">
            Numele de afișat
            <input
              name="name"
              autoComplete="given-name"
              required
              maxLength={60}
              placeholder="Prenumele sau inițialele tale"
            />
          </label>
          <label className="review-field">
            Experiența ta
            <textarea
              name="review"
              rows={4}
              required
              minLength={20}
              maxLength={1500}
              placeholder="Ce ți-a plăcut? Cum se potrivește culoarea în dormitorul tău?"
            />
          </label>
          <label className="review-field">
            Referința comenzii <span>(opțional, pentru verificare)</span>
            <input name="order" maxLength={120} />
          </label>
          <label className="review-consent">
            <input type="checkbox" required />
            <span>
              Sunt de acord cu publicarea recenziei și a numelui ales, după
              verificare. Referința comenzii rămâne privată.{" "}
              <a href="/informatii/confidentialitate">Despre datele tale</a>
            </span>
          </label>
          <button className="primary" type="submit">
            Pregătește emailul <ArrowRight size={16} />
          </button>
          {prepared && (
            <div className="review-prepared" role="status">
              <p>
                <Check size={16} /> Textul este pregătit. Recenzia ajunge la noi
                doar după ce trimiți mesajul din aplicația ta de email.
              </p>
              <a
                href={prepared}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Deschide aplicația de email <ArrowRight size={15} />
              </a>
              <p>
                Dacă nu folosești o aplicație de email, ne poți scrie direct la
                contact@pucioasa-premium.ro. Textul completat rămâne în
                formular.
              </p>
            </div>
          )}
        </form>
      </dialog>
    </section>
  );
}
