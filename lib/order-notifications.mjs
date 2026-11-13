import { createHash } from 'node:crypto';
import { emailValid, money, paidOrder, orderPdf } from './order-document.mjs';

const escape = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function notificationConfig(env = process.env) {
  if (env.ORDER_EMAILS_ENABLED !== 'true') throw new Error('Order emails disabled');
  for (const key of ['RESEND_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'ORDER_EMAIL_FROM', 'ORDER_NOTIFICATION_EMAIL', 'ORDER_REPLY_TO']) {
    if (!env[key]?.trim()) throw new Error(`Missing ${key}`);
  }
  const from = env.ORDER_EMAIL_FROM;
  const fromEmail = from.match(/^[^<>\r\n]+<([^<>]+)>$/)?.[1] || from;
  if (!emailValid(fromEmail) || /[\r\n]/.test(from) || !emailValid(env.ORDER_NOTIFICATION_EMAIL) || !emailValid(env.ORDER_REPLY_TO)) throw new Error('Invalid notification email configuration');
  return { apiKey: String(env.RESEND_API_KEY), webhookSecret: String(env.STRIPE_WEBHOOK_SECRET),
    from, merchant: String(env.ORDER_NOTIFICATION_EMAIL), replyTo: String(env.ORDER_REPLY_TO) };
}

export async function orderMessages(session, lines, config) {
  const order = paidOrder(session, lines);
  const pdf = await orderPdf(order);
  const details = [
    `Comandă: ${order.reference}`, `Data: ${order.date}`, `Client: ${order.name}`,
    `Email: ${order.email}`, `Telefon: ${order.phone || '—'}`, `Adresă de livrare: ${order.address}`,
    ...order.items.map(i => `${i.name} — ${i.description}: ${i.quantity} × ${money(i.unit)} = ${money(i.total)}`),
    'Transport: gratuit', `Total achitat: ${money(order.total)}`,
  ];
  const message = (customer) => {
    const intro = customer ? 'Îți mulțumim! Plata a fost confirmată, iar comanda ta a fost înregistrată.' : 'Ai primit o comandă nouă achitată.';
    const footer = customer ? `Livrare gratuită în maxim 48 de ore. Pentru întrebări, răspunde la acest email.\nGăsești atașată confirmarea comenzii în format PDF. Documentul nu reprezintă factură fiscală.` : 'Pregătește produsele pentru livrare. Confirmarea PDF este atașată.';
    return {
      from: config.from, to: [customer ? order.email : config.merchant], reply_to: config.replyTo,
      subject: `${customer ? 'Confirmarea comenzii' : 'Comandă nouă achitată'} ${order.reference} — Pucioasa Premium`,
      text: [intro, ...details, footer].join('\n\n'),
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;color:#302333"><h1>Pucioasa Premium</h1><p>${escape(intro)}</p>${details.map(d => `<p>${escape(d)}</p>`).join('')}<p>${escape(footer).replace(/\n/g, '<br>')}</p></div>`,
      attachments: [{ filename: `confirmare-${order.reference}.pdf`, content: pdf.toString('base64') }],
    };
  };
  return { customer: message(true), merchant: message(false) };
}

export async function sendResend(payload, key, apiKey, fetcher = fetch) {
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Email provider rejected request');
  const result = await response.json();
  if (typeof result.id !== 'string' || !result.id) throw new Error('Email provider returned no ID');
  return result.id;
}

// Store only delivery markers in the existing Stripe session. No external DB,
// customer data or PDFs are written to metadata. Stripe does not send these emails.
const prefix = 'pp_email_v1_';
const retryWindow = 23 * 60 * 60 * 1000; // margin before Resend's 24-hour expiry

export async function handlePaidEvent(event, stripe, config, send, now = Date.now) {
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return true;
  const received = event.data.object;
  if (received.metadata?.product_id !== 'lenjerie-6-piese' || received.payment_status !== 'paid') return true;
  const session = await stripe.checkout.sessions.retrieve(received.id);
  if (session.livemode !== event.livemode) throw new Error('Payment mode mismatch');
  if (session.metadata?.[`${prefix}customer_id`] && session.metadata?.[`${prefix}merchant_id`]) return true;
  const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ['data.price.product'] });
  if (lines.has_more) throw new Error('Too many order lines');
  const messages = await orderMessages(session, lines.data, config);
  let complete = true;
  for (const kind of ['customer', 'merchant']) {
    const idKey = `${prefix}${kind}_id`;
    const startKey = `${prefix}${kind}_started`;
    const hashKey = `${prefix}${kind}_hash`;
    try {
      // Re-read each recipient's markers to notice successful concurrent callbacks.
      const latest = await stripe.checkout.sessions.retrieve(session.id);
      const metadata = latest.metadata || {};
      if (metadata[idKey]) continue;
      const hash = createHash('sha256').update(JSON.stringify(messages[kind])).digest('hex');
      const started = metadata[startKey];
      if (started) {
        const timestamp = Number(started);
        if (!Number.isSafeInteger(timestamp) || timestamp <= 0 || now() < timestamp || now() - timestamp >= retryWindow)
          throw new Error('Delivery requires manual review: retry window expired');
        if (metadata[hashKey] !== hash) throw new Error('Delivery requires manual review: message changed');
      } else {
        // Write the attempt BEFORE contacting Resend. On failures we never clear
        // this timestamp, even when acceptance by the provider is uncertain.
        await stripe.checkout.sessions.update(session.id, { metadata: {
          [startKey]: String(now()), [hashKey]: hash,
        } });
      }
      // Recheck the current marker after a concurrent first-attempt update. Payload
      // changes fail closed; unchanged concurrent sends share Resend's key.
      const check = (await stripe.checkout.sessions.retrieve(session.id)).metadata || {};
      if (check[idKey]) continue;
      const timestamp = Number(check[startKey]);
      if (check[hashKey] !== hash || !Number.isSafeInteger(timestamp) || timestamp <= 0 ||
        now() < timestamp || now() - timestamp >= retryWindow) throw new Error('Unsafe retry');
      const id = await send(messages[kind], `pp-order-v1/${session.id}/${kind}`);
      await stripe.checkout.sessions.update(session.id, { metadata: { [idKey]: id } });
    } catch {
      // Attempt the other recipient independently; a non-2xx webhook response
      // asks Stripe to retry. Only the recipient without a success marker retries.
      complete = false;
    }
  }
  return complete;
}
