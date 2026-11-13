# SEO Pucioasa Premium

## Implementat în cod

- Titlu principal: „Lenjerii de pat Pucioasa, 6 piese | Pucioasa Premium”. Descriere cu materialul Damasc Fine, prețul actual din catalog, 19 culori și transport gratuit în România.
- Adrese canonice pe prima pagină și pe paginile informative, fără parametri de campanie; metadate Open Graph și Twitter complete, cu logo-ul Pucioasa Premium.
- Descrieri distincte pentru termeni, livrare/retur și confidențialitate.
- Sitemap cu cele nouă pagini publice: homepage, trei pagini informative și cinci ghiduri. Nicio adresă de comandă, confirmare a plății, administrare sau diagnostic în sitemap.
- Date structurate Product cu material, cod intern, fotografii, culori, preț și politica de livrare/retur. Oferta apare numai când magazinul poate accepta comenzi și termenul global al ofertei nu a expirat. Nu sunt inventate stocuri, coduri GTIN sau ratinguri agregate.
- Indexarea publică depinde de lansarea magazinului, nu de disponibilitatea cheilor de plată. Versiunile Vercel Preview, dezvoltarea locală și magazinul nelansat rămân noindex.
- Checkoutul și diagnosticul păstrează noindex și sunt accesibile crawlerelor ca acestea să poată citi instrucțiunea. Admin și API sunt excluse în robots.txt. Robots.txt nu este un mecanism de securitate; autentificarea admin rămâne necesară.

## 1. După integrarea codului în main

În Vercel verifică un deployment **Production — Ready**. În variabilele Production, `SITE_URL` trebuie să fie originea finală, în prezent `https://www.pucioasa-premium.ro`. Nu folosi adresa unui deployment Preview sau localhost. Codul normalizează originea și elimină slashul final, calea și parametrii.

Pentru indexare, `STORE_LIVE`, `PRODUCT_CONFIRMED` și `LEGAL_CONFIRMED` trebuie să fie `true`; păstrează semnificația acestor confirmări. Nu le activa înainte de verificarea informațiilor comerciale. Vercel furnizează automat `VERCEL_ENV=production` pentru publicare; nu suprascrie această variabilă în Preview. După modificarea variabilelor, redeploy.

În Vercel Domains, configurează `pucioasa-premium.ro` să redirecționeze permanent către `www.pucioasa-premium.ro`, dacă www este domeniul ales pentru magazin. Verifică și redirecționarea HTTP → HTTPS. Nu schimba domeniul checkoutului separat de `SITE_URL`.

Deschide apoi:

- `https://www.pucioasa-premium.ro/robots.txt` — trebuie să permită pagina publică, fără `Disallow: /` global.
- `https://www.pucioasa-premium.ro/sitemap.xml` — trebuie să conțină homepage, cele trei pagini informative și cele cinci ghiduri, pe domeniul final.
- Sursa homepage — canonical pe domeniul final și robots `index, follow`.

Verificările automate locale acoperă aceste rezultate, dar nu confirmă configurarea efectivă a Vercel sau ceea ce Google vede după publicare. Accesul direct la domeniul public este restricționat în actualul mediu Codex; nu s-au măsurat indicatorii Core Web Vitals ai site-ului live și nu s-a confirmat indexarea în Google.

## 2. Google Search Console — verificarea inițială

1. Intră la https://search.google.com/search-console cu contul Google al magazinului.
2. Adaugă o proprietate de tip **Domain / Domeniu**: `pucioasa-premium.ro`, fără `https://` și fără `www`.
3. Copiază înregistrarea TXT `google-site-verification=…` oferită de Google.
4. Adaugă în DNS-ul autoritativ al domeniului o înregistrare TXT la rădăcină (`@`, sau câmp gol, după interfața furnizorului). Păstrează toate înregistrările Resend existente și nu înlocui SPF, DKIM sau MX.
5. După propagarea DNS, apasă **Verify / Verifică** în Search Console. Nu elimina ulterior înregistrarea.

Verificarea Domain prin DNS nu necesită `GOOGLE_SITE_VERIFICATION` în Vercel. Dacă alegi alternativ o proprietate **URL prefix** pentru `https://www.pucioasa-premium.ro/`, poți folosi metoda HTML tag: în `GOOGLE_SITE_VERIFICATION` se introduce numai tokenul din atributul `content`, urmat de redeploy. Nu copia întregul element HTML în variabilă.

## 3. Trimiterea sitemapului și verificarea paginii

După verificarea proprietății:

- În **Sitemaps**, trimite `https://www.pucioasa-premium.ro/sitemap.xml`.
- În **URL Inspection / Inspectare adresă URL**, introdu `https://www.pucioasa-premium.ro/`, rulează testul live și verifică dacă indexarea este permisă. Solicită indexarea după ce testul confirmă că pagina este accesibilă.
- Verifică datele produsului în https://search.google.com/test/rich-results. Pot exista recomandări pentru câmpuri opționale; nu adăuga valori de stoc, rating sau identificatori de produs doar pentru a elimina avertismentele.
- Urmărește rapoartele Pages și Performance. Apariția în rezultate și pozițiile nu sunt garantate și nu se produc instantaneu.

