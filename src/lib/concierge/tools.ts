import 'server-only';
import type Anthropic from '@anthropic-ai/sdk';
import { CONCIERGE, env, isLang, type Lang } from './config';
import { attachCheckoutSession, createPendingBooking } from './bookings';
import { updateContact, type Contact, type ContactPatch, type Stage } from './db';
import { alertStaff } from './meta';
import { staff } from './copy';
import { stripe } from './stripe';
import { activeTours, formatStart, getDeparture, getTour, openDepartures, priceFor } from './tours';

export interface ToolContext {
  contact: Contact;
  /** Set when the concierge hands the conversation to Atilla during this run. */
  handedOff: boolean;
}

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: 'list_tours',
    description:
      'Returns every bookable tour with its id, name, summary, region, duration, per-person prices in EUR, deposit percentage, what is included and the meeting point. Call it before describing or recommending any tour; never describe a tour from memory.',
    strict: true,
    input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
  {
    name: 'check_availability',
    description:
      'Lists open departures of one tour between two dates that still have enough free seats for the group. Returns departure ids needed for booking. If nothing is returned, the dates are full or not scheduled; offer nearby dates or a private date via handoff_to_atilla.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        tour_id: { type: 'string', description: 'Tour id from list_tours.' },
        date_from: { type: 'string', format: 'date', description: 'First acceptable day, YYYY-MM-DD.' },
        date_to: { type: 'string', format: 'date', description: 'Last acceptable day, YYYY-MM-DD.' },
        guests: { type: 'integer', description: 'Total number of people, adults plus children.' },
      },
      required: ['tour_id', 'date_from', 'date_to', 'guests'],
      additionalProperties: false,
    },
  },
  {
    name: 'save_customer_details',
    description:
      "Stores what the customer has told you in Atilla's CRM. Call it as soon as you learn anything new (name, language, tour interest, dates, group size, budget, special needs, email, marketing consent). Only pass fields you actually learned; omit the rest.",
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        language: { type: 'string', enum: ['de', 'en', 'tr'], description: 'Language the customer writes in.' },
        email: { type: 'string', format: 'email' },
        tour_id: { type: 'string', description: 'Tour id the customer is interested in.' },
        travel_dates: { type: 'string', description: 'Travel dates or period, as the customer described it.' },
        adults: { type: 'integer' },
        children: { type: 'integer' },
        children_ages: { type: 'string' },
        budget: { type: 'string', enum: ['standard', 'premium', 'private'] },
        hotel_or_area: { type: 'string' },
        special_requests: { type: 'string', description: 'Diet, mobility, celebrations, photography, etc.' },
        marketing_consent: {
          type: 'boolean',
          description: 'True only if the customer explicitly agreed to receive future offers.',
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'create_deposit_link',
    description:
      'Reserves seats on a departure and creates a secure Stripe payment link for the deposit. The seats are held for 24 hours. Only call it after the customer has confirmed tour, date and group size and given their full name and email. Quote the returned amounts exactly.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        departure_id: { type: 'string', description: 'Departure id from check_availability.' },
        adults: { type: 'integer' },
        children: { type: 'integer' },
        full_name: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['departure_id', 'adults', 'children', 'full_name', 'email'],
      additionalProperties: false,
    },
  },
  {
    name: 'handoff_to_atilla',
    description:
      'Hands the conversation to Atilla personally and stops automatic replies for this customer. Use it for price negotiation or discounts, groups larger than the departures allow, private or tailor-made requests, complaints, cancellations or refunds, anything about an existing booking you cannot answer, or when the customer asks for a human.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: ['negotiation', 'private_request', 'large_group', 'complaint', 'existing_booking', 'asked_for_human', 'other'],
        },
        summary: {
          type: 'string',
          description:
            'Short briefing for Atilla in Turkish: who the customer is, what they want, what was already offered and what they are waiting for.',
        },
      },
      required: ['reason', 'summary'],
      additionalProperties: false,
    },
  },
];

type Input = Record<string, unknown>;

const asInt = (value: unknown, fallback = 0) =>
  Number.isInteger(value) && (value as number) >= 0 ? (value as number) : fallback;

