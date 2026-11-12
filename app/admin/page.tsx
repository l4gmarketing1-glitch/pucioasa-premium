import Link from "next/link";
import { orderVariants } from "@/lib/bundles.mjs";
import { stripeClient, storeReady } from "@/lib/store";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administrare comenzi",
  robots: { index: false, follow: false },
};
const money = (n: number) =>
  new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(
    n / 100,
  );
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ after?: string }>;
}) {
  const { after } = await searchParams;
  let result;
  let failed = false;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      result = await stripeClient().checkout.sessions.list({
        limit: 25,
        ...(after && /^cs_[A-Za-z0-9_]+$/.test(after)
          ? { starting_after: after }
          : {}),
      });
    } catch {
      failed = true;
    }
  }
  const orders =
    result?.data.filter((s) => s.metadata?.product_id === "lenjerie-6-piese") ||
    [];
  const paid = orders.filter((o) => o.payment_status === "paid");
  return (
    <main className="admin">
      <div className="admin-bar">
        <div>
          <span className="eyebrow">PUCIOASA PREMIUM · ADMINISTRARE</span>
          <h1>Comenzile tale.</h1>
        </div>
        <Link className="text-link" href="/">
          Vezi magazinul ↗
        </Link>
      </div>
      <p className="notice">
        {storeReady()
          ? "Magazinul acceptă comenzi."
          : "Magazinul este în pregătire. Plata este dezactivată până la completarea configurării."}
      </p>
      <p>
        <Link className="text-link" href="/admin/recenzii-preview">
          Previzualizare design recenzii →
        </Link>
      </p>
      <p className="muted">
        Datele sunt citite direct din Stripe. O sesiune neplătită nu reprezintă
        o comandă confirmată. Indicatorii se referă la pagina curentă.
      </p>
      <div className="admin-stats">
        <div className="stat">
          Comenzi plătite<strong>{paid.length}</strong>
        </div>
        <div className="stat">
          Valoare plăți pe pagină
          <strong>
            {money(paid.reduce((sum, o) => sum + (o.amount_total || 0), 0))}
          </strong>
        </div>
        <div className="stat">
          Sesiuni de plată pe pagină<strong>{orders.length}</strong>
        </div>
      </div>
      {!process.env.STRIPE_SECRET_KEY ? (
        <p>
          Conectează Stripe prin variabila STRIPE_SECRET_KEY în setările
          proiectului Vercel. Nu există date demonstrative despre clienți.
        </p>
      ) : failed ? (
        <p role="alert">
          Comenzile nu au putut fi încărcate din Stripe. Verifică integrarea și
          reîncarcă pagina.
        </p>
      ) : orders.length === 0 ? (
        <p>Nu există comenzi pentru acest produs pe pagina curentă.</p>
      ) : (
        orders.map((o) => {
          const address = o.collected_information?.shipping_details?.address;
          const customer = o.customer_details;
          return (
            <article className="order" key={o.id}>
              <header>
                <strong>
                  {new Date(o.created * 1000).toLocaleString("ro-RO", {
                    timeZone: "Europe/Bucharest",
                  })}{" "}
                  · {money(o.amount_total || 0)}
                </strong>
                <span
                  className={`status ${o.payment_status === "paid" ? "paid" : ""}`}
                >
                  {o.payment_status === "paid"
                    ? "Plătită"
                    : o.status === "expired"
                      ? "Sesiune expirată"
                      : "Neplătită"}
                </span>
              </header>
              <div className="order-grid">
                <div>
                  <h3>CLIENT</h3>
                  <p>
                    {customer?.name || "Date necompletate"}
                    <br />
                    {customer?.email}
                    <br />
                    {customer?.phone}
                  </p>
                </div>
                <div>
                  <h3>LIVRARE</h3>
                  <p>
                    {o.collected_information?.shipping_details?.name}
                    <br />
                    {address
                      ? [
                          address.line1,
                          address.line2,
                          address.city,
                          address.state,
                          address.postal_code,
                          address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "Adresa nu a fost completată."}
                  </p>
                </div>
                <div>
                  <h3>PRODUS</h3>
                  <p>
                    Lenjerie de pat · 6 piese / set
                    <br />
                    {o.metadata?.quantity} set(uri)
                    <br />
                    Transport: gratuit
                  </p>
                  {orderVariants(o.metadata).length ? (
                    <ul className="admin-variant-list">
                      {orderVariants(o.metadata).map((item) => (
                        <li key={item.name}>
                          {item.name} · {item.quantity}{" "}
                          {item.quantity === 1 ? "set" : "seturi"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{o.metadata?.color}</p>
                  )}
                </div>
              </div>
              <details>
                <summary>Referință și detalii plată</summary>
                <p>
                  {o.id}
                  <br />
                  Status Stripe: {o.status} / {o.payment_status}
                  <br />
                  Plată:{" "}
                  {typeof o.payment_intent === "string"
                    ? o.payment_intent
                    : "—"}
                </p>
              </details>
            </article>
          );
        })
      )}
      <div className="admin-bar">
        <Link className="text-link" href="/admin">
          Cele mai recente
        </Link>
        {result?.has_more && (
          <Link
            className="text-link"
            href={`/admin?after=${encodeURIComponent(result.data.at(-1)!.id)}`}
          >
            Pagina următoare →
          </Link>
        )}
      </div>
      <p className="muted">
        Rambursările și verificarea sumelor nete se fac în Stripe Dashboard.
        Starea „Plătită” indică plata inițială; nu confirmă expedierea și nu
        reflectă o rambursare ulterioară.
      </p>
    </main>
  );
}
