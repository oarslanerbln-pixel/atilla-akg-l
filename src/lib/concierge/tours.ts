import { CONCIERGE, type Lang } from './config';
import { db } from './db';

export interface Tour {
  id: string;
  name: Record<Lang, string>;
  summary: Record<Lang, string>;
  region: string;
  duration_hours: number;
  price_per_person_eur: number;
  child_price_eur: number | null;
  deposit_percent: number;
  languages: string[];
  includes: string[];
  excludes: string[];
  meeting_point: string | null;
  meeting_point_url: string | null;
}

export interface Departure {
  departure_id: string;
  tour_id: string;
  starts_at: string;
  capacity: number;
  guide_id: string | null;
  status: 'open' | 'closed' | 'cancelled';
  seats_left: number;
}

const LOCALES: Record<Lang, string> = { de: 'de-DE', en: 'en-GB', tr: 'tr-TR' };

export function formatStart(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: CONCIERGE.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export async function activeTours(): Promise<Tour[]> {
  const { data, error } = await db().from('tours').select('*').eq('active', true).order('region');
  if (error) throw new Error(`activeTours: ${error.message}`);
  return data as Tour[];
}

export async function getTour(id: string): Promise<Tour | null> {
  const { data } = await db().from('tours').select('*').eq('id', id).maybeSingle();
  return (data as Tour | null) ?? null;
}

export async function getDeparture(id: string): Promise<Departure | null> {
  const { data } = await db().from('departure_availability').select('*').eq('departure_id', id).maybeSingle();
  return (data as Departure | null) ?? null;
}

export async function openDepartures(tourId: string, from: Date, to: Date, guests: number): Promise<Departure[]> {
  const { data, error } = await db()
    .from('departure_availability')
    .select('*')
    .eq('tour_id', tourId)
    .eq('status', 'open')
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .gte('seats_left', guests)
    .order('starts_at')
    .limit(10);
  if (error) throw new Error(`openDepartures: ${error.message}`);
  return data as Departure[];
}

export function priceFor(tour: Tour, adults: number, children: number) {
  const total = adults * tour.price_per_person_eur + children * (tour.child_price_eur ?? tour.price_per_person_eur);
  const deposit = Math.ceil((total * tour.deposit_percent) / 100);
  return { total, deposit, balance: total - deposit };
}