function parseDay(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function lang(ctx: ToolContext): Lang {
  return ctx.contact.language ?? 'en';
}

async function listTours(ctx: ToolContext) {
  const l = lang(ctx);
  return (await activeTours()).map((t) => ({
    tour_id: t.id,
    name: t.name[l],
    summary: t.summary[l],
    region: t.region,
    duration_hours: t.duration_hours,
    price_per_adult_eur: t.price_per_person_eur,
    price_per_child_eur: t.child_price_eur ?? t.price_per_person_eur,
    deposit_percent: t.deposit_percent,
    guide_languages: t.languages,
    includes: t.includes,
    excludes: t.excludes,
    meeting_point: t.meeting_point,
  }));
}

async function checkAvailability(input: Input, ctx: ToolContext) {
  const from = parseDay(input.date_from);
  const to = parseDay(input.date_to);
  const guests = asInt(input.guests, 1) || 1;
  if (!from || !to || to < from) return { error: 'date_from and date_to must be valid YYYY-MM-DD dates, in order.' };
  to.setUTCDate(to.getUTCDate() + 1); // include the whole last day

  const tour = await getTour(String(input.tour_id));
  if (!tour) return { error: 'Unknown tour_id. Call list_tours first.' };

  const departures = await openDepartures(tour.id, new Date(Math.max(from.getTime(), Date.now())), to, guests);
  return {
    tour_id: tour.id,
    guests,
    departures: departures.map((d) => ({
      departure_id: d.departure_id,
      starts: formatStart(d.starts_at, lang(ctx)),
      seats_left: d.seats_left,
    })),
  };
}

const QUALIFICATION_KEYS = [
  'tour_id',
  'travel_dates',
  'adults',
  'children',
  'children_ages',
  'budget',
  'hotel_or_area',
  'special_requests',
] as const;

async function saveCustomerDetails(input: Input, ctx: ToolContext) {
  const { contact } = ctx;
  const qualification = { ...contact.qualification };
  for (const key of QUALIFICATION_KEYS) {
    if (input[key] !== undefined && input[key] !== '') qualification[key] = input[key];
  }

  const patch: ContactPatch = { qualification };
  if (typeof input.name === 'string' && input.name) patch.name = input.name;
  if (typeof input.email === 'string' && input.email) patch.email = input.email;
  if (isLang(input.language)) patch.language = input.language;
  if (typeof input.marketing_consent === 'boolean') patch.marketing_consent = input.marketing_consent;

  const ready = qualification.tour_id && qualification.travel_dates && qualification.adults;
  const next: Stage = ready ? 'qualified' : 'qualifying';
  if (contact.stage === 'new' || (contact.stage === 'qualifying' && next === 'qualified')) patch.stage = next;

  ctx.contact = await updateContact(contact.id, patch);
  return { saved: true, stage: ctx.contact.stage, profile: { ...qualification, name: ctx.contact.name } };
}

async function createDepositLink(input: Input, ctx: ToolContext) {
  const adults = asInt(input.adults);
  const children = asInt(input.children);
  const fullName = String(input.full_name ?? '').trim();
  const email = String(input.email ?? '').trim();
  if (adults < 1) return { error: 'At least one adult is required.' };
  if (!fullName || !email.includes('@')) return { error: 'Full name and a valid email are required.' };

  const departure = await getDeparture(String(input.departure_id));
  if (!departure || departure.status !== 'open' || new Date(departure.starts_at) < new Date()) {
    return { error: 'This departure is not bookable. Check availability again.' };
  }
  if (departure.seats_left < adults + children) {
    return { error: `Only ${departure.seats_left} seats left on this departure.` };
  }
  const tour = await getTour(departure.tour_id);
  if (!tour) return { error: 'Tour not found.' };

  const l = lang(ctx);
  const { total, deposit, balance } = priceFor(tour, adults, children);
  const expiresAt = new Date(Date.now() + CONCIERGE.holdHours * 3600_000 - 60_000);
  const starts = formatStart(departure.starts_at, l);

  const booking = await createPendingBooking({
    contactId: ctx.contact.id,
    departureId: departure.departure_id,
    adults,
    children,
    fullName,
    email,
    totalEur: total,
    depositEur: deposit,
    expiresAt,
  });

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    locale: l,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    client_reference_id: booking.id,
    metadata: { booking_id: booking.id, booking_ref: booking.ref },
    payment_intent_data: { metadata: { booking_id: booking.id, booking_ref: booking.ref } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: deposit * 100,
          product_data: {
            name: `${tour.name[l]} – ${tour.deposit_percent}%`,
            description: `${starts} · ${adults + children} · Ref. ${booking.ref}`,
          },
        },
      },
    ],
    success_url: `${env('SITE_URL')}/?booking=${booking.ref}&status=paid`,
    cancel_url: `${env('SITE_URL')}/?booking=${booking.ref}&status=cancelled`,
  });

  await attachCheckoutSession(booking.id, session.id);
  ctx.contact = await updateContact(ctx.contact.id, {
    stage: 'offer_sent',
    name: ctx.contact.name ?? fullName,
    email,
  });

  return {
    booking_ref: booking.ref,
    tour: tour.name[l],
    starts,
    guests: adults + children,
    total_eur: total,
    deposit_eur: deposit,
    balance_due_on_tour_day_eur: balance,
    payment_url: session.url,
    link_valid_until: formatStart(expiresAt.toISOString(), l),
  };
}

async function handoffToAtilla(input: Input, ctx: ToolContext) {
  const { contact } = ctx;
  ctx.contact = await updateContact(contact.id, { bot_paused: true });
  ctx.handedOff = true;
  const who = contact.name ?? contact.username ?? contact.external_id;
  const channel = contact.channel === 'whatsapp' ? `WhatsApp +${contact.external_id}` : `Instagram @${contact.username ?? contact.external_id}`;
  await alertStaff(env('STAFF_WHATSAPP'), staff.handoff(who, channel, String(input.reason), String(input.summary)), contact);
  return { handed_off: true, note: 'Atilla has been notified and will reply personally. Automatic replies are now off for this customer.' };
}

export async function runTool(name: string, input: Input, ctx: ToolContext): Promise<unknown> {
  switch (name) {
    case 'list_tours':
      return listTours(ctx);
    case 'check_availability':
      return checkAvailability(input, ctx);
    case 'save_customer_details':
      return saveCustomerDetails(input, ctx);
    case 'create_deposit_link':
      return createDepositLink(input, ctx);
    case 'handoff_to_atilla':
      return handoffToAtilla(input, ctx);
    default:
      return { error: `Unknown tool ${name}` };
  }
}
