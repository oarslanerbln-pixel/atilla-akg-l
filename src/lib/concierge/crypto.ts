import 'server-only';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from './config';

// Field-level encryption for personal data at rest: AES-256-GCM with a random 96-bit IV per value.
// The associated data binds each ciphertext to its column and row, so a value copied into
// another field or another customer's row fails authentication instead of decrypting.
//
// Token format: v1.<keyId>.<iv>.<ciphertext>.<tag>   (base64url parts)

const VERSION = 'v1';
const KEY_ID = /^[A-Za-z0-9_-]{1,16}$/;

interface Keyring {
  activeId: string;
  keys: Map<string, Buffer>;
}

let keyring: Keyring | null = null;
let indexKey: Buffer | null = null;

function parseKey(base64: string, label: string): Buffer {
  const key = Buffer.from(base64, 'base64');
  if (key.length !== 32) throw new Error(`${label} must be 32 random bytes, base64-encoded`);
  return key;
}

/**
 * CONCIERGE_ENCRYPTION_KEYS="2:<base64>,1:<base64>": the first key encrypts, every listed key
 * decrypts. To rotate, prepend a new key and keep the old ones until the data is re-encrypted.
 */
function loadKeyring(): Keyring {
  if (keyring) return keyring;
  const entries = env('CONCIERGE_ENCRYPTION_KEYS')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const sep = entry.indexOf(':');
      const id = entry.slice(0, sep);
      if (sep < 1 || !KEY_ID.test(id)) throw new Error('CONCIERGE_ENCRYPTION_KEYS entries must look like "<id>:<base64>"');
      return [id, parseKey(entry.slice(sep + 1), `Encryption key "${id}"`)] as const;
    });
  if (!entries.length) throw new Error('CONCIERGE_ENCRYPTION_KEYS is empty');
  keyring = { activeId: entries[0][0], keys: new Map(entries) };
  return keyring;
}

export function encrypt(plaintext: string, context: string): string {
  const { activeId, keys } = loadKeyring();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keys.get(activeId)!, iv);
  cipher.setAAD(Buffer.from(context, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [VERSION, activeId, iv.toString('base64url'), ciphertext.toString('base64url'), cipher.getAuthTag().toString('base64url')].join('.');
}

export function decrypt(token: string, context: string): string {
  const [version, keyId, iv, ciphertext, tag] = token.split('.');
  if (version !== VERSION || !tag) throw new Error(`Unrecognised ciphertext for ${context}`);
  const key = loadKeyring().keys.get(keyId);
  if (!key) throw new Error(`Encryption key "${keyId}" is not configured`);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from(context, 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

export function seal(value: string | null | undefined, context: string): string | null {
  return value == null || value === '' ? null : encrypt(value, context);
}

export function unseal(value: unknown, context: string): string | null {
  return typeof value === 'string' && value ? decrypt(value, context) : null;
}

/**
 * Keyed HMAC-SHA256 "blind index": lets us look a customer up by phone number or Instagram id
 * without storing that identifier in the clear. Uses its own key, separate from encryption.
 */
export function blindIndex(value: string, context: string): string {
  indexKey ??= parseKey(env('CONCIERGE_INDEX_KEY'), 'CONCIERGE_INDEX_KEY');
  return createHmac('sha256', indexKey).update(`${context}\0${value}`, 'utf8').digest('base64url');
}

/** Constant-time string comparison for shared secrets. */
export function safeEqual(a: string, b: string): boolean {
  const left = createHmac('sha256', 'compare').update(a).digest();
  const right = createHmac('sha256', 'compare').update(b).digest();
  return timingSafeEqual(left, right);
}