## 4. Măsurare după publicare

Folosește PageSpeed Insights pe domeniul public pentru mobil și desktop. Separă scorurile de laborator de datele reale Core Web Vitals; pentru un site nou este posibil să nu existe încă suficiente date reale. Verifică LCP, INP și CLS înainte de a decide optimizări de performanță.

Urmărește în Search Console interogările relevante pentru produse, de exemplu „lenjerii de pat Pucioasa”, „lenjerii Damasc Fine”, „lenjerie de pat 6 piese”. Acestea sunt teme relevante pentru conținutul actual, nu rezultate ale unei cercetări de volum de căutare. Folosește impresiile, clicurile și comenzile reale pentru a decide dacă sunt utile pagini noi pentru produse sau ghiduri.

## Verificări în proiect

```sh
npm test
npm run build
npm run typecheck
node tests/seo-http.mjs
```

Testul HTTP verifică HTML-ul randat pe server, cu JavaScript dezactivat, în trei configurații: Production lansat, Preview și prelaunch. Verifică meta robots, canonical, sitemap, imagini sociale, paginile informative, răspunsul 404 și excluderea checkoutului din indexare. Nu contactează Stripe și nu efectuează plăți.


## Cele cinci ghiduri editoriale

Ghidurile sunt la adrese separate. Homepage-ul și meniul existent nu au linkuri către ele; ghidurile se leagă între ele și către produs. Sunt publice pentru orice vizitator care ajunge la URL, nu sunt ascunse prin CSS și nu afișează conținut diferit pentru Google. Sitemapul permite descoperirea fără a modifica homepage-ul, dar indexarea nu este garantată.

| Adresă | Subiect principal |
| --- | --- |
| `/ghiduri/ce-contine-o-lenjerie-de-pat-6-piese` | Componentele setului, cantități și formele fețelor de pernă |
| `/ghiduri/cum-alegi-dimensiunea-lenjeriei-de-pat` | Măsurarea saltelei, pilotei și pernelor |
| `/ghiduri/cum-alegi-culoarea-lenjeriei-de-pat` | Asortare, lumină și exemple de palete din colecție |
| `/ghiduri/lenjerii-damasc-fine-ghid-de-alegere` | Denumirea comercială, eticheta și comparația produselor |
| `/ghiduri/cum-speli-si-intretii-lenjeria-de-pat` | Sortare, spălare, uscare și depozitare, cu prioritate pentru etichetă |

Conținutul este în `lib/guides.mjs`. Dimensiunile produsului preiau informațiile afișate în pagina principală; la schimbarea specificațiilor, actualizează și ghidurile relevante. Nu au fost presupuse procente ale fibrelor, certificări, temperaturi de spălare sau compatibilitatea cu o anumită înălțime de saltea. Subiectele sunt alese după întrebări utile cumpărătorilor și oferta existentă, nu după date măsurate de volum al căutărilor.

Fiecare pagină are un titlu și o descriere distincte, canonical propriu, metadate sociale și schema Article + BreadcrumbList, care descrie conținutul vizibil. Regula existentă de noindex pentru Preview și prelaunch se aplică și ghidurilor. Nu se publică o listă separată la `/ghiduri`; există exact cele cinci adrese din tabel.

După merge și Production Ready, sitemapul existent va avea nouă adrese. Nu este necesar un sitemap nou. În Search Console, inspectează fiecare adresă de ghid, testează URL-ul live și solicită indexarea. Urmărește apoi indexarea și interogările reale; accesibilitatea tehnică nu garantează poziții în rezultate.


## Logo pentru share și favicon

Logo-ul furnizat de proprietar a fost adaptat în două variante: logo complet pe fundal alb pentru distribuire și simbolul patului pentru iconițe. Imaginea socială este `public/brand/share-logo-v1.jpg`, 1200 × 630 px; este folosită în Open Graph și Twitter pe homepage, paginile informative și ghiduri. Fotografiile produselor și imaginile din datele structurate Article/Product rămân specifice conținutului.

Next.js publică automat iconițele din `app/favicon.ico` (16, 32 și 48 px), `app/icon.png` (48 px) și `app/apple-icon.png` (180 px). Iconițele folosesc doar simbolul grafic pentru lizibilitate la scară mică.

După merge și deployment, browserele și platformele de share pot afișa temporar vechea imagine din cache. Verifică mai întâi metadatele și imaginea la URL-ul public. Pentru Facebook folosește Sharing Debugger și reîmprospătarea previzualizării; cache-ul platformelor poate întârzia afișarea noilor imagini. Actualizarea faviconului în Google nu este instantanee.
