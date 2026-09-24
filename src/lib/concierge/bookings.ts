import { env, type Lang } from './config';
import { db, getContact, updateContact } from './db';
import { alertStaff, sendToContact } from './meta';
import { bookingConfirmed, staff, type ConfirmedBooking } from './copy';
import { formatStart, getDeparture, getTour } from './tours';

interface BookingRow {
  id: string;
  ref: string;
  contact_id: string;
  departure_id: string;
  adults: number;
  children: number;
  full_name: string;
  total_eur: number;
  deposit_eur: number;
}

/** Marks the deposit as paid. Returns null when Stripe re-delivers an event we already handled. */
export async function confirmDeposit(bookingId: string): Promise<BookingRow | null> {
  const { data, error } = await db()
    .from('bookings')
    .update({ status: 'deposit_paid', paid_at: new Date().toISOString() })
    .eq('id', bookingId)
    .in('status', ['pending', 'expired'])
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`confirmDeposit: ${error.message}`);
  return data as BookingRow | null;
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
