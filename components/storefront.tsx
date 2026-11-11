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
import { colors, activeDeadline } from "@/lib/catalog.mjs";

export default function Storefront({
  ready,
  deadline,
  delivery,
  material,
}: {
  ready: boolean;
  deadline: string;
  delivery: string;
  material: string;
}) {
  const [selected, setSelected] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [remaining, setRemaining] = useState(0);
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
    const tick = () =>
      setRemaining(Math.max(0, (activeDeadline(deadline) || 0) - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]);
  function choose(c: (typeof colors)[number]) {
    setSelected(c);
    sessionStorage.setItem("pp-variant", c.id);
    setError("");
  }
  async function checkout() {
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
  return (
    <>
      <a className="skip" href="#main">
        Sari la conținut
      </a>
      <div className="announcement">
        <Truck size={15} />
        <span>
          Un plus de confort.{" "}
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
          <span>Suntem aici pentru tine</span>
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
            <span className="eyebrow">
              <span className="little-line" /> CONFORTUL ÎNCEPE ACASĂ
            </span>
            <h1>
              O nouă culoare.
              <br />
              Aceeași dorință de
              <br />
              <em>a rămâne în pat.</em>
            </h1>
            <p>
              Nuanțe care te reprezintă. Dungi discrete, care aduc armonie.
              Descoperă lenjeria care face dormitorul să se simtă din nou al
              tău.
            </p>
            <a href="#produs" className="primary">
              Alege culoarea ta <ArrowRight size={19} />
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
              <span>19 culori. Una pentru tine.</span>
            </a>
          </div>
          <div className="hero-visual">
            <Image
              src="/products/1.jpg"
              alt="Lenjerie de pat roz pal din colecția Pucioasa Premium"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <div className="image-label">
              <span>COLECȚIA PUCIOASA PREMIUM</span>
              <strong>Frumos, până la ultimul detaliu.</strong>
            </div>
            <div className="hero-price">
              <small>SET COMPLET</small>
              <strong>
                169 <span>lei</span>
              </strong>
              <span className="badge-rule" />
              <small>COLECȚIA ÎN DUNGI</small>
            </div>
          </div>
        </section>
        <section className="product-section section" id="produs">
          <div className="product-heading">
            <span className="eyebrow">ALEGE CE ȚI SE POTRIVEȘTE</span>
            <p>O culoare nouă. Un sentiment familiar.</p>
          </div>
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
                Fotografia corespunde variantei selectate. Nuanțele pot varia în
                funcție de ecran.
              </p>
              <div className="thumbnail-strip" aria-label="Fotografii variante">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => choose(c)}
                    title={c.name}
                    aria-label={`Vezi ${c.name}`}
                    aria-pressed={selected.id === c.id}
                    className={
                      selected.id === c.id ? "thumb selected" : "thumb"
                    }
                  >
                    <Image src={c.image} alt="" width={74} height={70} />
                  </button>
                ))}
              </div>
            </div>
            <div className="product-info">
              <span className="eyebrow">COLECȚIA ÎN DUNGI</span>
              <h2>
                Un pat frumos.
                <br />
                <em>În culoarea ta.</em>
              </h2>
              <p className="product-description">
                Alege nuanța preferată. Setul asortează cearșafurile și fețele
                de pernă, pentru un dormitor armonios.
              </p>
              <div className="price-row">
                <strong>
                  {169 * quantity} <span>lei</span>
                </strong>
                <span className="free-tag">
                  <Truck size={15} /> Transport gratuit
                </span>
              </div>
              <p className="price-footnote">
                {quantity === 1
                  ? "Prețul setului complet."
                  : `${quantity} seturi × 169 lei`}
              </p>
              <div className="divider" />
              <fieldset className="color-field">
                <legend>
                  <span className="field-step">01</span> Culoarea ta{" "}
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
              <div className="set-included" id="detalii">
                <div className="set-heading">
                  <span>
                    <Layers size={16} /> Ce conține setul
                  </span>
                  <small>6 piese, asortate</small>
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
                {material && (
                  <p className="included-material">Material: {material}</p>
                )}
              </div>

              {remaining > 0 && (
                <div className="offer">
                  <Clock size={18} />
                  <span>Comenzile pentru această ofertă se închid în</span>
                  <strong>
                    {hours}:{minutes}:{seconds}
                  </strong>
                </div>
              )}
              <div className="purchase-label">
                <span className="field-step">02</span> Câte seturi îți dorești?
              </div>
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
                  disabled={busy}
                  onClick={checkout}
                >
                  {busy ? "Se deschide plata…" : "Comandă acum"}
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
                    Ai revenit de la plată. Poți verifica selecția și relua
                    comanda.
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
                <span>Plată securizată prin Stripe</span>
                <span className="payment-brand">VISA</span>
                <span className="mastercard" aria-label="Mastercard">
                  <i />
                  <i />
                </span>
              </div>
              <div className="product-questions" id="intrebari">
                <div className="questions-heading">
                  Detalii pentru o alegere liniștită
                </div>
                <details>
                  <summary>
                    <span>
                      <Truck size={17} /> Livrare & transport
                    </span>
                    <Plus size={16} />
                  </summary>
                  <p>
                    Livrare în {delivery || "48 de ore"}, oriunde în România.
                    Costul transportului este inclus în prețul afișat.
                  </p>
                </details>
                <details>
                  <summary>
                    <span>
                      <ShieldCheck size={17} /> Cum plătesc?
                    </span>
                    <Plus size={16} />
                  </summary>
                  <p>
                    {ready
                      ? "Plătești"
                      : "La deschiderea comenzilor, vei putea plăti"}{" "}
                    cu cardul prin Stripe, fără să creezi un cont. Alegi
                    culoarea și cantitatea, apoi completezi datele de livrare în
                    pagina de plată.
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
                    Consumatorii beneficiază în general de dreptul legal de
                    retragere în 14 zile de la primire. Consultă{" "}
                    <Link href="/informatii/livrare-retur">
                      condițiile de retur
                    </Link>{" "}
                    și contactează-ne pentru instrucțiuni înainte de expediere.
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
                    corespunzătoare. Denumirea aleasă apare deasupra paletei și
                    se păstrează în comandă. Nuanțele pot varia ușor în funcție
                    de ecran.
                  </p>
                </details>
                <a className="product-help" href="tel:+40755436284">
                  <Phone size={15} />
                  <span>
                    Te ajutăm să alegi <strong>0755 436 284</strong>
                  </span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="editorial">
          <div className="editorial-image">
            <Image
              src="/products/3.jpg"
              alt="Lenjerie de pat vișinie cu dungi discrete"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
          <div className="editorial-copy">
            <span className="eyebrow">UN MIC RITUAL, ÎN FIECARE SEARĂ</span>
            <h2>
              Închide ziua.
              <br />
              <em>
                Deschide ușa
                <br />
                către confort.
              </em>
            </h2>
            <p>
              Uneori, tot ce îți trebuie este o schimbare simplă. Culoarea care
              îți place. Un pat frumos aranjat. Un moment doar pentru tine.
            </p>
            <a href="#produs" className="text-link">
              Găsește-ți nuanța <ArrowRight size={17} />
            </a>
          </div>
        </section>
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
          <span>Plăți procesate prin Stripe</span>
        </div>
      </footer>
      <div className="mobile-buy">
        <div>
          <strong>{169 * quantity} lei</strong>
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
