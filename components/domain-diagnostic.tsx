"use client";

import { useEffect, useState } from "react";

export default function DomainDiagnostic({
  configuredOrigin,
}: {
  configuredOrigin: string;
}) {
  const [browserOrigin, setBrowserOrigin] = useState("");
  useEffect(() => setBrowserOrigin(window.location.origin), []);
  const mismatch = Boolean(browserOrigin && browserOrigin !== configuredOrigin);
  return (
    <section
      aria-labelledby="domain-diagnostic-title"
      data-domain-status={
        browserOrigin ? (mismatch ? "mismatch" : "matched") : "checking"
      }
    >
      <h2 id="domain-diagnostic-title">
        Adresa pentru checkout:{" "}
        {browserOrigin
          ? mismatch
            ? "nu corespunde"
            : "corespunde"
          : "se verifică"}
      </h2>
      <p>
        Adresa declarată prin SITE_URL: <code>{configuredOrigin}</code>
        <br />
        Adresa deschisă în browser:{" "}
        <code>{browserOrigin || "Se verifică…"}</code>
      </p>
      {mismatch ? (
        <p className="notice">
          Aceste adrese diferă, iar cererile de plată de pe această pagină vor
          fi respinse cu „Cerere neautorizată”. În Vercel, setează SITE_URL la
          adresa principală HTTPS a magazinului și configurează redirecționarea
          celeilalte variante (cu sau fără www) către aceasta. După redeploy,
          deschide magazinul pe adresa principală, nu pe un link vechi Vercel.
        </p>
      ) : browserOrigin ? (
        <p>
          Adresa browserului corespunde domeniului permis de server. Această
          verificare nu contactează Stripe.
        </p>
      ) : null}
    </section>
  );
}
