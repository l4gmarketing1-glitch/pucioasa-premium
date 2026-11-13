/**
 * Editorial guides. Product-specific measurements are the ones currently shown
 * on the storefront. Do not infer fibre composition or care temperatures from
 * the trade name Damasc Fine; these must come from the manufacturer's label.
 * @typedef {{id: string, title: string, paragraphs: string[], bullets?: string[], tip?: string, table?: {caption: string, columns: string[], rows: string[][]}}} GuideSection
 * @typedef {{slug: string, title: string, metaTitle: string, description: string, intro: string, image: string, imageAlt: string, sections: GuideSection[], questions: {question: string, answer: string}[], related: string[]}} Guide
 */

/** @type {Guide[]} */
export const guides = [
  {
    slug: 'ce-contine-o-lenjerie-de-pat-6-piese',
    title: 'Ce conține o lenjerie de pat de 6 piese?',
    metaTitle: 'Lenjerie de pat 6 piese: ce conține setul',
    description: 'Află ce include un set de lenjerie de pat de 6 piese, cum se numără componentele și ce dimensiuni trebuie verificate înainte de comandă.',
    intro: 'Un set de 6 piese poate îmbrăca patul și patru perne, dar numărul de pe ambalaj nu spune singur dacă se potrivește dormitorului tău. Contează care sunt cele șase componente și ce dimensiuni are fiecare.',
    image: '/products/4.jpg', imageAlt: 'Set de lenjerie Pucioasa Premium bej nisipiu, fotografiat pe pat',
    sections: [
      {
        id: 'componente', title: 'Cum se numără cele șase piese',
        paragraphs: [
          'În setul Pucioasa Premium, cele șase piese sunt un cearșaf de pilotă, un cearșaf de pat și patru fețe de pernă. Cele patru fețe nu au toate aceeași formă: două sunt pătrate și două sunt dreptunghiulare. Împreună formează setul complet de textile.',
          'Cearșaful de pilotă este husa în care introduci pilota. Cearșaful de pat se așază pe saltea, iar fețele de pernă acoperă pernele pe care le ai deja. Un set de lenjerie nu trebuie confundat cu un pachet care include și pilota sau pernele propriu-zise.',
        ],
        table: { caption: 'Componentele setului Pucioasa Premium', columns: ['Piesă', 'Cantitate', 'Dimensiune'], rows: [
          ['Cearșaf de pilotă', '1', '200 × 230 cm'], ['Cearșaf de pat', '1', '180 × 200 cm'],
          ['Fețe de pernă pătrate', '2', '70 × 70 cm'], ['Fețe de pernă dreptunghiulare', '2', '50 × 70 cm'],
        ] },
      },
      {
        id: 'ce-nu-include', title: 'Ce nu rezultă din denumirea „6 piese”',
        paragraphs: [
          'Numărul pieselor nu stabilește dimensiunea patului, compoziția materialului sau modul de închidere. Două seturi descrise drept „6 piese” pot avea cearșafuri și fețe de pernă de mărimi diferite. Compară lista componentelor, nu doar fotografia unui pat aranjat.',
          'Accesoriile folosite în fotografia de prezentare, precum perne decorative suplimentare, pleduri sau alte obiecte din dormitor, nu devin automat componente ale setului. Pentru comanda ta, reperul este lista explicită de produse incluse.',
        ],
      },
      {
        id: 'patru-fete', title: 'Cum folosești cele două forme de fețe de pernă',
        paragraphs: [
          'Înainte de alegere, numără pernele și citește dimensiunile de pe etichetele lor. O pernă de 50 × 70 cm are nevoie de o față compatibilă; o față de 70 × 70 cm nu este echivalentă doar pentru că una dintre laturi coincide.',
          'Dacă folosești două perne dreptunghiulare pentru somn și două pătrate pentru sprijin sau aranjarea patului, combinația celor patru fețe poate fi utilă. Dacă ai doar perne de aceeași mărime, verifică dacă vei putea folosi toate componentele. Nu cumpăra exclusiv după numărul total de piese.',
        ],
      },
      {
        id: 'verificare', title: 'Lista scurtă de verificare înainte de comandă',
        paragraphs: ['O verificare de câteva minute este mai utilă decât presupunerea că orice lenjerie pentru pat dublu are aceeași mărime. Notează dimensiunile pe o foaie sau în telefon și compară fiecare componentă separat.'],
        bullets: [
          'Compară dimensiunea pilotei cu cea a cearșafului de pilotă.',
          'Măsoară salteaua și verifică forma și prinderea cearșafului de pat.',
          'Verifică dimensiunile tuturor pernelor pe care vrei să le îmbraci.',
          'Confirmă culoarea aleasă pentru fiecare set, mai ales într-un pachet cu mai multe seturi.',
        ],
        tip: 'Dimensiunile din tabel descriu acest set. Pentru compatibilitate, folosește măsurătorile patului, pilotei și pernelor tale.',
      },
    ],
    questions: [
      { question: 'Pilota și pernele sunt incluse?', answer: 'Setul prezentat include cearșaful de pilotă, cearșaful de pat și patru fețe de pernă. Pilota și pernele propriu-zise nu fac parte din această listă.' },
      { question: 'Două seturi înseamnă și două culori diferite?', answer: 'Poți alege aceeași culoare sau culori diferite pentru seturile din pachet. Verifică selecția fiecărui set înainte de finalizarea comenzii.' },
    ],
    related: ['cum-alegi-dimensiunea-lenjeriei-de-pat', 'cum-alegi-culoarea-lenjeriei-de-pat'],
  },
  {
    slug: 'cum-alegi-dimensiunea-lenjeriei-de-pat',
    title: 'Cum alegi dimensiunea potrivită pentru lenjeria de pat',
    metaTitle: 'Dimensiuni lenjerie de pat: ghid de măsurare',
    description: 'Măsoară salteaua, pilota și pernele înainte să alegi lenjeria. Vezi ce înseamnă dimensiunile cearșafului și cum eviți nepotrivirile.',
    intro: 'Lățimea patului este doar primul reper. Pentru o lenjerie care se așază corect, trebuie să verifici separat salteaua, pilota și pernele. O fotografie sau eticheta „pat dublu” nu înlocuiește aceste măsurători.',
    image: '/products/18.jpg', imageAlt: 'Lenjerie albă Pucioasa Premium pe pat, cu cearșaf de pilotă și perne',
    sections: [
      {
        id: 'saltea', title: 'Începe cu salteaua, nu cu rama patului',
        paragraphs: [
          'Măsoară lățimea și lungimea suprafeței pe care dormi, fără să incluzi rama, tăblia sau marginile decorative. Dacă ai un topper, ține cont și de el atunci când măsori înălțimea totală care trebuie acoperită de cearșaf.',
          'Un cearșaf cu elastic și unul simplu se aleg diferit. La primul trebuie verificată compatibilitatea cu salteaua și înălțimea acceptată. La un cearșaf simplu contează cât material rămâne pe margini pentru a-l așeza sau fixa. Nu presupune că două produse cu aceleași numere în titlu au aceeași prindere.',
        ],
        bullets: ['Notează lățimea saltelei.', 'Notează lungimea saltelei.', 'Măsoară înălțimea saltelei împreună cu topperul, dacă există.', 'Verifică în descriere tipul cearșafului și modul de fixare.'],
      },
      {
        id: 'pilota', title: 'Alege husa după pilotă',
        paragraphs: [
          'Cearșaful de pilotă se compară cu dimensiunea pilotei, nu direct cu lățimea saltelei. Citește eticheta pilotei sau măsoar-o întinsă, fără să tragi de material. Verifică ambele laturi și păstrează aceeași ordine a măsurătorilor când compari produsele.',
          'De exemplu, o husă de 200 × 230 cm nu este aceeași mărime cu una de 200 × 200 cm. Diferența de lungime poate lăsa material liber în interior sau poate face umplutura să se așeze neuniform. Nu trata diferențele de dimensiune ca pe o toleranță garantată.',
        ],
      },
      {
        id: 'perne', title: 'Verifică fiecare tip de pernă',
        paragraphs: [
          'Pernele pătrate și cele dreptunghiulare au nevoie de fețe potrivite formei lor. Într-un pat pot exista mai multe mărimi, chiar dacă pernele par asemănătoare atunci când sunt așezate unele peste altele.',
          'Pentru o pernă voluminoasă, verifică atât dimensiunea nominală, cât și indicațiile producătorului. Nu presupune că o față mai mică va compensa prin întindere: acest lucru depinde de material și construcție, nu doar de aspectul din fotografie.',
        ],
      },
      {
        id: 'exemplu', title: 'Exemplu de comparație pentru setul Pucioasa Premium',
        paragraphs: [
          'În prezentarea acestui set sunt afișate cearșaful de pilotă de 200 × 230 cm, cearșaful de pat de 180 × 200 cm, două fețe de pernă de 70 × 70 cm și două de 50 × 70 cm. Compară-le cu măsurătorile tale înainte de a alege culoarea.',
          'Dimensiunea afișată pentru cearșaful de pat nu precizează singură înălțimea de saltea pe care o poate acoperi. Dacă ai o saltea înaltă sau un topper gros, cere confirmarea tipului de cearșaf și a compatibilității înainte de comandă. O întrebare clară, însoțită de cele trei măsurători, reduce riscul unei alegeri nepotrivite.',
        ],
        tip: 'Păstrează o notiță cu saltea: lățime × lungime × înălțime; pilotă: lățime × lungime; perne: dimensiunea și numărul fiecărui tip.',
      },
    ],
    questions: [
      { question: 'Pot alege lenjeria doar după dimensiunea patului?', answer: 'Nu este suficient. Rama patului, salteaua și pilota pot avea dimensiuni diferite. Verifică separat componentele pe care urmează să le acopere lenjeria.' },
      { question: 'Ce fac dacă o dimensiune sau prinderea cearșafului nu este clară?', answer: 'Cere detaliul înainte de cumpărare. Comunică măsurătorile tale și produsul vizat, fără să presupui că materialul se va întinde sau că există o anumită toleranță.' },
    ],
    related: ['ce-contine-o-lenjerie-de-pat-6-piese', 'lenjerii-damasc-fine-ghid-de-alegere'],
  },
  {
    slug: 'cum-alegi-culoarea-lenjeriei-de-pat',
    title: 'Cum alegi culoarea lenjeriei de pat pentru dormitorul tău',
    metaTitle: 'Culoarea lenjeriei de pat: idei pentru dormitor',
    description: 'Bej, alb, vișiniu sau verde? Alege culoarea lenjeriei în funcție de lumină, mobilier și perdele, cu exemple din colecția Pucioasa Premium.',
    intro: 'Lenjeria ocupă o suprafață mare în dormitor și poate schimba felul în care se vede întreaga cameră. Nu trebuie să refaci decorul: pornește de la culorile pe care le ai deja și decide dacă vrei continuitate sau contrast.',
    image: '/products/14.jpg', imageAlt: 'Lenjerie de pat Pucioasa Premium în nuanța verde salvie',
    sections: [
      {
        id: 'repere', title: 'Alege un reper din cameră',
        paragraphs: [
          'Privește întâi elementele pe care nu le vei schimba: podeaua, mobilierul, tăblia patului și perdelele. O culoare reluată discret din unul dintre aceste elemente poate face ansamblul mai coerent. Nu este necesar ca toate textilele să aibă exact aceeași nuanță.',
          'Dacă perdelele sau covorul au deja un desen puternic, o lenjerie într-o singură culoare poate lăsa acele elemente să iasă în evidență. Într-o cameră cu pereți simpli și mobilier neutru, lenjeria poate deveni accentul principal.',
        ],
      },
      {
        id: 'palete', title: 'Câteva combinații de la care poți porni',
        paragraphs: ['Exemplele de mai jos sunt sugestii de amenajare, nu reguli. Nuanțele provin din denumirile colecției Pucioasa Premium; alege după fotografiile produsului și după felul în care arată camera ta.'],
        table: { caption: 'Idei de asortare a lenjeriei cu decorul', columns: ['Decorul dormitorului', 'Nuanțe de luat în calcul', 'Efect vizual urmărit'], rows: [
          ['Lemn deschis și tonuri calde', 'Bej nisipiu, Ivoriu, Verde salvie', 'O paletă apropiată de culorile naturale'],
          ['Alb și gri, cu linii simple', 'Gri perlat, Alb, Gri antracit', 'Continuitate sau contrast între tonuri'],
          ['Pereți neutri și accente închise', 'Vișiniu, Verde smarald, Albastru azur', 'Patul ca punct de interes'],
          ['Textile pastel și mobilier deschis', 'Roz pudrat, Roz liliac, Verde mentă', 'Repetarea unor nuanțe deschise'],
        ] },
      },
      {
        id: 'lumina', title: 'Ține cont de lumină și de fotografii',
        paragraphs: [
          'Aceeași lenjerie poate părea diferită lângă o fereastră, seara sub o lumină caldă sau într-un colț umbrit. Privește camera atât ziua, cât și seara înainte să decizi cât de deschisă sau intensă vrei să fie culoarea patului.',
          'Fotografiile sunt un reper, dar ecranul, luminozitatea și lumina folosită la fotografiere pot modifica percepția nuanței. Dacă încerci să potrivești exact o culoare deja existentă, nu lua o captură de ecran drept mostră fizică. Compară mai multe fotografii și păstrează loc pentru mici diferențe de aspect.',
        ],
      },
      {
        id: 'alternare', title: 'Două seturi pot avea roluri vizuale diferite',
        paragraphs: [
          'Dacă alegi mai multe seturi, poți păstra unul neutru și unul într-o culoare mai accentuată. De exemplu, bejul nisipiu poate continua un decor cald, iar vișiniul poate aduce contrast în aceeași cameră. Alegerea depinde de gustul tău și de textilele pe care le păstrezi pe pat.',
          'În selectorul magazinului, culoarea se alege pentru fiecare set. Verifică toate pozițiile din pachet înainte de plată, mai ales dacă ai folosit opțiunea de a aplica aceeași culoare tuturor seturilor. Astfel, combinația din comandă va fi cea pe care ai intenționat-o.',
        ],
        tip: 'Pentru o alegere simplă, notează trei lucruri: culoarea dominantă a camerei, un accent care îți place și dacă preferi un pat discret sau unul care atrage privirea.',
      },
    ],
    questions: [
      { question: 'Trebuie să aleg lenjeria în aceeași culoare cu perdelele?', answer: 'Nu. Poți relua o nuanță apropiată, poți alege o culoare neutră sau poți crea un contrast. Important este să privești împreună lenjeria, perdelele și mobilierul.' },
      { question: 'Nuanța din fotografie va arăta identic în camera mea?', answer: 'Lumina din cameră și setările ecranului pot schimba percepția culorii. Folosește fotografiile ca reper, fără a presupune o potrivire perfectă cu alte textile.' },
    ],
    related: ['lenjerii-damasc-fine-ghid-de-alegere', 'cum-speli-si-intretii-lenjeria-de-pat'],
  },
  {
    slug: 'lenjerii-damasc-fine-ghid-de-alegere',
    title: 'Lenjerii Damasc Fine: ce verifici înainte să alegi',
    metaTitle: 'Lenjerii Damasc Fine: material și ghid de alegere',
    description: 'Ce verifici la o lenjerie Damasc Fine: denumirea materialului, compoziția de pe etichetă, dimensiunile, fotografiile și instrucțiunile de îngrijire.',
    intro: 'Denumirea materialului este un punct de pornire, însă o alegere informată se bazează pe mai multe detalii. La o lenjerie Damasc Fine, verifică eticheta, componentele și dimensiunile, apoi alege culoarea care se potrivește dormitorului.',
    image: '/products/3.jpg', imageAlt: 'Set Pucioasa Premium din colecția Damasc Fine, în culoarea vișiniu',
    sections: [
      {
        id: 'denumire', title: 'Denumirea comercială și compoziția sunt informații diferite',
        paragraphs: [
          'În prezentarea Pucioasa Premium, Damasc Fine este denumirea materialului furnizată pentru colecție. Denumirea comercială nu înlocuiește lista fibrelor și a procentelor de pe eticheta produsului. Pentru a compara corect două lenjerii, caută ambele tipuri de informații.',
          'În descrierea textilelor, termenul damasc este folosit în legătură cu țesături și efecte de desen rezultate din țesere. El nu stabilește singur un procent de bumbac și nu dovedește o anumită certificare. Nu deduce compoziția, proprietăți antialergice sau instrucțiuni de spălare doar din numele colecției.',
        ],
      },
      {
        id: 'eticheta', title: 'Ce informații merită cerute înainte de cumpărare',
        paragraphs: [
          'Dacă preferi o anumită fibră sau ai cerințe precise de întreținere, verifică eticheta ori cere aceste detalii comerciantului. O întrebare concretă, precum „Care este compoziția în procente?”, este mai utilă decât aprecierea generală că un material pare fin în fotografie.',
          'Fotografiile pot arăta culoarea, felul în care este aranjat setul și unele detalii de suprafață. Nu pot confirma singure senzația la atingere, grosimea exactă, rezistența după un număr de spălări sau compatibilitatea cu orice uscător. Pentru asemenea informații, folosește specificațiile produsului.',
        ],
        bullets: [
          'Compoziția materialului, cu denumirea fibrelor și procentele.',
          'Instrucțiunile de spălare, uscare și călcare de pe etichetă.',
          'Dimensiunile fiecărei piese și tipul de prindere al cearșafului.',
          'Conținutul exact al setului și culoarea variantei selectate.',
        ],
      },
      {
        id: 'comparatie', title: 'Compară seturi echivalente',
        paragraphs: [
          'Un preț mai mic sau mai mare nu spune singur ce primești. Compară numărul de piese, dimensiunile, costul transportului și condițiile de retur. Un set cu două fețe de pernă nu se compară direct, doar după preț, cu unul care conține patru fețe de două mărimi.',
          'Separă și preferința estetică de compatibilitatea practică. O nuanță potrivită dormitorului nu compensează o husă prea mică pentru pilotă. Mai întâi verifică mărimile și informațiile despre material, apoi restrânge alegerea la culorile care îți plac.',
        ],
      },
      {
        id: 'colectie', title: 'Ce găsești în colecția Pucioasa Premium',
        paragraphs: [
          'Colecția prezentată în magazin are 19 variante de culoare și seturi de 6 piese: un cearșaf de pilotă, un cearșaf de pat și patru fețe de pernă. Fotografiile variantelor și dimensiunile pieselor sunt disponibile în pagina produsului.',
          'Poți selecta o culoare pentru fiecare set din pachet și poți verifica totalul înainte de plată. Dacă informația de care ai nevoie nu apare în descriere, cere-o înainte de comandă. Alegerea unui produs potrivit începe cu potrivirea dintre caracteristicile lui și nevoile tale, nu cu presupuneri despre denumire.',
        ],
        tip: 'Păstrează eticheta și instrucțiunile de întreținere după cumpărare. Ele rămân reperul pentru îngrijirea setului ales.',
      },
    ],
    questions: [
      { question: 'Damasc Fine înseamnă automat 100% bumbac?', answer: 'Nu poți stabili procentul de bumbac doar din denumirea comercială. Compoziția trebuie verificată pe eticheta produsului sau în specificațiile confirmate de comerciant.' },
      { question: 'Pot folosi aceeași temperatură de spălare pentru orice lenjerie damasc?', answer: 'Nu presupune că toate produsele au aceleași instrucțiuni. Urmează eticheta setului pe care îl ai, inclusiv indicațiile privind uscarea și călcarea.' },
    ],
    related: ['ce-contine-o-lenjerie-de-pat-6-piese', 'cum-speli-si-intretii-lenjeria-de-pat'],
  },
  {
    slug: 'cum-speli-si-intretii-lenjeria-de-pat',
    title: 'Cum speli și întreții lenjeria de pat',
    metaTitle: 'Spălarea lenjeriei de pat: îngrijire și depozitare',
    description: 'Ghid practic pentru îngrijirea lenjeriei de pat: citirea etichetei, sortarea culorilor, spălarea, uscarea și depozitarea seturilor.',
    intro: 'Îngrijirea lenjeriei începe înainte de primul program al mașinii de spălat. Eticheta setului îți spune ce tratamente suportă materialul; câteva obiceiuri simple te ajută apoi să organizezi spălarea și depozitarea.',
    image: '/products/15.jpg', imageAlt: 'Lenjerie Pucioasa Premium în nuanța ivoriu, aranjată pe pat',
    sections: [
      {
        id: 'eticheta', title: 'Citește eticheta înainte de prima spălare',
        paragraphs: [
          'Verifică instrucțiunile pentru spălare, înălbire, uscare și călcare. Temperatura maximă permisă, folosirea uscătorului și setarea fierului nu se stabilesc doar după culoare sau după denumirea materialului. Dacă eticheta este neclară, cere explicații înainte de a începe.',
          'Pentru o lenjerie nouă, urmează recomandările producătorului privind pregătirea înainte de folosire. Nu aplica automat programul folosit pentru prosoape sau pentru alt set: textilele pot avea compoziții, finisaje și instrucțiuni diferite.',
        ],
      },
      {
        id: 'sortare', title: 'Pregătește piesele și sortează culorile',
        paragraphs: [
          'Separă albul de textilele intens colorate și evită amestecarea produselor noi în culori puternice cu piese foarte deschise. Verifică fețele de pernă și cearșafurile pentru obiecte prinse în pliuri sau zone care au nevoie de atenție înainte de spălare.',
          'Respectă capacitatea mașinii și recomandările programului pentru textile voluminoase. Un tambur umplut foarte strâns lasă mai puțin spațiu pentru mișcarea pieselor. Cearșafurile mari se pot strânge unele în altele, așa că așază-le fără să le îndeși și verifică încărcarea recomandată de producătorul mașinii.',
        ],
        bullets: ['Grupează culori apropiate și materiale cu instrucțiuni compatibile.', 'Verifică eticheta înainte de a folosi înălbitor sau alte tratamente.', 'Alege cantitatea de detergent după instrucțiunile produsului, încărcare și duritatea apei.', 'Nu adăuga mai mult detergent doar pentru că piesele sunt mari.'],
      },
      {
        id: 'pete', title: 'Tratează petele cu atenție',
        paragraphs: [
          'Identifică pata și citește indicațiile soluției pe care vrei să o folosești. Verifică dacă este potrivită pentru material și pentru textile colorate. Când instrucțiunile permit, încearcă întâi pe o zonă discretă; nu amesteca produse de curățare între ele.',
          'Evită frecarea agresivă și aplicarea directă a unor produse concentrate fără indicații. Dacă pata persistă, verifică recomandările producătorului înainte de a repeta tratamentul sau de a folosi o temperatură mai mare. O temperatură ridicată nu este o soluție universală pentru orice pată.',
        ],
      },
      {
        id: 'uscare', title: 'Uscarea și călcarea urmează aceleași instrucțiuni',
        paragraphs: [
          'După terminarea programului, scoate piesele și desfă-le pentru a nu rămâne strânse într-un ghem umed. Alege uscarea naturală sau uscătorul numai în condițiile permise de etichetă. Nu presupune că un program delicat al uscătorului este potrivit pentru orice material.',
          'La călcare, folosește temperatura și aburul doar dacă sunt permise pentru acel set. Verifică indicațiile înainte de a călca peste zone cu închideri sau alte accesorii. Dacă materialul nu trebuie călcat, nu încerca să compensezi printr-o temperatură mai mică fără confirmarea instrucțiunilor.',
        ],
      },
      {
        id: 'depozitare', title: 'Depozitează seturile complet uscate',
        paragraphs: [
          'Împăturește piesele după ce sunt uscate complet și păstrează-le într-un spațiu curat și uscat. Gruparea componentelor aceluiași set te ajută să găsești mai repede cearșaful și fețele de pernă potrivite atunci când schimbi patul.',
          'Dacă alternezi mai multe seturi, verifică periodic și piesele folosite mai rar. Înainte de utilizare, uită-te la cusături și la închideri și rezolvă micile deteriorări înainte ca acestea să se extindă. O rutină simplă de verificare este mai utilă decât tratamente aplicate fără să cunoști materialul.',
        ],
        tip: 'Ghidul oferă pași generali. Pentru temperaturi, produse compatibile și metode de uscare, instrucțiunile de pe eticheta lenjeriei au prioritate.',
      },
    ],
    questions: [
      { question: 'La câte grade se spală lenjeria Damasc Fine?', answer: 'Folosește temperatura indicată pe eticheta setului. Denumirea Damasc Fine nu permite stabilirea unei temperaturi universale de spălare.' },
      { question: 'Pot pune lenjeria în dulap dacă este încă puțin umedă?', answer: 'Lasă piesele să se usuce complet înainte de împăturire și depozitare. Păstrează-le într-un spațiu uscat, pentru a evita reținerea umezelii.' },
    ],
    related: ['lenjerii-damasc-fine-ghid-de-alegere', 'cum-alegi-culoarea-lenjeriei-de-pat'],
  },
];

export const guideSlugs = guides.map(guide => guide.slug);
export const getGuide = (slug) => guides.find(guide => guide.slug === slug);

export function guideStructuredData(guide, origin) {
  const url = new URL(`/ghiduri/${guide.slug}`, origin).href;
  const home = new URL('/', origin).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', '@id': `${url}#articol`, headline: guide.title,
        description: guide.description, inLanguage: 'ro-RO',
        image: [new URL(guide.image, origin).href],
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@type': 'Organization', name: 'Pucioasa Premium', url: home },
        publisher: { '@type': 'Organization', name: 'Pucioasa Premium', url: home },
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Pucioasa Premium', item: home },
          { '@type': 'ListItem', position: 2, name: guide.title, item: url },
        ],
      },
    ],
  };
}
