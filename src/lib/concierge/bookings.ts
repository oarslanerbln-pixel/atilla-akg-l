import 'server-only';
import { randomUUID } from 'node:crypto';
import { env, type Lang } from './config';
import { db, getContact, updateContact } from './db';
import { alertStaff, sendToContact } from './meta';
import { bookingConfirmed, staff, type ConfirmedBooking } from './copy';
import { seal, unseal } from './crypto';
import { formatStart, getDeparture, getTour } from './tours';

interface BookingRow {
  id: string;
  ref: string;
  contact_id: string;
  departure_id: string;
  adults: number;
  children: number;
  full_name: string;
  email: string;
  total_eur: number;
  deposit_eur: number;
  stripe_session_id: string | null;
}

// Guest name and email are sealed like the contact fields; the AAD ties them to this booking.
const bookingAad = (field: 'full_name' | 'email', id: string) => `bookings.${field}:${id}`;

function bookingFromRow(row: Record<string, unknown>): BookingRow {
  const id = row.id as string;
  return {
    ...(row as unknown as BookingRow),
    full_name: unseal(row.full_name, bookingAad('full_name', id)) ?? '',
    email: unseal(row.email, bookingAad('email', id)) ?? '',
  };
}

export interface NewBooking {
  contactId: string;
  departureId: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  totalEur: number;
  depositEur: number;
  expiresAt: Date;
}

/** Inserts an unpaid booking that holds its seats until `expiresAt`. */
export async function createPendingBooking(b: NewBooking): Promise<{ id: string; ref: string }> {
  const id = randomUUID();
  const { data, error } = await db()
    .from('bookings')
    .insert({
      id,
      contact_id: b.contactId,
      departure_id: b.departureId,
      adults: b.adults,
      children: b.children,
      full_name: seal(b.fullName, bookingAad('full_name', id)),
      email: seal(b.email, bookingAad('email', id)),
      total_eur: b.totalEur,
      deposit_eur: b.depositEur,
      expires_at: b.expiresAt.toISOString(),
    })
    .select('id, ref')
    .single();
  if (error) throw new Error(`createPendingBooking: ${error.message}`);
  return data;
}

export async function attachCheckoutSession(bookingId: string, sessionId: string): Promise<void> {
  const { error } = await db().from('bookings').update({ stripe_session_id: sessionId }).eq('id', bookingId);
  if (error) throw new Error(`attachCheckoutSession: ${error.message}`);
}

export interface PaidSession {
  id: string;
  amountTotal: number | null;
  currency: string | null;
}

/**
 * Marks the deposit as paid once the Stripe session matches the booking exactly: same session,
 * same amount in cents, EUR. Anything else is reported to Atilla instead of confirming a tour.
 * Returns null when there is nothing to announce (unknown booking, mismatch, or a re-delivery).
 */
export async function confirmDeposit(bookingId: string, paid: PaidSession): Promise<BookingRow | null> {
  const found = await db().from('bookings').select('*').eq('id', bookingId).maybeSingle();
  if (found.error) throw new Error(`confirmDeposit: ${found.error.message}`);
  if (!found.data) return null;
  const booking = bookingFromRow(found.data);

  const expectedCents = booking.deposit_eur * 100;
  if (booking.stripe_session_id !== paid.id || paid.amountTotal !== expectedCents || paid.currency !== 'eur') {
    console.error('[concierge] payment does not match booking', booking.ref);
    await alertStaff(
      env('STAFF_WHATSAPP'),
      staff.paymentMismatch(
        booking.ref,
        `${booking.deposit_eur} EUR (${booking.stripe_session_id ?? '-'})`,
        `${(paid.amountTotal ?? 0) / 100} ${(paid.currency ?? '?').toUpperCase()} (${paid.id})`,
      ),
    );
    return null;
  }

  const { data, error } = await db()
    .from('bookings')
    .update({ status: 'deposit_paid', paid_at: new Date().toISOString() })
    .eq('id', bookingId)
    .in('status', ['pending', 'expired'])
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`confirmDeposit: ${error.message}`);
  return data ? bookingFromRow(data) : null;
}

export async function expireBooking(bookingId: string): Promise<void> {
  await db().from('bookings').update({ status: 'expired' }).eq('id', bookingId).eq('status', 'pending');
}

/** Confirmation to the customer, a heads-up to Atilla and the job to the assigned guide. */
export async function announcePaidBooking(booking: BookingRow): Promise<void> {
  const [contact, departure] = await Promise.all([getContact(booking.contact_id), getDeparture(booking.departure_id)]);
  if (!departure) throw new Error(`announcePaidBooking: departure ${booking.departure_id} missing`);
  const tour = await getTour(departure.tour_id);
  if (!tour) throw new Error(`announcePaidBooking: tour ${departure.tour_id} missing`);
  const { data: guide } = departure.guide_id
    ? await db().from('guides').select('name, whatsapp').eq('id', departure.guide_id).maybeSingle()
    : { data: null };

  const details = (lang: Lang): ConfirmedBooking => ({
    ref: booking.ref,
    tourName: tour.name[lang],
    startsAt: formatStart(departure.starts_at, lang),
    guests: booking.adults + booking.children,
    depositEur: booking.deposit_eur,
    balanceEur: booking.total_eur - booking.deposit_eur,
    meetingPoint: tour.meeting_point,
    meetingPointUrl: tour.meeting_point_url,
    guideName: guide?.name ?? null,
  });

  const updated = await updateContact(contact.id, { stage: 'booked' });
  const who = updated.name ?? booking.full_name;

  const results = await Promise.allSettled([
    sendToContact(updated, bookingConfirmed(updated.language ?? 'en', details(updated.language ?? 'en'))),
    alertStaff(env('STAFF_WHATSAPP'), staff.bookingPaid(who, details('tr')), updated),
    guide ? alertStaff(guide.whatsapp, staff.guideAssigned(details('tr'), booking.full_name)) : Promise.resolve(),
  ]);
  for (const r of results) if (r.status === 'rejected') console.error('[concierge] booking notice failed', r.reason);
}
