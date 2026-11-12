import Link from "next/link";
import { product } from "@/lib/catalog.mjs";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
const titles: Record<string, string> = {
  termeni: "Termeni și condiții",
  "livrare-retur": "Livrare și retur",
  confidentialitate: "Confidențialitate",
};
const confirmedAddress =
  "Strada 8 Martie, fără număr, Pucioasa, județul Dâmbovița, România";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return { title: titles[(await params).slug] || "Informații" };
}

export default async function Legal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!titles[slug]) notFound();
  const merchant = process.env.BUSINESS_NAME?.trim() || "Pucioasa Premium";
  const address = process.env.BUSINESS_ADDRESS?.trim() || confirmedAddress;
  const returnAddress = process.env.RETURN_ADDRESS?.trim() || address;
  const email =
    process.env.CONTACT_EMAIL?.trim() || "contact@pucioasa-premium.ro";
  const fiscalCode = process.env.BUSINESS_CUI?.trim();

  return (
    <main className="legal">
      <Link className="text-link" href="/">
        ← Înapoi la magazin
      </Link>
      <h1>{titles[slug]}</h1>
      {process.env.LEGAL_CONFIRMED !== "true" && (
        <p className="notice">
          Informații în curs de verificare înainte de deschiderea comenzilor.
        </p>
      )}
      <h2>Contact și identificare</h2>
      <p>
        {merchant}
        <br />
        Adresă: {address}
        {fiscalCode && (
          <>
            <br />
            CUI: {fiscalCode}
          </>
        )}
      </p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
        <br />
        Telefon: <a href="tel:+40755436284">0755 436 284</a>
      </p>
      {slug === "termeni" ? (
        <>
          <h2>Produse și prețuri</h2>
          <p>
            Magazinul comercializează seturi de lenjerie de pat cu 6 piese. Un
            set costă {product.amount / 100} lei. Pachetele de mai multe seturi
            beneficiază de prețurile afișate la selectarea ofertei. Culorile,
            cantitățile, reducerea aplicabilă și totalul de plată sunt
            prezentate înaintea confirmării plății. Prețurile sunt exprimate în
            lei, cu taxele aplicabile incluse. Transportul este gratuit în
            România.
          </p>
          <h2>Cum comanzi</h2>
          <p>
            Alege oferta și culoarea fiecărui set, apoi apasă „Comandă acum”.
            Completează datele de contact și livrare și verifică rezumatul
            înainte de plată. Poți reveni la produs pentru a modifica selecția.
            Nu este necesar un cont de client. Apăsarea butonului „Plătește”
            inițiază o comandă cu obligație de plată.
          </p>
          <h2>Plata și confirmarea</h2>
          <p>
            Plățile cu cardul sunt procesate prin Stripe. Magazinul nu primește
            numărul complet al cardului sau codul CVC. Plata este confirmată
            numai după verificarea statusului la procesatorul de plăți. Dacă
            plata este refuzată, pagina afișează o eroare și permite
            reîncercarea. Pentru nelămuriri privind o plată sau o comandă,
            contactează-ne înainte de a repeta plata.
          </p>
          <h2>Livrare, retur și conformitate</h2>
          <p>
            Livrarea este gratuită în maxim 48 de ore prin Fan Curier Express.
            Condițiile de retragere și rambursare sunt prezentate în pagina
            „Livrare și retur”. Drepturile legale ale consumatorului, inclusiv
            garanția legală de conformitate aplicabilă bunurilor, rămân
            aplicabile. Pentru un produs deteriorat, greșit sau neconform,
            contactează-ne pentru soluționare.
          </p>
          <h2>Asistență și reclamații</h2>
          <p>
            Ne poți contacta la {email} sau 0755 436 284, indicând referința
            comenzii și problema întâmpinată. Poți sesiza și{" "}
            <a href="https://anpc.ro/">
              Autoritatea Națională pentru Protecția Consumatorilor
            </a>
            . Contactarea magazinului nu limitează drepturile sau căile legale
            de soluționare a reclamațiilor.
          </p>
          <Link href="/informatii/livrare-retur" className="text-link">
            Informații despre livrare și retur →
          </Link>
        </>
      ) : slug === "livrare-retur" ? (
        <>
          <h2>Livrare gratuită</h2>
          <p>
            Livrarea este gratuită în maxim 48 de ore prin Fan Curier Express,
            în România. Pentru stadiul livrării sau corectarea datelor,
            contactează magazinul cu referința comenzii.
          </p>
          <h2>Dreptul de retragere</h2>
          <p>
            Consumatorii pot comunica retragerea dintr-un contract online, fără
            a invoca un motiv, în termen de 14 zile de la primirea produselor.
            Trimite la {email} o declarație clară de retragere, împreună cu
            numele, referința comenzii și produsele returnate. Poți comunica
            retragerea și în scris la adresa magazinului. Nu este obligatoriu un
            formular special sau aprobarea prealabilă a magazinului.
          </p>
          <h2>Expedierea returului</h2>
          <p>
            Adresa pentru retur: {returnAddress}. Destinatar: {merchant}.
            Telefon: 0755 436 284.
          </p>
          <p>
            Expediază produsele în cel mult 14 zile de la comunicarea retragerii
            și păstrează dovada expedierii. Ambalează-le astfel încât să fie
            protejate în timpul transportului. Pentru un retur prin retragere,
            costul direct al expedierii returului este suportat de client;
            acesta este tariful curierului ales. Pentru produse neconforme sau
            trimise greșit, contactează-ne pentru o soluționare fără costuri în
            sarcina ta, potrivit drepturilor legale.
          </p>
          <p>
            Poți verifica produsele în măsura necesară stabilirii naturii,
            caracteristicilor și funcționării lor. O eventuală diminuare a
            valorii rezultată din manipulări suplimentare se tratează potrivit
            legii; nu aplicăm automat o taxă fixă de retur.
          </p>
          <h2>Rambursarea</h2>
          <p>
            Rambursăm sumele datorate în urma retragerii în cel mult 14 zile de
            la informarea magazinului, prin aceeași metodă de plată, fără
            comisioane de rambursare pentru client. Putem amâna rambursarea până
            la primirea produselor sau a dovezii expedierii lor, luând în
            considerare momentul care intervine primul. Transportul inițial este
            gratuit, astfel că nu există un cost de livrare inițial de
            rambursat.
          </p>
          <h2>Model de mesaj pentru retragere</h2>
          <p>
            „Vă informez că doresc să mă retrag din contractul aferent comenzii
            [referință], pentru produsele [produse], primite la data de [data].
            Nume: [nume]. Adresă: [adresă]. Data comunicării: [data].” Pentru o
            notificare pe hârtie, adaugă semnătura.
          </p>
        </>
      ) : (
        <>
          <h2>Ce date prelucrăm și de ce</h2>
          <p>
            {merchant}, la adresa indicată mai sus, prelucrează datele necesare
            gestionării comenzilor: nume, email, telefon, adrese de livrare și
            facturare, produse comandate și referințe de plată. Le folosim
            pentru executarea contractului, livrare, retururi și asistență,
            precum și pentru îndeplinirea obligațiilor legale de evidență și
            contabilitate. Fără datele necesare comenzii nu putem procesa și
            livra produsele.
          </p>
          <p>
            Datele tehnice necesare funcționării și securității site-ului pot fi
            prelucrate în interesul legitim de a preveni frauda și accesul
            neautorizat. Nu folosim datele comenzii pentru înscriere automată la
            mesaje publicitare.
          </p>
          <h2>Recenzii</h2>
          <p>
            Dacă alegi să ne trimiți o recenzie, primim numele de afișat,
            evaluarea, textul și, opțional, referința comenzii. Publicăm
            recenzia și numele ales numai cu acordul tău, după verificare.
            Referința comenzii rămâne privată. Poți retrage acordul pentru
            publicare contactându-ne la {email}; retragerea nu afectează
            legalitatea prelucrării anterioare.
          </p>
          <h2>Furnizori și destinatari</h2>
          <p>
            Vercel găzduiește site-ul. Stripe procesează plățile și păstrează
            datele introduse la checkout; magazinul nu primește numărul complet
            al cardului sau codul CVC. Datele necesare livrării, precum numele,
            telefonul și adresa, sunt comunicate Fan Curier Express. Datele pot
            fi comunicate autorităților și furnizorilor de servicii contabile în
            măsura necesară îndeplinirii obligațiilor legale.
          </p>
          <p>
            Serviciile Vercel și Stripe pot implica prelucrarea datelor în afara
            Spațiului Economic European, în condițiile mecanismelor de transfer
            aplicabile. Detalii despre practicile furnizorilor sunt disponibile
            în politicile{" "}
            <a href="https://vercel.com/legal/privacy-policy">Vercel</a> și{" "}
            <a href="https://stripe.com/privacy">Stripe</a>.
          </p>
          <h2>Păstrarea datelor</h2>
          <p>
            Păstrăm datele comenzilor cât este necesar pentru executarea
            contractului, soluționarea retururilor, reclamațiilor și exercitarea
            sau apărarea drepturilor. Documentele supuse obligațiilor fiscale și
            contabile sunt păstrate pe durata prevăzută de legislația
            aplicabilă. Recenziile publicate sunt păstrate cât timp există
            acordul pentru publicare și sunt relevante pentru produs. La
            încetarea scopului, datele sunt șterse sau anonimizate, cu excepția
            celor pentru care există o obligație legală de păstrare.
          </p>
          <h2>Preferințe în browser</h2>
          <p>
            Site-ul păstrează oferta și culorile selectate în sesiunea
            browserului pentru a facilita cumpărarea. Pagina de comandă
            păstrează și un identificator temporar al cererii de plată, pentru a
            reutiliza sesiunea la reîncărcare și a reduce riscul comenzilor
            duplicate. Acesta nu conține datele cardului sau datele de livrare.
          </p>
          <p>
            Dacă este activă oferta personală de 86 de minute, folosim un cookie
            necesar pentru a păstra termenul acesteia între vizite, timp de până
            la un an. Acesta nu conține date de identificare și nu se
            reînnoiește la reîncărcarea paginii. Nu sunt instalate instrumente
            de publicitate sau analiză. Câmpurile de plată Stripe pot utiliza
            tehnologii necesare procesării și prevenirii fraudei.
          </p>
          <h2>Drepturile tale</h2>
          <p>
            Poți solicita accesul, rectificarea sau ștergerea datelor,
            restricționarea și portabilitatea și te poți opune anumitor
            prelucrări, în condițiile legii. Pentru aceste cereri, scrie la{" "}
            {email}. Poți formula o plângere către{" "}
            <a href="https://www.dataprotection.ro/">ANSPDCP</a>. Anumite date
            trebuie păstrate pentru îndeplinirea obligațiilor legale chiar dacă
            soliciți ștergerea lor.
          </p>
        </>
      )}
    </main>
  );
}
