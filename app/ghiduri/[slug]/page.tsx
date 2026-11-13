import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuide, guideStructuredData } from '@/lib/guides.mjs';
import { publicPageMetadata } from '@/lib/seo';
import { indexingAllowed, serializeSchema } from '@/lib/seo.mjs';
import { siteUrl } from '@/lib/store';
import styles from './guide.module.css';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const metadata = publicPageMetadata(siteUrl, `${guide.metaTitle} | Pucioasa Premium`, guide.description, `/ghiduri/${guide.slug}`);
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, type: 'article' as const },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const related = guide.related.map(getGuide).filter(item => item !== undefined);
  return (
    <div className={styles.page}>
      {indexingAllowed() && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(guideStructuredData(guide, siteUrl)) }} />}
      <a className={styles.skip} href="#articol">Mergi la articol</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Pucioasa Premium — pagina principală">Pucioasa<span>Premium</span></Link>
        <Link href="/#produs" className={styles.shopLink}>Vezi colecția <span aria-hidden="true">→</span></Link>
      </header>
      <main className={styles.main} id="articol">
        <nav aria-label="Fir de navigare" className={styles.breadcrumb}>
          <Link href="/">Magazin</Link><span aria-hidden="true">/</span><span aria-current="page">Ghid pentru dormitor</span>
        </nav>
        <article>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>GHID PUCIOASA PREMIUM</p>
              <h1>{guide.title}</h1>
              <p className={styles.intro}>{guide.intro}</p>
            </div>
            <figure className={styles.photo}>
              <Image src={guide.image} alt={guide.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 40vw" />
              <figcaption>Fotografie din colecția Pucioasa Premium</figcaption>
            </figure>
          </div>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <nav aria-label="Cuprinsul articolului" className={styles.contents}>
                <p>În acest ghid</p>
                <ol>{guide.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
                <a href="#intrebari-ghid">Întrebări frecvente</a>
              </nav>
            </aside>
            <div className={styles.body}>
              {guide.sections.map(section => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
                  {section.table && <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={section.table.caption}>
                    <table>
                      <caption>{section.table.caption}</caption>
                      <thead><tr>{section.table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
                      <tbody>{section.table.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>}
                  {section.tip && <aside className={styles.note}><strong>De reținut</strong><p>{section.tip}</p></aside>}
                </section>
              ))}
              <section id="intrebari-ghid" aria-labelledby="intrebari-ghid-title" className={styles.questions}>
                <h2 id="intrebari-ghid-title">Întrebări frecvente</h2>
                {guide.questions.map(item => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
              </section>
              <aside className={styles.callout}>
                <p className={styles.eyebrow}>COLECȚIA PUCIOASA PREMIUM</p>
                <h2>Găsește setul pentru dormitorul tău</h2>
                <p>Vezi fotografiile celor 19 variante, dimensiunile și oferta actuală înainte să alegi.</p>
                <Link href="/#produs">Vezi seturile și culorile <span aria-hidden="true">→</span></Link>
              </aside>
            </div>
          </div>
        </article>
        <section className={styles.related} aria-labelledby="related-title">
          <p className={styles.eyebrow}>CONTINUĂ LECTURA</p>
          <h2 id="related-title">Ghiduri care te pot ajuta</h2>
          <div>{related.map(item => <Link href={`/ghiduri/${item.slug}`} key={item.slug}>
            <h3>{item.title}</h3><p>{item.description}</p><span>Citește ghidul <span aria-hidden="true">→</span></span>
          </Link>)}</div>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>Pucioasa Premium · Ghiduri pentru alegerea și îngrijirea lenjeriei</span>
        <div><Link href="/informatii/livrare-retur">Livrare și retur</Link><Link href="/informatii/confidentialitate">Confidențialitate</Link><a href="tel:+40755436284">0755 436 284</a></div>
      </footer>
    </div>
  );
}
