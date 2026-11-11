"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Package,
  Plus,
  Minus,
  Phone,
  Menu,
  X,
  Check,
  Clock,
  BedDouble,
  Layers,
} from "lucide-react";
import { colors, activeDeadline, product } from "@/lib/catalog.mjs";
import Reviews from "@/components/reviews";
import ReviewRating from "@/components/review-rating";

export default function Storefront({
  ready,
  deadline,
  delivery,
  discount,
  visitorOffer,
}: {
  ready: boolean;
  visitorOffer: boolean;
  deadline: string;
  delivery: string;
  discount: { amount: number; percent: number } | null;
}) {
  const [selected, setSelected] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [offerDeadline, setOfferDeadline] = useState(deadline);
  const [offerVerified, setOfferVerified] = useState(!visitorOffer);
  const [offerCheckFailed, setOfferCheckFailed] = useState(false);
  useEffect(() => {
    if (!visitorOffer || !ready) return;
    const controller = new AbortController();
    fetch("/api/offer", { method: "POST", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Offer unavailable");
        const data = await response.json();
        if (!Number.isFinite(data.expiresAt))
          throw new Error("Invalid deadline");
        setRemaining(Math.max(0, data.expiresAt - Date.now()));
        setOfferDeadline(new Date(data.expiresAt).toISOString());
        setOfferVerified(true);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setOfferCheckFailed(true);
          setError(
            "Oferta nu a putut fi verificată. Reîncarcă pagina sau contactează-ne telefonic.",
          );
        }
      });
    return () => controller.abort();
  }, [visitorOffer, ready]);
  const [timerReady, setTimerReady] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const saved = sessionStorage.getItem("pp-variant");
    const c = colors.find((c) => c.id === saved);
    if (c) setSelected(c);
    setCancelled(
      new URLSearchParams(window.location.search).get("checkout") ===
        "cancelled",
    );
  }, []);
  useEffect(() => {
    const tick = () => {
      setRemaining(
        Math.max(0, (activeDeadline(offerDeadline) || 0) - Date.now()),
      );
      setTimerReady(true);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [offerDeadline]);
  const offerExpired =
    timerReady && Number.isFinite(Date.parse(offerDeadline)) && remaining === 0;
  function choose(c: (typeof colors)[number]) {
    setSelected(c);
    sessionStorage.setItem("pp-variant", c.id);
    setError("");
  }
  async function checkout() {
    if (offerCheckFailed || (visitorOffer && ready && !offerVerified)) return;
    if (offerExpired) {
      setError("Perioada acestei oferte s-a încheiat.");
      return;
    }
    if (!ready) {
      setError(
        "Pregătim deschiderea magazinului. Pentru detalii, sună-ne la 0755 436 284.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: selected.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "A apărut o eroare. Încearcă din nou.",
      );
      setBusy(false);
    }
  }
  const hours = String(Math.floor(remaining / 3600000)).padStart(2, "0"),
    minutes = String(Math.floor(remaining / 60000) % 60).padStart(2, "0"),
    seconds = String(Math.floor(remaining / 1000) % 60).padStart(2, "0");
  const renderProductSection = (compact = false) => (
    <section
      className="product-section section"
      id={compact ? "comanda" : "produs"}
      aria-labelledby={compact ? "comanda-title" : "produs-title"}
    >
      {!compact && (
        <div className="product-heading">
          <span className="eyebrow">ALEGE CE ȚI SE POTRIVEȘTE</span>
          <p>O culoare nouă. Un sentiment familiar.</p>
        </div>
      )}
      <div className="product-grid">
        <div className="gallery">
          <div className="product-photo">
            <Image
              key={selected.id}
              src={selected.image}
              alt={`Lenjerie de pat 6 piese — ${selected.name}`}
              fill
              sizes="(max-width: 760px) 100vw, 52vw"
            />
            <span className="photo-caption">
              <i style={{ backgroundColor: selected.hex }} />
              {selected.name}
            </span>
          </div>
          <p className="gallery-note">
            Fotografia corespunde variantei selectate.
          </p>
          <div className="thumbnail-strip" aria-label="Fotografii variante">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => choose(c)}
                title={c.name}
                aria-label={`Vezi ${c.name}`}
                aria-pressed={selected.id === c.id}
                className={selected.id === c.id ? "thumb selected" : "thumb"}
              >
                <Image src={c.image} alt="" width={74} height={70} />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <ReviewRating />
          <h2 id={compact ? "comanda-title" : "produs-title"}>
            Lenjerii de pat Pucioasa Premium
          </h2>
          <p className="product-description">
            Alege nuanța preferată și bucură-te de un set complet.
          </p>
          {discount && !offerExpired && (
            <div className="discount-line">
              <span>
                Preț anterior{" "}
                <s>
                  {new Intl.NumberFormat("ro-RO", {
                    maximumFractionDigits: 2,
                  }).format((discount.amount * quantity) / 100)}{" "}
                  lei
                </s>
              </span>
              <strong>−{discount.percent}%</strong>
            </div>
          )}
          <div className="price-row">
            <strong>
              {(product.amount / 100) * quantity} <span>lei</span>
            </strong>
            <span className="free-tag">
              <Truck size={15} /> Transport gratuit
            </span>
          </div>
          <p className="price-footnote">
            {quantity === 1
              ? "Prețul setului complet."
              : `${quantity} seturi × ${product.amount / 100} lei`}
          </p>
          <div className="divider" />
          <fieldset className="color-field">
            <legend>
              Alege culoarea preferată{" "}
              <strong aria-live="polite">{selected.name}</strong>
            </legend>
            <div className="swatches">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => choose(c)}
                  title={c.name}
                  aria-label={`Alege ${c.name}`}
                  aria-pressed={selected.id === c.id}
                  className={
                    selected.id === c.id ? "swatch selected" : "swatch"
                  }
                  style={{ backgroundColor: c.hex }}
                >
                  {selected.id === c.id && (
                    <Check
                      size={17}
                      color={
                        [
                          "v03",
                          "v06",
                          "v07",
                          "v08",
                          "v16",
                          "v17",
                          "v19",
                        ].includes(c.id)
                          ? "#fff"
                          : "#4c242c"
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          <div
            className="set-included"
            id={compact ? "comanda-detalii" : "detalii"}
          >
            <div className="set-heading">
              <span>
                <Layers size={16} /> Ce conține setul
              </span>
              <small>6 piese</small>
            </div>
            <dl className="included-grid">
              {[
                ["Cearșaf de pilotă", "200 × 230 cm", "1×"],
                ["Cearșaf de pat", "180 × 200 cm", "1×"],
                ["Fețe de pernă", "70 × 70 cm", "2×"],
                ["Fețe de pernă", "50 × 70 cm", "2×"],
              ].map(([name, size, count]) => (
                <div key={name + size}>
                  <span className="included-count">{count}</span>
                  <div>
                    <dt>{name}</dt>
                    <dd>{size}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {remaining > 0 && (
            <div className="offer">
              <div className="offer-message">
                <Clock size={18} />
                <span>
                  <strong>
                    {visitorOffer
                      ? "Timp pentru a începe comanda"
                      : "Oferta se încheie în"}
                  </strong>
                  <small>
                    Până la{" "}
                    {new Intl.DateTimeFormat("ro-RO", {
                      timeZone: "Europe/Bucharest",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(offerDeadline))}
                  </small>
                </span>
              </div>
              <div
                className="offer-clock"
                role="timer"
                aria-label={`${hours} ore, ${minutes} minute, ${seconds} secunde rămase`}
              >
                <span>
                  <b>{hours}</b>
                  <small>ore</small>
                </span>
                <i>:</i>
                <span>
                  <b>{minutes}</b>
                  <small>min</small>
                </span>
                <i>:</i>
                <span>
                  <b>{seconds}</b>
                  <small>sec</small>
                </span>
              </div>
            </div>
          )}
          {offerExpired && (
            <p className="offer-ended" role="status">
              Perioada acestei oferte s-a încheiat.
            </p>
          )}
          <div className="purchase-label">Câte seturi îți dorești?</div>
          <div className="purchase-row">
            <div className="quantity">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity === 1}
                aria-label="Scade cantitatea"
              >
                <Minus size={16} />
              </button>
              <output aria-label="Cantitate">{quantity}</output>
              <button
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                disabled={quantity === 5}
                aria-label="Mărește cantitatea"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="primary buy"
              disabled={
                busy ||
                offerExpired ||
                offerCheckFailed ||
                (visitorOffer && ready && !offerVerified)
              }
              onClick={checkout}
            >
              {busy
                ? "Se deschide plata…"
                : offerExpired
                  ? "Ofertă încheiată"
                  : "Comandă acum"}
              <ArrowRight size={18} />
            </button>
          </div>
          <div aria-live="polite">
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {cancelled && (
              <p className="notice">
                Ai revenit de la plată. Poți verifica selecția și relua comanda.
              </p>
            )}
          </div>
          {!ready && (
            <p className="launch-note">
              În curând disponibil pentru comandă online.
            </p>
          )}
          <div className="checkout-trust">
            <ShieldCheck size={15} />
            <span>Plată securizată cu cardul</span>
            <span className="payment-brand">VISA</span>
            <span className="mastercard" aria-label="Mastercard">
              <i />
              <i />
            </span>
          </div>
          {!compact && (
            <div className="product-questions" id="intrebari">
              <div className="questions-heading">Detalii comandă</div>
              <details>
                <summary>
                  <span>
                    <Truck size={17} /> Livrare & transport
                  </span>
                  <Plus size={16} />
                </summary>
                <p>Livrare gratuită în maxim 48 de ore prin curier rapid.</p>
              </details>
              <details>
                <summary>
                  <span>
                    <ShieldCheck size={17} /> Cum plătesc?
                  </span>
                  <Plus size={16} />
                </summary>
                <p>
                  Plata se face securizat cu cardul, fără să creezi un cont.
                </p>
              </details>
              <details>
                <summary>
                  <span>
                    <Package size={17} /> Dacă vreau să returnez?
                  </span>
                  <Plus size={16} />
                </summary>
                <p>
                  Consumatorii din România beneficiază în general de dreptul
                  legal de retur în 14 zile de la primire.
                </p>
              </details>
              <details>
                <summary>
                  <span>
                    <BedDouble size={17} /> Cum aleg nuanța potrivită?
                  </span>
                  <Plus size={16} />
                </summary>
                <p>
                  Selectează o culoare pentru a vedea fotografia
                  corespunzătoare.
                </p>
              </details>
            </div>
          )}
          <a className="product-help" href="tel:+40755436284">
            <Phone size={15} />
            <span>
              Comandă telefonic <strong>0755 436 284</strong>
            </span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
  return (
    <>
      <a className="skip" href="#main">
        Sari la conținut
      </a>
      <div className="announcement">
        <Truck size={15} />
        <span>
          Un plus de încredere.{" "}
          <strong>Transport gratuit la orice comandă.</strong>
        </span>
        <span className="announcement-right">
          Livrare în {delivery || "48 de ore"}
        </span>
      </div>
      <header className="header">
        <Link
          href="/"
          aria-label="Pucioasa Premium, pagina principală"
          className="brand"
        >
          <span>
            Pucioasa<span className="brand-accent">Premium</span>
          </span>
          <small>LENJERII DE PAT</small>
        </Link>
        <nav
          aria-label="Navigație principală"
          className={menu ? "nav open" : "nav"}
        >
          <a href="#produs" onClick={() => setMenu(false)}>
            Colecția noastră
          </a>
          <a href="#detalii" onClick={() => setMenu(false)}>
            Ce conține setul
          </a>
          <a href="#intrebari" onClick={() => setMenu(false)}>
            Întrebări frecvente
          </a>
        </nav>
        <a href="tel:+40755436284" className="header-phone">
          <Phone size={17} />
          <span>0755 436 284</span>
        </a>
        <button
          className="menu-button"
          aria-label={menu ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Cele mai fine și confortabile lenjerii de pat Pucioasa
            </h1>
            <p>
              Te-ai săturat de lenjeriile incomode, care nu oferă un somn
              odihnitor? Te-ai săturat de calitatea slabă care se degradează
              după câteva spălări? Comandă lenjeriile de pat Pucioasa din Damasc
              Fine de la Pucioasa Premium și scapă de aceste probleme.
            </p>
            <a href="#produs" className="primary">
              Alege culoarea și comandă <ArrowRight size={19} />
            </a>
            <a
              href="#produs"
              className="hero-palette"
              aria-label="Descoperă cele 19 culori"
            >
              <span className="palette-dots">
                {[colors[0], colors[2], colors[13], colors[14]].map((c) => (
                  <i key={c.id} style={{ background: c.hex }} />
                ))}
              </span>
              <span>19 culori superbe.</span>
            </a>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/hero-lenjerie-visinie.jpg"
              alt="Pat cu lenjerie vișinie într-un dormitor luminos"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <div className="image-label">
              <span>COLECȚIA PUCIOASA PREMIUM</span>
              <strong>Pentru un somn liniștit.</strong>
            </div>
            <div className="hero-price">
              <small>SET COMPLET</small>
              <strong>
                {product.amount / 100} <span>lei</span>
              </strong>
              <span className="badge-rule" />
              <small>COLECȚIA PREMIUM</small>
            </div>
          </div>
        </section>
        {renderProductSection()}
        <Reviews />
        {renderProductSection(true)}
      </main>
      <footer>
        <div className="footer-main">
          <div>
            <Link href="/" className="brand">
              <span>
                Pucioasa<span className="brand-accent">Premium</span>
              </span>
              <small>LENJERII DE PAT</small>
            </Link>
            <p>O nouă culoare pentru locul tău preferat.</p>
          </div>
          <div>
            <h3>Suntem aproape</h3>
            <a href="mailto:contact@pucioasa-premium.ro">
              contact@pucioasa-premium.ro
            </a>
            <a href="tel:+40755436284">0755 436 284</a>
          </div>
          <div>
            <h3>Informații utile</h3>
            <Link href="/informatii/termeni">Termeni și condiții</Link>
            <Link href="/informatii/livrare-retur">Livrare și retur</Link>
            <Link href="/informatii/confidentialitate">Confidențialitate</Link>
            <a
              href="https://anpc.ro/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ANPC
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Pucioasa Premium</span>
          <span>Plată securizată cu cardul</span>
        </div>
      </footer>
      <div className="mobile-buy">
        <div>
          <strong>{(product.amount / 100) * quantity} lei</strong>
          <small>
            {selected.name}
            {quantity > 1 ? ` · ${quantity} seturi` : ""}
          </small>
        </div>
        <a href="#produs" className="primary">
          Alege culoarea <ArrowRight size={16} />
        </a>
      </div>
    </>
  );
}
