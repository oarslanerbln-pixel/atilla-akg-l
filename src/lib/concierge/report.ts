import 'server-only';
import type { Lang } from './config';
import { db } from './db';
import { isAdSource } from './offers';

// The weekly numbers for Atilla (/api/cron/weekly-report): how many partner links were asked for
// and opened, per offer and per reel, story or ad. It reads counts, offer names and the public
// titles of his own posts and ads; never a contact, a message or a click id.

const WEEK_MS = 7 * 86_400_000;
/** PostgREST hands out at most this many rows per request. */
const PAGE = 1000;
/** Sources listed in the mail; all of them are in source_performance. */
const TOP_SOURCES = 8;

export interface Tally {
  /** Personal links handed out on request. */
  sent: number;
  /** Links opened for the first time, whenever they were sent. */
  opened: number;
}

export type ReportSource =
  | { kind: 'ad'; id: string; title: string | null }
  | { kind: 'media'; id: string; permalink: string | null; caption: string | null }
  | { kind: 'none' };

export interface WeeklyReport {
  from: Date;
  to: Date;
  week: Tally;
  previous: Tally;
  /** Offers with links in either week, busiest first. */
  offers: { name: string; week: Tally; previous: Tally }[];
  /** This week's busiest sources. */
  sources: { source: ReportSource; week: Tally }[];
  newContacts: number;
  paidBookings: number;
}

interface LinkRow {
  offer_id: string;
  source_media_id: string | null;
  created_at: string;
  first_clicked_at: string | null;
}

const zero = (): Tally => ({ sent: 0, opened: 0 });
const busy = (t: Tally) => t.sent > 0 || t.opened > 0;
const busiestFirst = (a: Tally, b: Tally) => b.sent - a.sent || b.opened - a.opened;

/** Every link sent or first opened since `since`, page by page. */
async function linksSince(since: Date): Promise<LinkRow[]> {
  const iso = since.toISOString();
  const rows: LinkRow[] = [];
  for (let start = 0; ; start += PAGE) {
    const { data, error } = await db()
      .from('affiliate_clicks')
      .select('offer_id, source_media_id, created_at, first_clicked_at')
      .or(`created_at.gte.${iso},first_clicked_at.gte.${iso}`)
      .order('id')
      .range(start, start + PAGE - 1);
    if (error) throw new Error(`weekly report links: ${error.message}`);
    rows.push(...(data as LinkRow[]));
    if (data.length < PAGE) return rows;
  }
}

/** Adds the link to the tally of the window [from, to). */
function count(tally: Tally, link: LinkRow, from: number, to: number): void {
  const within = (iso: string | null) => iso !== null && Date.parse(iso) >= from && Date.parse(iso) < to;
  if (within(link.created_at)) tally.sent++;
  if (within(link.first_clicked_at)) tally.opened++;
}

async function sourcesFor(ids: (string | null)[]): Promise<Map<string, ReportSource>> {
  const known = ids.filter((id): id is string => id !== null);
  if (!known.length) return new Map();
  const { data, error } = await db().from('instagram_media').select('id, permalink, caption').in('id', known);
  if (error) throw new Error(`weekly report sources: ${error.message}`);
  return new Map(
    (data as { id: string; permalink: string | null; caption: string | null }[]).map((m) => [
      m.id,
      isAdSource(m.id)
        ? { kind: 'ad', id: m.id, title: m.caption }
        : { kind: 'media', id: m.id, permalink: m.permalink, caption: m.caption },
    ]),
  );
}

/** The seven days before `to`, each figure beside the seven days before those. */
export async function weeklyReport(to = new Date()): Promise<WeeklyReport> {
  const from = new Date(to.getTime() - WEEK_MS);
  const before = new Date(from.getTime() - WEEK_MS);
  const since = from.toISOString();

  const [links, offers, contacts, bookings] = await Promise.all([
    linksSince(before),
    db().from('affiliate_offers').select('id, name'),
    db().from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db()
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['deposit_paid', 'completed'])
      .gte('paid_at', since),
  ]);
  for (const result of [offers, contacts, bookings]) {
    if (result.error) throw new Error(`weekly report: ${result.error.message}`);
  }

  const [b, f, t] = [before.getTime(), from.getTime(), to.getTime()];
  const week = zero();
  const previous = zero();
  const perOffer = new Map<string, { week: Tally; previous: Tally }>();
  const perSource = new Map<string | null, Tally>();
  for (const link of links) {
    const offer = perOffer.get(link.offer_id) ?? { week: zero(), previous: zero() };
    const source = perSource.get(link.source_media_id) ?? zero();
    perOffer.set(link.offer_id, offer);
    perSource.set(link.source_media_id, source);
    for (const tally of [week, offer.week, source]) count(tally, link, f, t);
    for (const tally of [previous, offer.previous]) count(tally, link, b, f);
  }

  const names = new Map((offers.data as { id: string; name: Record<Lang, string> }[]).map((o) => [o.id, o.name.tr]));
  const top = [...perSource].filter(([, tally]) => busy(tally)).sort(([, x], [, y]) => busiestFirst(x, y)).slice(0, TOP_SOURCES);
  const labels = await sourcesFor(top.map(([id]) => id));

  return {
    from,
    to,
    week,
    previous,
    offers: [...perOffer]
      .filter(([, o]) => busy(o.week) || busy(o.previous))
      .sort(([, x], [, y]) => busiestFirst(x.week, y.week) || busiestFirst(x.previous, y.previous))
      .map(([id, o]) => ({ name: names.get(id) ?? id, ...o })),
    sources: top.map(([id, tally]) => ({
      source: id === null ? { kind: 'none' } : (labels.get(id) ?? { kind: 'media', id, permalink: null, caption: null }),
      week: tally,
    })),
    newContacts: contacts.count ?? 0,
    paidBookings: bookings.count ?? 0,
  };
}
