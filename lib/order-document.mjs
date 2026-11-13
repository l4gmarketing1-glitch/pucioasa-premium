import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { isPaidStoreSession } from './checkout.mjs';
import { product } from './catalog.mjs';

export const money = (amount) => `${(amount / 100).toFixed(2).replace('.', ',')} lei`;
const clean = (value, max = 300) => String(value || '').replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, max);
export const emailValid = (value) => typeof value === 'string' && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value) && value.length <= 254;

export function paidOrder(session, lines) {
  if (!isPaidStoreSession(session)) throw new Error('Invalid paid order');
  const details = session.customer_details;
  const shipping = session.collected_information?.shipping_details || session.shipping_details;
  if (!emailValid(details?.email) || !shipping?.name || !shipping.address?.line1 || !shipping.address?.city || shipping.address?.country !== 'RO')
    throw new Error('Missing order contact or shipping details');
  const items = lines.map(line => {
    const p = line.price?.product;
    if (!p || p.deleted || p.metadata?.product_id !== product.id || !p.metadata?.color ||
      line.currency !== 'ron' || !Number.isInteger(line.quantity) || line.quantity < 1 ||
      !Number.isSafeInteger(line.amount_total) || line.amount_total <= 0 ||
      line.amount_total % line.quantity !== 0) throw new Error('Invalid order line');
    return { name: clean(p.name), description: clean(p.description), colorId: p.metadata.color,
      quantity: line.quantity, total: line.amount_total, unit: line.amount_total / line.quantity };
  });
  if (!items.length || items.length > 5 || items.reduce((n, i) => n + i.total, 0) !== session.amount_total ||
    items.reduce((n, i) => n + i.quantity, 0) !== Number(session.metadata.quantity)) throw new Error('Order totals mismatch');
  if (session.metadata.cart_version === 'bundle-v1') {
    const actual = items.flatMap(i => Array(i.quantity).fill(i.colorId)).sort().join(',');
    if (actual !== session.metadata.variants.split(',').sort().join(',')) throw new Error('Order variants mismatch');
  }
  const address = shipping.address;
  return {
    reference: `PP-${createHash('sha256').update(session.id).digest('hex').slice(0, 16).toUpperCase()}`,
    created: session.created,
    date: new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', dateStyle: 'medium' }).format(new Date(session.created * 1000)),
    name: clean(shipping.name), email: details.email, phone: clean(details.phone, 50),
    address: [address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).map(v => clean(v)).join(', '),
    total: session.amount_total, items,
  };
}

export async function orderPdf(order) {
  const doc = await PDFDocument.create();
  // Stable PDF bytes are required when retrying Resend's idempotent request.
  const created = new Date(order.created * 1000);
  doc.setCreationDate(created);
  doc.setModificationDate(created);
  doc.registerFontkit(fontkit);
  // Bundled font includes Romanian diacritics; do not depend on OS fonts in Vercel.
  const bytes = await readFile(path.join(process.cwd(), 'assets/fonts/DejaVuSans.ttf'));
  const font = await doc.embedFont(bytes, { subset: true });
  doc.setTitle(`Confirmare comandă ${order.reference}`);
  doc.setAuthor('Pucioasa Premium');
  let page, y;
  const newPage = () => { page = doc.addPage([595, 842]); y = 790; };
  newPage();
  const text = (value, size = 11) => {
    const safe = clean(value, 3000).split('').map(c => font.getCharacterSet().includes(c.codePointAt(0)) ? c : '?').join('');
    let line = '';
    for (const word of safe.split(' ')) {
      // Wrap even unusually long address tokens instead of drawing outside the page.
      for (const char of `${word} `) {
        if (font.widthOfTextAtSize(line + char, size) > 495) {
          if (y < 55) newPage();
          page.drawText(line, { x: 50, y, size, font, color: rgb(.15, .12, .16) });
          y -= size + 7; line = '';
        }
        line += char;
      }
    }
    if (y < 55) newPage();
    page.drawText(line, { x: 50, y, size, font, color: rgb(.15, .12, .16) });
    y -= size + 10;
  };
  text('PUCIOASA PREMIUM', 22);
  text('Confirmare comandă', 17);
  text(`${order.reference} · ${order.date}`);
  text('Plată confirmată');
  y -= 10;
  text(`Client: ${order.name}`);
  text(`Email: ${order.email}`);
  text(`Telefon: ${order.phone || '—'}`);
  text(`Livrare: ${order.address}`);
  y -= 10;
  for (const item of order.items) {
    text(item.name, 12);
    text(item.description);
    text(`${item.quantity} × ${money(item.unit)} = ${money(item.total)}`);
  }
  text('Transport: gratuit');
  text(`Total achitat: ${money(order.total)}`, 16);
  text('Document de confirmare a comenzii. Nu reprezintă factură fiscală.', 9);
  return Buffer.from(await doc.save());
}
