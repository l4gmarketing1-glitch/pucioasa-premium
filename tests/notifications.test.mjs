import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';
import Stripe from 'stripe';
import { paidOrder, orderPdf } from '../lib/order-document.mjs';
import { notificationConfig, orderMessages, sendResend, handlePaidEvent } from '../lib/order-notifications.mjs';

const config = { from: 'Pucioasa Premium <comenzi@example.invalid>', merchant: 'owner@example.invalid', replyTo: 'support@example.invalid' };
const session = {
  id: 'cs_test_notification_fixture', created: 1794564000, livemode: false,
  mode: 'payment', status: 'complete', payment_status: 'paid', currency: 'ron', amount_total: 27900,
  metadata: { product_id: 'lenjerie-6-piese', quantity: '2', cart_version: 'bundle-v1', expected_total: '27900', variants: 'v04,v03' },
  customer_details: { email: 'client@example.invalid', phone: '+40700000000' },
  collected_information: { shipping_details: { name: 'Ștefan <script> & Ioana', address: { line1: 'Strada Școlii 10', city: 'Pucioasa', state: 'Dâmbovița', country: 'RO', postal_code: '135400' } } },
};
const lines = ['v04', 'v03'].map((color, index) => ({
  quantity: 1, currency: 'ron', amount_total: 13950,
  price: { product: { name: 'Lenjerie · 6 piese', description: `Culoare: ${index ? 'Vișiniu' : 'Bej nisipiu'}`, metadata: { product_id: 'lenjerie-6-piese', color } } },
}));
const event = { id: 'evt_fixture', type: 'checkout.session.completed', livemode: false, data: { object: session } };
function fixture() {
  const stored = structuredClone(session);
  const accepted = new Map();
  const calls = [];
  const sdk = { checkout: { sessions: {
    retrieve: async () => structuredClone(stored),
    listLineItems: async () => ({ data: lines, has_more: false }),
    update: async (_, { metadata }) => { Object.assign(stored.metadata, metadata); return structuredClone(stored); },
  } } };
  const send = async (payload, key) => {
    calls.push(key);
    if (accepted.has(key)) assert.deepEqual(payload, accepted.get(key).payload, 'idempotent payload must be byte-identical');
    else accepted.set(key, { payload, id: `email-${accepted.size + 1}` });
    return accepted.get(key).id;
  };
  return { stored, sdk, accepted, calls, send };
}

test('order validates paid status, price snapshot, colors and contact before generating documents', () => {
  assert.equal(paidOrder(session, lines).total, 27900);
  assert.throws(() => paidOrder({ ...session, payment_status: 'unpaid' }, lines));
  assert.throws(() => paidOrder({ ...session, customer_details: { email: 'a@b.ro\nBcc:x@y.ro' } }, lines));
  assert.throws(() => paidOrder(session, [lines[0]]));
  assert.throws(() => paidOrder(session, [lines[0], lines[0]]));
  assert.throws(() => paidOrder(session, [{ ...lines[0], amount_total: 1 }, lines[1]]));
});

test('Romanian PDF includes diacritics, historical prices and clearly identifies a confirmation', async () => {
  const bytes = await orderPdf(paidOrder(session, lines));
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  // Optional extraction tool in the cloud image verifies actual rendered PDF text.
  try { execFileSync('which', ['pdftotext']); } catch { return; }
  const file = '/tmp/pucioasa-notification-fixture.pdf';
  await writeFile(file, bytes);
  const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
  assert.match(text, /Ștefan/);
  assert.match(text, /Dâmbovița/);
  assert.match(text, /Vișiniu/);
  assert.match(text, /279,00 lei/);
  assert.match(text, /Confirmare comandă/);
});

test('customer and merchant receive separate escaped messages and PDF attachments', async () => {
  const messages = await orderMessages(session, lines, config);
  assert.deepEqual(messages.customer.to, ['client@example.invalid']);
  assert.deepEqual(messages.merchant.to, ['owner@example.invalid']);
  assert.equal(messages.customer.reply_to, config.replyTo);
  assert.ok(!messages.customer.html.includes('<script>'));
  assert.match(messages.customer.html, /&lt;script&gt;/);
  assert.ok(Buffer.from(messages.customer.attachments[0].content, 'base64').subarray(0, 4).equals(Buffer.from('%PDF')));
});

test('concurrent callbacks deduplicate through Resend; saved markers prevent later duplicates', async () => {
  const f = fixture();
  await Promise.all([handlePaidEvent(event, f.sdk, config, f.send), handlePaidEvent({ ...event, id: 'evt_another' }, f.sdk, config, f.send)]);
  assert.equal(f.accepted.size, 2);
  const calls = f.calls.length;
  assert.equal(await handlePaidEvent(event, f.sdk, config, f.send, () => Date.now() + 48 * 3600000), true);
  assert.equal(f.calls.length, calls);
});

