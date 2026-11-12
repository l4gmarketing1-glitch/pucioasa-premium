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
  Phone,
  Menu,
  X,
  Check,
  Clock,
  BedDouble,
  Layers,
} from "lucide-react";
import {
  colors as catalogColors,
  activeDeadline,
  product,
} from "@/lib/catalog.mjs";
import { bundleOffers, quoteCart } from "@/lib/bundles.mjs";
import Reviews from "@/components/reviews";
import ReviewRating from "@/components/review-rating";

const colors = [
  ...catalogColors.filter((color) => color.id === "v04"),
  ...catalogColors.filter((color) => color.id !== "v04"),
];

const bundleMoney = (amount: number) =>
  new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: amount % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);

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
  const [chosenColors, setChosenColors] = useState<string[]>(["v04"]);
  const [quantity, setQuantity] = useState(1);
  const [activeSet, setActiveSet] = useState(0);
  const [selectionLoaded, setSelectionLoaded] = useState(false);
  const selected =
    colors.find((color) => color.id === chosenColors[activeSet]) || colors[0];
  const variants = chosenColors.slice(0, quantity);
  const cart = quoteCart({ variants })!;
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
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("pp-bundle-cart") || "null",
      );
      const restored = quoteCart(saved);
      if (
        restored &&
        bundleOffers.some((offer) => offer.quantity === restored.quantity)
      ) {
        setChosenColors(restored.variants);
        setQuantity(restored.quantity);
      } else {
        const previous = sessionStorage.getItem("pp-variant");
        if (colors.some((color) => color.id === previous))
          setChosenColors([previous!]);
      }
    } catch {}
    setSelectionLoaded(true);
    setCancelled(
      new URLSearchParams(window.location.search).get("checkout") ===
        "cancelled",
    );
  }, []);
  useEffect(() => {
    if (!selectionLoaded) return;
    try {
      sessionStorage.setItem(
        "pp-bundle-cart",
        JSON.stringify({ variants: chosenColors.slice(0, quantity) }),
      );
      sessionStorage.setItem("pp-variant", chosenColors[0]);
    } catch {}
  }, [chosenColors, quantity, selectionLoaded]);
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
    setChosenColors((previous) =>
      previous.map((id, index) => (index === activeSet ? c.id : id)),
    );
    setError("");
  }
  function chooseBundle(nextQuantity: number) {
    setChosenColors((previous) =>
      Array.from(
        { length: Math.max(previous.length, nextQuantity) },
        (_, index) => previous[index] || selected.id,
      ),
    );
    setQuantity(nextQuantity);
    setActiveSet((index) => Math.min(index, nextQuantity - 1));
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
      // A deliberate new order gets a new request; reloads inside checkout reuse it.
      try {
        sessionStorage.removeItem("pp-checkout-request");
      } catch {}
      window.location.assign(
        `/comanda?culori=${encodeURIComponent(variants.join(","))}`,
      );
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
            Alege oferta și combină culorile preferate.
          </p>
          {quantity === 1 && discount && !offerExpired && (
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
          {quantity > 1 && cart.savings > 0 && (
            <div className="discount-line">
              <span>
                Cumpărate separat <s>{bundleMoney(cart.baseTotal)} lei</s>
              </span>
              <strong>Economisești {bundleMoney(cart.savings)} lei</strong>
            </div>
          )}
          <div className="price-row">
            <strong>
              {bundleMoney(cart.total)} <span>lei</span>
            </strong>
            <span className="free-tag">
              <Truck size={15} /> Transport gratuit
            </span>
          </div>
          <p className="price-footnote">
            {quantity === 1
              ? "Prețul setului complet."
              : `Total pentru ${quantity} seturi · ${bundleMoney(cart.total / quantity)} lei / set`}
          </p>
          <div className="divider" />
          <fieldset className="bundle-options">
            <legend>Alege oferta</legend>
            {bundleOffers.map((offer) => {
              const savings = product.amount * offer.quantity - offer.amount;
              return (
                <label
                  key={offer.id}
                  className={`bundle-option${quantity === offer.quantity ? " is-selected" : ""}${offer.id === "trio" ? " is-recommended" : ""}`}
                >
                  <input
                    type="radio"
                    name={compact ? "pachet-comanda" : "pachet-produs"}
                    value={offer.quantity}
                    checked={quantity === offer.quantity}
                    onChange={() => chooseBundle(offer.quantity)}
                    aria-label={`${offer.label}, ${bundleMoney(offer.amount)} lei`}
                  />
                  <span className="bundle-option-copy">
                    <strong>{offer.label}</strong>
                    <small>
                      {bundleMoney(offer.amount / offer.quantity)} lei / set
                    </small>
                    {offer.badge && (
                      <span className="bundle-tag">{offer.badge}</span>
                    )}
                  </span>
                  <span className="bundle-option-price">
                    <strong>
                      {bundleMoney(offer.amount)} <span>lei</span>
                    </strong>
                    {savings > 0 && (
                      <small>Economisești {bundleMoney(savings)} lei</small>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>
          {quantity > 1 && (
            <div className="bundle-color-selection">
              <p>
                Alege culoarea fiecărui set{" "}
                <span>Poți combina orice culori.</span>
              </p>
              <div
                className="bundle-color-slots"
                role="group"
                aria-label="Culorile pachetului"
              >
                {variants.map((id, index) => {
                  const color = colors.find((item) => item.id === id)!;
                  return (
                    <button
                      key={index}
                      className={`bundle-color-slot${activeSet === index ? " is-active" : ""}`}
                      aria-pressed={activeSet === index}
                      aria-label={`Schimbă culoarea setului ${index + 1}: ${color.name}`}
                      onClick={() => setActiveSet(index)}
                    >
                      <Image src={color.image} alt="" width={36} height={40} />
                      <span>
                        <small>Setul {index + 1}</small>
                        <strong>{color.name}</strong>
                      </span>
                      {activeSet === index && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <fieldset className="color-field">
            <legend>
              {quantity === 1
                ? "Alege culoarea preferată"
                : `Culoarea setului ${activeSet + 1}`}{" "}
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
          {quantity > 1 && variants.some((id) => id !== selected.id) && (
            <button
              className="bundle-apply-color"
              onClick={() =>
                setChosenColors((previous) =>
                  previous.map((id, index) =>
                    index < quantity ? selected.id : id,
                  ),
                )
              }
            >
              Aplică {selected.name.toLowerCase()} tuturor seturilor
            </button>
          )}
          <div
            className="set-included"
            id={compact ? "comanda-detalii" : "detalii"}
          >
            <div className="set-heading">
              <span>
                <Layers size={16} />{" "}
                {quantity === 1 ? "Ce conține setul" : "Ce conține fiecare set"}
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
          <div className="purchase-row bundle-purchase">
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
                <p>Livrarea este gratuită în maxim 48 de ore prin Fan Curier Express</p>
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
              Cele mai fine și confortabile{" "}
              <span className="hero-title-accent">
                lenjerii de pat Pucioasa
              </span>
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
                {[
                  catalogColors[0],
                  catalogColors[2],
                  catalogColors[13],
                  catalogColors[14],
                ].map((c) => (
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
          <strong>{bundleMoney(cart.total)} lei</strong>
          <small>
            {quantity === 1
              ? selected.name
              : `${quantity} seturi · ${new Set(variants).size} ${new Set(variants).size === 1 ? "culoare" : "culori"}`}
          </small>
        </div>
        <a href="#produs" className="primary">
          Alege culoarea <ArrowRight size={16} />
        </a>
      </div>
    </>
  );
}
