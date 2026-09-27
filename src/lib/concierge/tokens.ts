import 'server-only';
import { env } from './config';
import { blindIndex, decrypt, encrypt } from './crypto';
import { db } from './db';

// The Instagram API with Instagram Login issues long-lived tokens that expire after 60 days. Meta
// renews one on request once it is a day old, so a weekly cron (/api/cron/instagram-token) keeps
// the bot's token alive and stores each new one here, sealed like the customer data.
//
// INSTAGRAM_ACCESS_TOKEN only seeds the stored token. The row keeps a keyed fingerprint of the env
// token it grew from, so pasting a new token into Vercel replaces the stored one on the next call.

const INSTAGRAM = 'instagram';
const REFRESH_URL = 'https://graph.instagram.com/refresh_access_token';
/** Meta refuses to refresh a token younger than this. */
const MIN_REFRESH_AGE_MS = 24 * 60 * 60 * 1000;

const tokenAad = (id: string) => `access_tokens.token:${id}`;
const seedHash = (token: string) => blindIndex(token, `access_tokens.seed_hash:${INSTAGRAM}`);

interface StoredToken {
  token: string;
  seedHash: string;
  /** When we received the token; Meta issued it no later than this. */
  obtainedAt: string;
  /** Known once the token has been refreshed. */
  expiresAt: string | null;
}

export class InstagramTokenError extends Error {
  constructor(
    message: string,
    readonly expiresAt: string | null,
  ) {
    super(message);
  }
}

async function readStoredToken(): Promise<StoredToken | null> {
  const { data, error } = await db()
    .from('access_tokens')
    .select('token, seed_hash, obtained_at, expires_at')
    .eq('id', INSTAGRAM)
    .maybeSingle();
  if (error) throw new Error(`Load Instagram token: ${error.message}`);
  if (!data) return null;
  return {
    token: decrypt(data.token, tokenAad(INSTAGRAM)),
    seedHash: data.seed_hash,
    obtainedAt: data.obtained_at,
    expiresAt: data.expires_at,
  };
}

async function seedStoredToken(envToken: string, hash: string): Promise<StoredToken> {
  const obtainedAt = new Date().toISOString();
  const { error } = await db().from('access_tokens').upsert({
    id: INSTAGRAM,
    token: encrypt(envToken, tokenAad(INSTAGRAM)),
    seed_hash: hash,
    obtained_at: obtainedAt,
    expires_at: null,
  });
  if (error) throw new Error(`Store Instagram token: ${error.message}`);
  return { token: envToken, seedHash: hash, obtainedAt, expiresAt: null };
}

/** The stored token, seeded from INSTAGRAM_ACCESS_TOKEN on first use or when that variable changes. */
async function currentToken(envToken: string): Promise<StoredToken> {
  const hash = seedHash(envToken);
  const stored = await readStoredToken();
  return stored?.seedHash === hash ? stored : seedStoredToken(envToken, hash);
}

/**
 * Token for every Instagram API call. If the table is unreachable (e.g. the migration has not run
 * yet) the env token is used, so storage trouble never silences the bot while that token lives.
 */
export async function instagramAccessToken(): Promise<string> {
  const envToken = env('INSTAGRAM_ACCESS_TOKEN');
  try {
    return (await currentToken(envToken)).token;
  } catch (error) {
    console.error('[concierge] stored Instagram token unavailable, using INSTAGRAM_ACCESS_TOKEN', error);
    return envToken;
  }
}

export type TokenRefresh =
  | { status: 'refreshed'; expiresAt: string | null }
  /** Younger than a day: Meta would refuse, and a duplicate cron delivery lands here. */
  | { status: 'too_new'; expiresAt: string | null }
  /** A concurrent run stored its token first; ours is valid too and simply not kept. */
  | { status: 'superseded'; expiresAt: string | null };

/** Renews the stored token for another 60 days. Safe to run twice (Vercel may deliver a cron twice). */
export async function refreshInstagramToken(): Promise<TokenRefresh> {
  const current = await currentToken(env('INSTAGRAM_ACCESS_TOKEN'));
  if (Date.now() - Date.parse(current.obtainedAt) < MIN_REFRESH_AGE_MS) {
    return { status: 'too_new', expiresAt: current.expiresAt };
  }

  const url = new URL(REFRESH_URL);
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', current.token);
  const res = await fetch(url);
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: unknown;
    expires_in?: unknown;
    error?: { code?: number; message?: string };
  };
  if (!res.ok || typeof json.access_token !== 'string' || !json.access_token) {
    const code = json.error?.code ? ` (code ${json.error.code})` : '';
    throw new InstagramTokenError(
      `Meta refused the token refresh: ${res.status}${code} ${json.error?.message ?? res.statusText}`,
      current.expiresAt,
    );
  }

  // Keep a new token even if expires_in is missing: losing it would be worse than an unknown date.
  const now = new Date();
  const seconds = Number(json.expires_in);
  const expiresAt = Number.isFinite(seconds) ? new Date(now.getTime() + seconds * 1000).toISOString() : null;
  const { data, error } = await db()
    .from('access_tokens')
    .update({ token: encrypt(json.access_token, tokenAad(INSTAGRAM)), obtained_at: now.toISOString(), expires_at: expiresAt })
    .eq('id', INSTAGRAM)
    // Only replace the token this run started from: not a concurrent refresh, not a fresh seed.
    .eq('obtained_at', current.obtainedAt)
    .select('id');
  if (error) throw new InstagramTokenError(`Store refreshed Instagram token: ${error.message}`, current.expiresAt);
  return data.length ? { status: 'refreshed', expiresAt } : { status: 'superseded', expiresAt };
}
