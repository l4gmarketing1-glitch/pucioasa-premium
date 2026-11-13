# Emailuri Resend și confirmare PDF — fără Neon

Aplicația trimite două emailuri după confirmarea plății: confirmarea clientului și notificarea comerciantului. Ambele includ PDF-ul „Confirmare comandă”, cu produsele, culorile, cantitățile, prețurile achitate și adresa de livrare. Documentul nu reprezintă factură fiscală.

Nu este necesar Neon, un cont suplimentar sau `DATABASE_URL`. Stripe confirmă plata către site și păstrează câteva marcaje de trimitere în metadatele comenzii. Resend expediază mesajele; aplicația generează PDF-ul. Crearea facturilor Stripe este dezactivată explicit la checkout.

## 1. Resend: domeniu verificat și cheie API

Domeniul `pucioasa-premium.ro` a fost verificat de proprietar în Resend. În **API Keys**, creează o cheie numită, de exemplu, `Pucioasa website`, cu permisiunea **Sending access** pentru domeniul verificat. Salvează cheia direct în setările securizate Vercel; nu o trimite în chat și nu o adăuga în Git.

Expeditor: `Pucioasa Premium <comenzi@pucioasa-premium.ro>`.

Destinatarul notificărilor comerciantului și adresa pentru răspunsuri: `pucioasapremium@gmail.com`.

Resend nu creează o căsuță de primire pe domeniu. Poți trimite de la expeditorul verificat fără găzduire email. Butonul „Răspunde” din emailul clientului va duce la Gmail prin `Reply-To`. Emailurile trimise direct către `comenzi@pucioasa-premium.ro` necesită separat o căsuță sau redirecționare. Nu înlocui înregistrările MX existente ale domeniului pentru configurarea trimiterii. Verifică limitele planului Resend; fiecare comandă folosește două emailuri.

## 2. Variabile în Vercel

Deschide proiectul → **Settings → Environment Variables**. Configurează variabilele în mediul de test / producție potrivit:

| Nume | Valoare |
| --- | --- |
| `ORDER_EMAILS_ENABLED` | `true`, după completarea tuturor setărilor |
| `RESEND_API_KEY` | Cheia nouă din Resend, începe cu `re_` |
| `ORDER_EMAIL_FROM` | `Pucioasa Premium <comenzi@pucioasa-premium.ro>` |
| `ORDER_NOTIFICATION_EMAIL` | `pucioasapremium@gmail.com` |
| `ORDER_REPLY_TO` | `pucioasapremium@gmail.com` |
| `STRIPE_WEBHOOK_SECRET` | Secretul `whsec_…` al endpointului din pasul 3 |

La introducerea în interfața Vercel, nu pune ghilimele în jurul valorilor. Cheile Stripe existente ale site-ului rămân necesare. Dacă folosești o cheie Stripe cu permisiuni restrânse, ea trebuie să permită citirea Checkout Sessions și a produselor/prețurilor, precum și actualizarea metadatelor Checkout Sessions. Dacă marcajul inițial nu poate fi salvat, aplicația nu trimite emailul.

Nu introduce cheia Resend în variabile cu prefix `NEXT_PUBLIC_`. Schimbarea setărilor necesită un **Redeploy** al unei versiuni care conține codul noii integrări. Modificările locale nu apar pe site până când această versiune nu este publicată.

## 3. Endpointul de confirmare a plății

În Stripe, în zona **Developers / Workbench → Webhooks**, adaugă un endpoint / event destination:

`https://www.pucioasa-premium.ro/api/webhooks/stripe`

Alege evenimentele:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Dacă domeniul final diferă, adaptează adresa. Endpointul trebuie să fie accesibil Stripe, fără protecție de acces care blochează serverele Stripe. Folosește același mod test/live cu cheia API a site-ului. Copiază secretul de semnare (`whsec_…`) în `STRIPE_WEBHOOK_SECRET`. Acesta este diferit de cheia API Stripe și de cheia Resend.

