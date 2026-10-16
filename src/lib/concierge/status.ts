import 'server-only';
import { CONCIERGE } from './config';
import { blindIndex, decrypt, encrypt } from './crypto';
import { db } from './db';
import { graphGet } from './meta';
import { peekInstagramToken } from './tokens';

// One read-only look at everything the site and the concierge depend on (/api/cron/status).
// A variable listed in Vercel can still hold an empty value; the contact form ran for two weeks
// that way. This reports names, counts, dates and public account names, never a value.

/** What each feature needs. A feature that is switched off does not count as broken. */
const FEATURES = {
  contactForm: ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'],
  storage: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'CONCIERGE_ENCRYPTION_KEYS', 'CONCIERGE_INDEX_KEY'],
  instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_APP_SECRET', 'META_VERIFY_TOKEN', 'SITE_URL'],
  whatsapp: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'META_APP_SECRET', 'STAFF_WHATSAPP'],
  reels: ['BLOB_READ_WRITE_TOKEN'],
  deposits: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
  aiReplies: ['ANTHROPIC_API_KEY'],
} as const;

type Feature = keyof typeof FEATURES;

/** Features that are expected to be off for now: deposits until Stripe is connected, AI until CONCIERGE_AI=on. */
const OPTIONAL: Partial<Record<Feature, () => boolean>> = {
  deposits: () => false,
  aiReplies: () => CONCIERGE.aiReplies,
};

export interface Check {
  ok: boolean;
  /** Counts, dates and public names only. */
  detail?: Record<string, unknown>;
  error?: string;
}

export interface StatusReport {
  ok: boolean;
  checkedAt: string;
  /** Per feature: the variables that are missing or empty. Empty arrays mean complete. */
  env: Record<Feature, { required: boolean; missing: string[] }>;
  checks: Record<'encryption' | 'database' | 'instagram' | 'whatsapp' | 'staffNumber', Check>;
}

const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${TIMEOUT_MS} ms`)), TIMEOUT_MS)),
  ]);
}

async function check(run: () => Promise<Record<string, unknown> | undefined>): Promise<Check> {
  try {
    return { ok: true, detail: await withTimeout(run()) };
  } catch (error) {
    // Provider messages describe the failure ("Invalid OAuth access token"); they carry no secret.
    return { ok: false, error: (error instanceof Error ? error.message : String(error)).slice(0, 200) };
  }
}

function envReport(): StatusReport['env'] {
  const report = {} as StatusReport['env'];
  for (const [feature, names] of Object.entries(FEATURES) as [Feature, readonly string[]][]) {
    const optional = OPTIONAL[feature];
    report[feature] = {
      required: optional ? optional() : true,
      missing: names.filter((name) => !process.env[name]?.trim()),
    };
  }
  return report;
}

/** A count without rows: no personal field is ever selected. */
const rows = (table: string) => db().from(table).select('*', { count: 'exact', head: true });

async function counted(
  label: string,
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  const { count, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return count ?? 0;
}

const daysUntil = (iso: string | null) => (iso ? Math.floor((Date.parse(iso) - Date.now()) / 86_400_000) : null);

export async function runStatusCheck(): Promise<StatusReport> {
  const env = envReport();
  const missing = (feature: Feature) => env[feature].missing.length > 0;
  const skipped = (feature: Feature): Check => ({ ok: !env[feature].required, error: `${env[feature].missing.join(', ')} missing or empty` });

  const [encryption, database, instagram, whatsapp, staffNumber] = await Promise.all([
    missing('storage')
      ? skipped('storage')
      : check(async () => {
          // A round trip proves the key ring parses and its first key encrypts and decrypts.
          const sealed = encrypt('status-check', 'status.selftest');
          if (decrypt(sealed, 'status.selftest') !== 'status-check') throw new Error('round trip returned a different value');
          blindIndex('status-check', 'status.selftest');
          return undefined;
        }),
    missing('storage')
      ? skipped('storage')
      : check(async () => {
          const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
          const now = new Date().toISOString();
          const [activeOffers, activeTours, openDepartures, contacts, messages, bookings, clickedThisWeek] = await Promise.all([
            counted('affiliate_offers', rows('affiliate_offers').eq('active', true)),
            counted('tours', rows('tours').eq('active', true)),
            counted('departures', rows('departures').eq('status', 'open').gte('starts_at', now)),
            counted('contacts', rows('contacts')),
            counted('messages', rows('messages')),
            counted('bookings', rows('bookings')),
            counted('affiliate_clicks', rows('affiliate_clicks').gte('first_clicked_at', weekAgo)),
          ]);
          return { activeOffers, activeTours, openDepartures, contacts, messages, bookings, linksClickedLast7Days: clickedThisWeek };
        }),
    missing('instagram') || missing('storage')
      ? skipped(missing('instagram') ? 'instagram' : 'storage')
      : check(async () => {
          const peek = await peekInstagramToken();
          const me = await graphGet(`https://graph.instagram.com/${CONCIERGE.graphVersion}/me?fields=username`, peek.token);
          return {
            account: me.username,
            tokenSource: peek.source,
            tokenRenewedAt: peek.obtainedAt,
            tokenExpiresInDays: daysUntil(peek.expiresAt),
          };
        }),
    missing('whatsapp')
      ? skipped('whatsapp')
      : check(async () => {
          const number = await graphGet(
            `https://graph.facebook.com/${CONCIERGE.graphVersion}/${process.env.WHATSAPP_PHONE_NUMBER_ID}` +
              '?fields=verified_name,display_phone_number,quality_rating,code_verification_status',
            process.env.WHATSAPP_ACCESS_TOKEN!,
          );
          const phone = String(number.display_phone_number ?? '');
          return {
            verifiedName: number.verified_name,
            phoneEndsWith: phone.replace(/\D/g, '').slice(-4) || null,
            qualityRating: number.quality_rating,
            codeVerification: number.code_verification_status,
          };
        }),
    !process.env.STAFF_WHATSAPP?.trim()
      ? Promise.resolve<Check>({ ok: false, error: 'STAFF_WHATSAPP missing or empty' })
      : check(async () => {
          // WhatsApp expects the number in international form, digits only (e.g. 4917612345678).
          const digits = process.env.STAFF_WHATSAPP!.replace(/^\+/, '');
          if (!/^[1-9]\d{7,14}$/.test(digits)) throw new Error('STAFF_WHATSAPP is not an international number (digits only, no leading 0)');
          // Atilla's own number: its shape is checked, none of it is reported.
          return undefined;
        }),
  ]);

  const checks = { encryption, database, instagram, whatsapp, staffNumber };
  const envOk = Object.values(env).every((f) => !f.required || f.missing.length === 0);
  return {
    ok: envOk && Object.values(checks).every((c) => c.ok),
    checkedAt: new Date().toISOString(),
    env,
    checks,
  };
}
