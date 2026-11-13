"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe, StripeCheckoutContact } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";

type Cart = {
  variants: string[];
  quantity: number;
  total: number;
  baseTotal: number;
  savings: number;
  signature: string;
  label: string;
  items: {
    color: { id: string; name: string; image: string; hex: string };
    quantity: number;
    unitAmount: number;
    lineTotal: number;
  }[];
};
type Props = {
  cart: Cart;
  ready: boolean;
  publishableKey: string;
};
type CheckoutState = { stripe: Stripe; clientSecret: string };
const money = (amount: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#681b37",
    colorBackground: "#ffffff",
    colorText: "#352f2b",
    colorDanger: "#a12138",
    fontFamily: "Arial, sans-serif",
    borderRadius: "8px",
    spacingUnit: "4px",
  },
};

export default function CheckoutPage(props: Props) {
  const [session, setSession] = useState<CheckoutState | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef("");
  useEffect(() => {
    if (!props.ready) return;
    const controller = new AbortController();
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    if (!requestId.current) {
      const cart = props.cart.signature;
      const now = Date.now();
      try {
        const previous = JSON.parse(
          sessionStorage.getItem("pp-checkout-request") || "null",
        );
        if (
          previous?.cart === cart &&
          typeof previous?.id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            previous.id,
          ) &&
          now - previous.createdAt < 20 * 60 * 60 * 1000 &&
          now >= previous.createdAt
        ) {
          requestId.current = previous.id;
        }
        requestId.current ||= crypto.randomUUID();
        sessionStorage.setItem(
          "pp-checkout-request",
          JSON.stringify({
            cart,
            id: requestId.current,
            createdAt:
              previous?.id === requestId.current ? previous.createdAt : now,
          }),
        );
      } catch {
        requestId.current ||= crypto.randomUUID();
      }
    }
    setError("");
    setSession(null);
    const initialize = async () => {
      const [stripe, response] = await Promise.all([
        loadStripe(props.publishableKey, { locale: "ro" }),
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variants: props.cart.variants,
            requestId: requestId.current,
          }),
          signal: controller.signal,
        }),
      ]);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Plata nu a putut fi pregătită.");
      if (!stripe || typeof data.clientSecret !== "string")
        throw new Error("Formularul securizat nu s-a putut încărca.");
      return { stripe, clientSecret: data.clientSecret };
    };
    Promise.race([
      initialize(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Conexiunea durează prea mult. Încearcă din nou."));
          controller.abort();
        }, 20000);
      }),
    ])
      .then((result) => {
        if (active) setSession(result);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Plata nu s-a putut încărca. Încearcă din nou.",
          );
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [props.ready, props.publishableKey, props.cart.signature, attempt]);

  const total = props.cart.total;
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link
          href="/"
          className="brand"
          aria-label="Pucioasa Premium, pagina principală"
        >
          <span>
            Pucioasa<span className="brand-accent">Premium</span>
          </span>
          <small>LENJERII DE PAT</small>
        </Link>
        <span className="checkout-header-secure">
          <LockKeyhole size={15} /> Comandă securizată
        </span>
      </header>
      <main className="checkout-main">
        <Link href="/#produs" className="checkout-back">
          <ArrowLeft size={15} /> Înapoi
        </Link>
        <div className="checkout-heading">
          <h1>
            Finalizează <span>comanda.</span>
          </h1>
          <p>Completează datele de livrare și confirmă comanda.</p>
        </div>
        <div className="checkout-layout">
          <div className="checkout-form-panel">
            {!props.ready && (
              <p className="checkout-notice" role="status">
                Plata online este în curs de configurare. Pentru comenzi și
                informații, sună la <a href="tel:+40755436284">0755 436 284</a>.
              </p>
            )}
            {error && (
              <div className="checkout-notice" role="alert">
                <p>{error}</p>
                <button
                  className="checkout-retry"
                  onClick={() => setAttempt((n) => n + 1)}
                >
                  Încearcă din nou
                </button>
              </div>
            )}
            {session ? (
              <CheckoutElementsProvider
                stripe={session.stripe}
                options={{
                  clientSecret: session.clientSecret,
                  elementsOptions: { appearance },
                }}
              >
                <LiveCheckout total={total} />
              </CheckoutElementsProvider>
            ) : (
              <OrderForm
                total={total}
                disabled
                payment={
                  <p className="checkout-payment-placeholder" role="status">
                    <LockKeyhole size={20} />
                    {props.ready && !error
                      ? "Se pregătește plata securizată…"
                      : "Câmpurile securizate pentru card vor apărea aici când plata este disponibilă."}
                  </p>
                }
              />
            )}
          </div>
          <aside className="checkout-summary" aria-label="Rezumatul comenzii">
            <h2>Comanda ta</h2>
            {props.cart.quantity > 1 && (
              <p className="checkout-bundle-label">{props.cart.label}</p>
            )}
            {props.cart.items.map((item) => (
              <div
                className="checkout-product"
                key={`${item.color.id}-${item.unitAmount}`}
              >
                <Image
                  src={item.color.image}
                  alt={`Lenjerie de pat — ${item.color.name}`}
                  width={112}
                  height={124}
                />
                <div>
                  <strong>Lenjerii de pat Pucioasa Premium</strong>
                  <span>
                    <i style={{ background: item.color.hex }} />
                    {item.color.name}
                  </span>
                  <small>
                    6 piese / set · {item.quantity}{" "}
                    {item.quantity === 1 ? "set" : "seturi"}
                  </small>
                  <small>{money(item.unitAmount)} / set</small>
                </div>
              </div>
            ))}
            <dl className="checkout-totals">
              <div>
                <dt>{props.cart.savings > 0 ? "Preț separat" : "Produse"}</dt>
                <dd>{money(props.cart.baseTotal)}</dd>
              </div>
              {props.cart.savings > 0 && (
                <div className="checkout-bundle-discount">
                  <dt>Reducere pachet</dt>
                  <dd>−{money(props.cart.savings)}</dd>
                </div>
              )}
              <div>
                <dt>Transport</dt>
                <dd className="checkout-free">Gratuit</dd>
              </div>
              <div className="checkout-total">
                <dt>Total de plată</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <p className="checkout-delivery">
              <Truck size={18} /> Livrarea este gratuită în maxim 48 de ore.
            </p>
            <p className="checkout-security">
              <ShieldCheck size={18} /> Datele cardului sunt procesate securizat.
            </p>
            <a className="product-help" href="tel:+40755436284">
              <Phone size={17} />
              <span>
                Ai nevoie de ajutor?<strong>0755 436 284</strong>
              </span>
              <ArrowRight size={15} />
            </a>
          </aside>
        </div>
        <nav className="checkout-footer" aria-label="Informații despre comandă">
          <Link href="/informatii/termeni">Termeni și condiții</Link>
          <Link href="/informatii/confidentialitate">Confidențialitate</Link>
          <Link href="/informatii/livrare-retur">Livrare și retur</Link>
        </nav>
      </main>
    </div>
  );
}