Completează setările, activează `ORDER_EMAILS_ENABLED=true` și publică / redeploy versiunea actualizată a aplicației. Nu activa vânzările doar pentru a testa emailuri; folosește o configurație Stripe de test și adrese pe care le controlezi.

Dacă nu dorești confirmări de plată suplimentare trimise de Stripe, verifică și dezactivează emailurile automate pentru plăți reușite din setările Stripe. Integrarea noastră nu le controlează.

## 4. Testul complet

1. Pe un deployment configurat cu Stripe de test, efectuează o comandă folosind o adresă proprie, cu mai multe culori. Nu sunt necesari bani reali.
2. Verifică emailul clientului și notificarea către `pucioasapremium@gmail.com`, inclusiv spam. Verifică PDF-ul: culori, cantități, prețuri, diacritice, adresă și total.
3. Verifică în panoul Resend starea livrării. Acceptarea mesajului de către API nu garantează sosirea în inbox; pot apărea bounce sau filtre spam.
4. Retrimite același eveniment din Stripe: mesajele cu marcaje de succes nu trebuie trimise din nou.
5. O plată refuzată sau nefinalizată nu trebuie să genereze confirmări.

Stripe folosește propriile mecanisme de reîncercare la răspuns 503, inclusiv pentru limitele de trimitere Resend. Verifică erorile în Stripe și Resend. Aplicația încearcă independent notificarea clientului și cea a comerciantului.

## Protecția împotriva duplicatelor și limite

Pentru fiecare destinatar, sesiunea Stripe păstrează `pp_email_v1_customer_*` / `pp_email_v1_merchant_*`: ora primei încercări, amprenta mesajului și ID-ul emailului acceptat de Resend. Datele personale și PDF-ul nu sunt copiate în aceste marcaje. Nu șterge sau edita marcajele pentru a declanșa o retrimitere.

Cererile concurente folosesc aceeași cheie Resend per comandă și destinatar. Resend păstrează cheile de idempotență 24 de ore. PDF-ul este generat determinist pentru reîncercări identice. Când ID-ul de succes este salvat în Stripe, evenimentele ulterioare sunt ignorate pentru acel destinatar, inclusiv după 24 de ore.

Dacă Resend a acceptat mesajul, dar conexiunea s-a întrerupt înaintea salvării marcajului în Stripe, reîncercările automate sunt permise numai în primele 23 de ore de la prima încercare. După acest interval, endpointul răspunde 503 pentru verificare manuală; nu trimite automat un posibil duplicat. Același lucru se întâmplă dacă între încercări se schimbă mesajul, destinatarul sau configurarea expeditorului.

În caz de eroare persistentă, verifică panoul Resend înaintea oricărei retrimiteri. Dacă emailul a fost acceptat, un operator poate înregistra ID-ul exact în marcajul corespunzător din sesiunea Stripe. Dacă dovedești că mesajul nu a fost acceptat, pregătește controlat o retrimitere. Nu reseta automat marcajele și nu schimba cheile de idempotență pentru a ocoli un conflict.

Nu există o coadă independentă, pagină de administrare a retrimiterilor sau garanția reluării nelimitate: sunt folosite reîncercările Stripe în limitele serviciului. Păstrează configurația și șablonul stabile cât timp sunt trimiteri în așteptare. O bază de date și un worker separat pot fi adăugate ulterior.

## Verificări locale

```sh
npm test
npm run build
npm run typecheck
node tests/notifications-http.mjs
```

Testele folosesc Stripe și Resend simulate, fără baze de date și fără trimitere reală. Testul HTTP verifică semnăturile pe ruta de producție. Cu `pdftotext` disponibil, testele generează și verifică `/tmp/pucioasa-notification-fixture.pdf`. Livrarea reală, configurația serviciilor și publicarea pe Vercel se verifică separat.
