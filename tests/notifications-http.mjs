import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
const port = 3104;
const origin = `http://localhost:${port}`;
const secret = 'whsec_local_http_fixture';
const stripe = new Stripe('sk_test_local_http_fixture');
const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  env: { ...process.env, SITE_URL: origin, ORDER_EMAILS_ENABLED: 'true',
    STRIPE_SECRET_KEY: 'sk_test_local_http_fixture', STRIPE_WEBHOOK_SECRET: secret,
    RESEND_API_KEY: 'local_fixture_no_send',
    ORDER_EMAIL_FROM: 'Store <sender@example.invalid>', ORDER_NOTIFICATION_EMAIL: 'owner@example.invalid', ORDER_REPLY_TO: 'support@example.invalid' },
  stdio: 'ignore',
});
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, 'production server starts');
  const post = (body, signature = '') => fetch(`${origin}/api/webhooks/stripe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': signature }, body,
  });
  const event = JSON.stringify({ id: 'evt_local', type: 'checkout.session.completed', livemode: false,
    data: { object: { id: 'cs_test_local', payment_status: 'unpaid', metadata: { product_id: 'lenjerie-6-piese' } } } });
  assert.equal((await post(event)).status, 400, 'unsigned requests rejected');
  const header = stripe.webhooks.generateTestHeaderString({ payload: event, secret });
  assert.equal((await post(event + ' ', header)).status, 400, 'altered body rejected');
  assert.equal((await post(event, stripe.webhooks.generateTestHeaderString({ payload: event, secret, timestamp: 1 }))).status, 400, 'old signatures rejected');
  assert.equal((await post(event, header)).status, 200, 'unpaid signed events acknowledged without contacting email provider');
  const unrelated = JSON.stringify({ id: 'evt_unrelated', type: 'payment_intent.created', data: { object: {} } });
  assert.equal((await post(unrelated, stripe.webhooks.generateTestHeaderString({ payload: unrelated, secret }))).status, 200);
  console.log('PASS: production webhook rejects missing/altered/stale signatures; signed unpaid and unrelated events send no email.');
} finally {
  server.kill('SIGTERM');
  await new Promise(resolve => server.once('exit', resolve));
}