function AddressFields({ prefix }: { prefix: string }) {
  return (
    <div className="checkout-fields">
      <label className="checkout-field checkout-wide">
        Nume și prenume
        <input
          name={`${prefix}Name`}
          autoComplete="shipping name"
          required
          maxLength={100}
        />
      </label>
      <label className="checkout-field checkout-wide">
        Stradă și număr
        <input
          name={`${prefix}Line1`}
          autoComplete="shipping address-line1"
          required
          maxLength={200}
        />
      </label>
      <label className="checkout-field checkout-wide">
        Bloc, scară, apartament <span>(opțional)</span>
        <input
          name={`${prefix}Line2`}
          autoComplete="shipping address-line2"
          maxLength={200}
        />
      </label>
      <label className="checkout-field">
        Localitate
        <input
          name={`${prefix}City`}
          autoComplete="shipping address-level2"
          required
          maxLength={100}
        />
      </label>
      <label className="checkout-field">
        Județ / sector
        <input
          name={`${prefix}State`}
          autoComplete="shipping address-level1"
          required
          maxLength={100}
        />
      </label>
      <label className="checkout-field">
        Cod poștal
        <input
          name={`${prefix}Postal`}
          autoComplete="shipping postal-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          title="Codul poștal are 6 cifre."
          maxLength={6}
          required
        />
      </label>
      <label className="checkout-field">
        Țară
        <input value="România" readOnly autoComplete="shipping country-name" />
      </label>
    </div>
  );
}

function OrderForm({
  total,
  disabled = false,
  busy = false,
  payment,
  error,
  onSubmit,
}: {
  total: number;
  disabled?: boolean;
  busy?: boolean;
  payment: ReactNode;
  error?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="checkout-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled && !busy) onSubmit?.(event);
      }}
    >
      <fieldset disabled={disabled || busy} className="checkout-contact-fields">
        <legend>Date de contact</legend>
        <div className="checkout-fields">
          <label className="checkout-field">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="checkout-field">
            Telefon
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              minLength={7}
              maxLength={25}
            />
          </label>
        </div>
      </fieldset>
      <fieldset disabled={disabled || busy}>
        <legend>Unde livrăm?</legend>
        <AddressFields prefix="shipping" />
      </fieldset>
      <section className="checkout-payment">
        <div className="checkout-payment-heading">
          <h2>Plată securizată cu cardul</h2>
          <span className="payment-brand">VISA</span>
          <span className="mastercard" aria-label="Mastercard">
            <i />
            <i />
          </span>
        </div>
        {payment}
      </section>
      <label className="checkout-checkbox checkout-consent">
        <input
          type="checkbox"
          name="terms"
          required
          disabled={disabled || busy}
        />
        <span>
          Am citit și accept Termenii și condițiile. Datele sunt prelucrate
          conform Politicii de confidențialitate.
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="primary checkout-pay"
        disabled={disabled || busy}
      >
        <LockKeyhole size={17} />
        {busy ? "Se procesează plata…" : `Plătește ${money(total)}`}
        <ArrowRight size={17} />
      </button>
      <p className="checkout-payment-note">
        Banca îți poate cere să confirmi plata în aplicația sa.
      </p>
    </form>
  );
}

