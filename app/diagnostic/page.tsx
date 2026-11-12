import Link from "next/link";
import { currentStoreConfigurationIssues } from "@/lib/configuration";
import { adminConfigurationIssues } from "@/lib/configuration.mjs";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Diagnostic configurare — Pucioasa Premium",
  robots: { index: false, follow: false },
};

export default function DiagnosticPage() {
  const storeIssues = currentStoreConfigurationIssues();
  const adminIssues = adminConfigurationIssues(process.env);
  const revision = process.env.VERCEL_GIT_COMMIT_SHA || "";
  const commit = /^[a-f0-9]{40}$/i.test(revision)
    ? revision.slice(0, 12)
    : "Indisponibil";
  const environment = ["production", "preview", "development"].includes(
    process.env.VERCEL_ENV || "",
  )
    ? process.env.VERCEL_ENV
    : "Local sau nespecificat";
  return (
    <main className="legal">
      <Link className="text-link" href="/">
        ← Înapoi la magazin
      </Link>
      <h1>Diagnostic configurare</h1>
      <p>
        Această pagină verifică setările disponibile în versiunea pe care o
        accesezi. Nu afișează parole, chei Stripe, datele firmei sau datele
        clienților.
      </p>
      <p>
        Versiune diagnostic: <strong>1</strong>
        <br />
        Commit: <code>{commit}</code>
        <br />
        Mediu: <strong>{environment}</strong>
      </p>
      <h2>
        Comenzi online:{" "}
        {storeIssues.length
          ? "blocate de configurare"
          : "configurare completată"}
      </h2>
      {storeIssues.length ? (
        <ul>
          {storeIssues.map((issue) => (
            <li key={issue.variable}>
              <strong>{issue.variable}</strong>: {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Toate condițiile locale de activare a comenzilor sunt îndeplinite.
          Această verificare nu validează cheile în contul Stripe și nu inițiază
          o plată.
        </p>
      )}
      <h2>
        Administrare:{" "}
        {adminIssues.length
          ? "blocată de configurare"
          : "autentificare disponibilă"}
      </h2>
      {adminIssues.length ? (
        <ul>
          {adminIssues.map((issue) => (
            <li key={issue.variable}>
              <strong>{issue.variable}</strong>: {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Parola îndeplinește condiția de configurare. Panoul necesită în
          continuare autentificare.
        </p>
      )}
      <h2>Cum corectezi setările</h2>
      <ol>
        <li>
          În proiectul corect din Vercel, deschide Settings → Environment
          Variables.
        </li>
        <li>
          Corectează numai variabilele indicate mai sus, cu numele scrise exact
          și mediul Production selectat. Parola și cheia secretă Stripe rămân
          private.
        </li>
        <li>
          Salvează și pornește un nou deploy pentru Production. Așteaptă Ready
          și verifică dacă domeniul este asociat acelui deployment.
        </li>
        <li>
          Reîncarcă această pagină. Dacă folosești un deployment vechi, valorile
          salvate ulterior nu sunt disponibile în el.
        </li>
      </ol>
      <p>
        Poți trimite o captură a acestei pagini pentru diagnostic. Nu trimite
        valorile variabilelor din Vercel.
      </p>
    </main>
  );
}
