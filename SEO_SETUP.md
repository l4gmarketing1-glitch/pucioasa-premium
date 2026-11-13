# SEO Pucioasa Premium

## Implementat în cod

- Titlu principal: „Lenjerii de pat Pucioasa, 6 piese | Pucioasa Premium”. Descriere cu materialul Damasc Fine, prețul actual din catalog, 19 culori și transport gratuit în România.
- Adrese canonice pe prima pagină și pe paginile informative, fără parametri de campanie; metadate Open Graph și Twitter complete, cu fotografia produsului.
- Descrieri distincte pentru termeni, livrare/retur și confidențialitate.
- Sitemap cu cele patru pagini publice. Nicio adresă de comandă, confirmare a plății, administrare sau diagnostic în sitemap.
- Date structurate Product cu material, cod intern, fotografii, culori, preț și politica de livrare/retur. Oferta apare numai când magazinul poate accepta comenzi și termenul global al ofertei nu a expirat. Nu sunt inventate stocuri, coduri GTIN sau ratinguri agregate.
- Indexarea publică depinde de lansarea magazinului, nu de disponibilitatea cheilor de plată. Versiunile Vercel Preview, dezvoltarea locală și magazinul nelansat rămân noindex.
- Checkoutul și diagnosticul păstrează noindex și sunt accesibile crawlerelor ca acestea să poată citi instrucțiunea. Admin și API sunt excluse în robots.txt. Robots.txt nu este un mecanism de securitate; autentificarea admin rămâne necesară.

## 1. După integrarea codului în main

În Vercel verifică un deployment **Production — Ready**. În variabilele Production, `SITE_URL` trebuie să fie originea finală, în prezent `https://www.pucioasa-premium.ro`. Nu folosi adresa unui deployment Preview sau localhost. Codul normalizează originea și elimină slashul final, calea și parametrii.

Pentru indexare, `STORE_LIVE`, `PRODUCT_CONFIRMED` și `LEGAL_CONFIRMED` trebuie să fie `true`; păstrează semnificația acestor confirmări. Nu le activa înainte de verificarea informațiilor comerciale. Vercel furnizează automat `VERCEL_ENV=production` pentru publicare; nu suprascrie această variabilă în Preview. După modificarea variabilelor, redeploy.

În Vercel Domains, configurează `pucioasa-premium.ro` să redirecționeze permanent către `www.pucioasa-premium.ro`, dacă www este domeniul ales pentru magazin. Verifică și redirecționarea HTTP → HTTPS. Nu schimba domeniul checkoutului separat de `SITE_URL`.

Deschide apoi:

- `https://www.pucioasa-premium.ro/robots.txt` — trebuie să permită pagina publică, fără `Disallow: /` global.
- `https://www.pucioasa-premium.ro/sitemap.xml` — trebuie să conțină homepage și cele trei pagini informative, pe domeniul final.
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