function contact(data: FormData, prefix: string): StripeCheckoutContact {
  const value = (name: string) => String(data.get(prefix + name) || "").trim();
  return {
    name: value("Name"),
    address: {
      country: "RO",
      line1: value("Line1"),
      line2: value("Line2"),
      city: value("City"),
      state: value("State"),
      postal_code: value("Postal"),
    },
  };
}

function LiveCheckout({ total }: { total: number }) {
  const state = useCheckoutElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const submitting = useRef(false);
  if (state.type === "loading")
    return (
      <OrderForm
        total={total}
        disabled
        payment={<p role="status">Se încarcă formularul securizat…</p>}
      />
    );
  if (state.type === "error")
    return (
      <OrderForm
        total={total}
        disabled
        error="Plata nu s-a putut încărca. Reîncarcă pagina sau contactează-ne telefonic."
        payment={
          <p role="status">Formularul de plată este indisponibil momentan.</p>
        }
      />
    );
  const { checkout } = state;
  async function pay(event: FormEvent<HTMLFormElement>) {
    if (submitting.current || !paymentReady) return;
    const data = new FormData(event.currentTarget);
    if (data.get("terms") !== "on") return;
    const shippingAddress = contact(data, "shipping");
    const billingAddress = shippingAddress;
    if (
      !shippingAddress.name ||
      !shippingAddress.address.line1 ||
      !shippingAddress.address.city
    ) {
      setError("Completează numele și adresa de livrare.");
      return;
    }
    if (
      checkout.currency !== "ron" ||
      checkout.total.total.minorUnitsAmount !== total
    ) {
      setError(
        "Totalul comenzii s-a modificat. Revino la produs pentru a verifica prețul.",
      );
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    let navigating = false;
    const enteredPhone = String(data.get("phone") || "")
      .trim()
      .replace(/[^\d+]/g, "");
    const phoneNumber = /^0\d{9}$/.test(enteredPhone)
      ? `+40${enteredPhone.slice(1)}`
      : enteredPhone.replace(/^00/, "+");
    try {
      const result = await checkout.confirm({
        email: String(data.get("email") || "").trim(),
        phoneNumber,
        shippingAddress,
        billingAddress,
        redirect: "if_required",
      });
      if (result.type === "error") {
        setError(
          result.error.message ||
            "Plata nu a reușit. Verifică datele și încearcă din nou.",
        );
        return;
      }
      navigating = true;
      window.location.assign(
        `/comanda/succes?session_id=${encodeURIComponent(result.session.id)}`,
      );
    } catch {
      setError(
        "Conexiunea cu procesatorul de plăți s-a întrerupt. Verifică înainte de a încerca din nou sau contactează-ne.",
      );
    } finally {
      if (!navigating) {
        submitting.current = false;
        setBusy(false);
      }
    }
  }
  if (checkout.status.type === "complete") {
    return (
      <div className="checkout-notice" role="status">
        <p>
          Această sesiune a fost finalizată. Verifică starea comenzii înainte de
          a plasa o comandă nouă.
        </p>
        <Link
          className="text-link"
          href={`/comanda/succes?session_id=${encodeURIComponent(checkout.id)}`}
        >
          Vezi starea comenzii <ArrowRight size={16} />
        </Link>
      </div>
    );
  }
  const unavailable = checkout.status.type !== "open";
  return (
    <OrderForm
      total={total}
      busy={busy}
      disabled={unavailable || !paymentReady}
      error={
        unavailable
          ? "Această sesiune de plată s-a încheiat. Revino la produs pentru a verifica sau relua comanda."
          : error
      }
      onSubmit={pay}
      payment={
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { link: "never" },
            fields: { billingDetails: "never" },
            readOnly: busy,
          }}
          onReady={() => setPaymentReady(true)}
          onLoadError={() => {
            setPaymentReady(false);
            setError(
              "Câmpurile de card nu s-au încărcat. Reîncarcă pagina și încearcă din nou.",
            );
          }}
        />
      }
    />
  );
}
