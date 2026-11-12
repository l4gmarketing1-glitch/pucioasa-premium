# Stripe: configurare și verificare

Checkout-ul magazinului se află la `/comanda`. Pagina, datele de contact, adresa de livrare și rezumatul sunt în designul magazinului. Stripe Payment Element colectează datele cardului în câmpuri securizate, integrate în pagină. Nu folosim formularul complet găzduit de Stripe și nu colectăm numărul cardului sau CVC-ul pe serverul magazinului. Banca poate solicita o confirmare 3D Secure în timpul plății.

## 1. Testează într-un proiect/deployment Vercel de test

În Stripe Dashboard, intră în sandbox / modul de test și deschide Developers → API keys. În Vercel → proiect → Settings → Environment Variables, configurează pentru deployment-ul de test:

| Variabilă | Valoare |
| --- | --- |
| `STRIPE_SECRET_KEY` | Cheia secretă `sk_test_…` din Stripe; nu o trimite în chat și nu o adăuga în Git. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Cheia publicabilă `pk_test_…` din același cont/sandbox. |
| `SITE_URL` | Adresa HTTPS exactă a deployment-ului de test, fără slash final. |
| `ADMIN_USER` | Utilizatorul panoului de administrare. |
| `ADMIN_PASSWORD` | O parolă aleatoare de minimum 32 de caractere. |

Folosește un preview protejat sau un proiect Vercel separat pentru test; nu activa plata cu chei de test pe domeniul public al magazinului. Mediul de cod de aici nu are cheile Stripe și nu poate confirma o plată reală de test fără configurarea lor.

Checkout-ul este activ doar dacă `STORE_LIVE`, `PRODUCT_CONFIRMED` și `LEGAL_CONFIRMED` sunt `true` și sunt completate `BUSINESS_NAME`, `BUSINESS_CUI`, `BUSINESS_ADDRESS`, `CONTACT_EMAIL`, `DELIVERY_ESTIMATE`, `RETURN_ADDRESS`. Confirmările înseamnă că informațiile au fost efectiv verificate. Paginile legale trebuie completate, nu doar activate prin variabile.

În test, păstrează `VISITOR_OFFER_ENABLED=false` și `OFFER_ENDS_AT` gol pentru a testa plata fără expirarea ofertei. Oferta poate fi verificată separat după ce plata funcționează. Salvează variabilele și fă **Redeploy**; cheia publicabilă trebuie să existe și la build.

## 2. Parcurge comanda

1. Selectează o culoare și o cantitate pe pagina principală. „Comandă acum” deschide `/comanda` pe același site.
2. Verifică fotografia, culoarea, cantitatea, totalul de 149 lei/set și transportul gratuit.
3. Completează emailul, telefonul, numele și adresa din România, inclusiv un cod poștal de șase cifre. Adresa de facturare poate fi diferită.
4. Completează câmpurile Stripe pentru card și acceptă termenii. „Plătește … RON” confirmă sesiunea Stripe. O eroare păstrează formularul pentru corectare/reîncercare. Reîncărcarea aceleiași pagini reutilizează cererea de sesiune, printr-un identificator temporar din browser; o comandă nouă pornită de la produs primește o cerere nouă.
5. Pagina de confirmare citește sesiunea de pe server și afișează succes numai dacă plata este confirmată, comanda aparține magazinului, moneda și suma corespund.
6. Verifică în `/admin` și Stripe Dashboard starea **Plătită**, emailul, telefonul, adresa de livrare, culoarea, cantitatea și suma.

## 3. Scenarii de test Stripe

Folosește exclusiv chei de test și date de test. Numerele de mai jos sunt numere de test Stripe; pentru expirare folosește o dată viitoare, iar pentru CVC trei cifre.

- Plată reușită: `4242 4242 4242 4242`.
- Autentificare 3D Secure: `4000 0025 0000 3155`. Parcurge atât confirmarea, cât și anularea verificării.
- Card refuzat: `4000 0000 0000 0002`. Trebuie să apară eroare, fără mesaj fals de comandă plătită.
- Verifică schimbarea culorii/cantității, reîncărcarea paginii, revenirea la produs, conexiunea întreruptă și apăsarea repetată a butonului de plată.
- Verifică pe telefon și desktop, inclusiv cu adresa de facturare diferită.

Documentație oficială: https://docs.stripe.com/testing

## 4. Trecerea în producție

După testele de mai sus, configurează pentru Production perechea `sk_live_…` / `pk_live_…`, `SITE_URL=https://pucioasa-premium.ro` și datele reale ale firmei. Activează contul Stripe și verifică datele firmei, contul bancar, plățile cu cardul și emailurile de chitanță în Stripe Dashboard. Redeploy după modificarea cheilor. O pereche de chei test/live amestecată dezactivează checkout-ul.

Comenzile sunt citite direct din Stripe; nu există încă automatizare de livrare, gestiune de stoc sau facturare. Nu este nevoie de webhook pentru acest panou care citește Stripe direct. Pentru automatizări viitoare este necesar un webhook semnat, cu procesare idempotentă și stocare persistentă. Un client care închide browserul după plată rămâne înregistrat în Stripe și poate fi văzut în panoul de comenzi.

## Verificări locale

`npm test`, `npm run build`, `node tests/browser.mjs`, `node tests/checkout-integration.mjs`, `node tests/visitor-offer.mjs`. Testul de integrare folosește un server local și un SDK simulat; nu trimite tranzacții la Stripe. Testele locale acoperă prețul calculat pe server, selectarea variantei, cheile test/live, restricția de livrare în România, afișarea fără configurare și prevenirea confirmărilor false. Ele nu înlocuiesc tranzacțiile efectuate în sandbox-ul Stripe, autentificarea bancară sau verificarea datelor reale din panou.
