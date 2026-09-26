import { after } from 'next/server';
import type Stripe from 'stripe';
import { env } from '@/lib/concierge/config';
import { announcePaidBooking, confirmDeposit, expireBooking } from '@/lib/concierge/bookings';
import { stripe } from '@/lib/concierge/stripe';

export const maxDuration = 60;

export async function POST(request: Request) {
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, request.headers.get('stripe-signature') ?? '', env('STRIPE_WEBHOOK_SECRET'));
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    if (bookingId && session.payment_status === 'paid') {
      const booking = await confirmDeposit(bookingId, {
        id: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
      if (booking) after(() => announcePaidBooking(booking).catch((e) => console.error('[concierge] announce failed', e)));
    }
  }

  if (event.type === 'checkout.session.expired') {
    const bookingId = event.data.object.metadata?.booking_id;
    if (bookingId) await expireBooking(bookingId);
  }

  return Response.json({ received: true });
}
