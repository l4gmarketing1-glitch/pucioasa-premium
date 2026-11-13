import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/store';
import { notificationConfig, handlePaidEvent, sendResend } from '@/lib/order-notifications.mjs';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let config;
  try { config = notificationConfig(); }
  catch { return NextResponse.json({ error: 'Notifications unavailable' }, { status: 503 }); }
  const stripe = stripeClient();
  let event;
  try {
    // Verify the untouched body, never parsed/re-serialized JSON.
    const raw = await req.text();
    if (Buffer.byteLength(raw) > 1024 * 1024) return new NextResponse(null, { status: 413 });
    event = stripe.webhooks.constructEvent(raw, req.headers.get('stripe-signature') || '', config.webhookSecret);
  } catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }); }
  try {
    const complete = await handlePaidEvent(event, stripe, config,
      (payload: object, key: string) => sendResend(payload, key, config.apiKey));
    // Non-2xx makes Stripe retry incomplete notifications independently of the browser.
    if (!complete) throw new Error('Notifications pending');
    return NextResponse.json({ received: true });
  } catch {
    console.error('order_notification_failed', { eventId: event.id });
    return NextResponse.json({ error: 'Notification processing incomplete' }, { status: 503 });
  }
}