test('partial failure retries only failed recipient with identical PDF and message', async () => {
  const f = fixture();
  let failedPayload;
  const send = async (payload, key) => {
    if (key.endsWith('/merchant')) { failedPayload = payload; throw new Error('quota'); }
    return f.send(payload, key);
  };
  assert.equal(await handlePaidEvent(event, f.sdk, config, send), false);
  const calls = f.calls.length;
  assert.equal(await handlePaidEvent(event, f.sdk, config, async (payload, key) => {
    assert.ok(key.endsWith('/merchant'));
    assert.deepEqual(payload, failedPayload);
    return f.send(payload, key);
  }), true);
  assert.equal(f.calls.length, calls + 1);
});

test('uncertain sends after 23 hours require review instead of duplicating', async () => {
  const f = fixture();
  const now = Date.now();
  assert.equal(await handlePaidEvent(event, f.sdk, config, async () => { throw new Error('timeout'); }, () => now), false);
  let sends = 0;
  assert.equal(await handlePaidEvent(event, f.sdk, config, async () => { sends++; }, () => now + 23 * 3600000), false);
  assert.equal(sends, 0);
});

test('changed configuration fails closed on uncertain retry instead of using same key with new payload', async () => {
  const f = fixture();
  assert.equal(await handlePaidEvent(event, f.sdk, config, async () => { throw new Error('timeout'); }), false);
  let sends = 0;
  assert.equal(await handlePaidEvent(event, f.sdk, { ...config, replyTo: 'changed@example.invalid' }, async () => { sends++; }), false);
  assert.equal(sends, 0);
});

test('unpaid and unrelated events cause no Stripe calls or email sends', async () => {
  const forbidden = new Proxy({}, { get() { throw new Error('Unexpected access'); } });
  assert.equal(await handlePaidEvent({ ...event, type: 'payment_intent.created' }, forbidden, config, forbidden), true);
  assert.equal(await handlePaidEvent({ ...event, data: { object: { ...session, payment_status: 'unpaid' } } }, forbidden, config, forbidden), true);
});

test('Resend adapter sends stable idempotency key and preserves provider errors for retry', async () => {
  const fake = async (url, opts) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(opts.headers['Idempotency-Key'], 'stable-key');
    assert.deepEqual(JSON.parse(opts.body), { text: 'hello' });
    return { ok: true, json: async () => ({ id: 'email-1' }) };
  };
  assert.equal(await sendResend({ text: 'hello' }, 'stable-key', 'test-key', fake), 'email-1');
  await assert.rejects(sendResend({}, 'key', 'test-key', async () => ({ ok: false })));
  await assert.rejects(sendResend({}, 'key', 'test-key', async () => ({ ok: true, json: async () => ({}) })));
});

test('configuration fails closed and Stripe signature checks reject altered or stale bodies', () => {
  assert.throws(() => notificationConfig({}), /disabled/);
  assert.throws(() => notificationConfig({ ORDER_EMAILS_ENABLED: 'true' }), /Missing/);
  const sdk = new Stripe('sk_test_fixture');
  const payload = JSON.stringify(event), secret = 'whsec_fixture';
  const header = sdk.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(sdk.webhooks.constructEvent(payload, header, secret).id, event.id);
  assert.throws(() => sdk.webhooks.constructEvent(payload + ' ', header, secret));
  const stale = sdk.webhooks.generateTestHeaderString({ payload, secret, timestamp: 1 });
  assert.throws(() => sdk.webhooks.constructEvent(payload, stale, secret));
});

test('accepted email with failed Stripe marker write retries unchanged and provider deduplicates', async () => {
  const f = fixture();
  const update = f.sdk.checkout.sessions.update;
  let fail = true;
  f.sdk.checkout.sessions.update = async (id, params) => {
    if (fail && params.metadata.pp_email_v1_customer_id) { fail = false; throw new Error('connection interrupted'); }
    return update(id, params);
  };
  assert.equal(await handlePaidEvent(event, f.sdk, config, f.send), false);
  assert.equal(await handlePaidEvent(event, f.sdk, config, f.send), true);
  assert.equal(f.calls.length, 3);
  assert.equal(f.accepted.size, 2);
});

test('no email is sent if the initial marker cannot be saved in Stripe', async () => {
  const f = fixture();
  f.sdk.checkout.sessions.update = async () => { throw new Error('no write permission'); };
  assert.equal(await handlePaidEvent(event, f.sdk, config, f.send), false);
  assert.equal(f.calls.length, 0);
});

test('no database is required by the email configuration', () => {
  const result = notificationConfig({ ORDER_EMAILS_ENABLED: 'true', RESEND_API_KEY: 'fixture', STRIPE_SECRET_KEY: 'sk_test_fixture',
    STRIPE_WEBHOOK_SECRET: 'whsec_fixture', ORDER_EMAIL_FROM: config.from, ORDER_NOTIFICATION_EMAIL: config.merchant, ORDER_REPLY_TO: config.replyTo });
  assert.equal(result.merchant, config.merchant);
  assert.equal(result.databaseUrl, undefined);
});
