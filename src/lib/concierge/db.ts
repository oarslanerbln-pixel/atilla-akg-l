import 'server-only';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, type Channel, type Lang } from './config';
import { blindIndex, decrypt, encrypt, seal, unseal } from './crypto';

export type Stage = 'new' | 'qualifying' | 'qualified' | 'offer_sent' | 'booked' | 'completed' | 'lost';
export type MessageRole = 'customer' | 'assistant' | 'human';

export interface Contact {
  id: string;
  channel: Channel;
  external_id: string;
  name: string | null;
  username: string | null;
  language: Lang | null;
  email: string | null;
  phone: string | null;
  stage: Stage;
  qualification: Record<string, unknown>;
  bot_paused: boolean;
  marketing_consent: boolean;
}

export interface StoredMessage {
  id: number;
  role: MessageRole;
  body: string;
  meta_message_id: string | null;
  created_at: string;
}

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  client ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${what}: no data`);
  return result.data;
}

// Personal fields are sealed with AES-256-GCM before they leave the server. The associated data
// names table, column and row, so ciphertext moved to another column or row will not decrypt.
const SEALED_CONTACT_FIELDS = ['external_id', 'name', 'username', 'email', 'phone'] as const;
const contactAad = (field: string, id: string) => `contacts.${field}:${id}`;
const messageAad = (contactId: string) => `messages.body:${contactId}`;
const lookupKey = (channel: Channel, externalId: string) => blindIndex(externalId, `contacts.external_id:${channel}`);

export type ContactPatch = Partial<Omit<Contact, 'id' | 'channel' | 'external_id'>>;

function contactFromRow(row: Record<string, unknown>): Contact {
  const id = row.id as string;
  const qualification = unseal(row.qualification, contactAad('qualification', id));
  return {
    id,
    channel: row.channel as Channel,
    external_id: unseal(row.external_id, contactAad('external_id', id)) ?? '',
    name: unseal(row.name, contactAad('name', id)),
    username: unseal(row.username, contactAad('username', id)),
    language: (row.language as Lang | null) ?? null,
    email: unseal(row.email, contactAad('email', id)),
    phone: unseal(row.phone, contactAad('phone', id)),
    stage: row.stage as Stage,
    qualification: qualification ? JSON.parse(qualification) : {},
    bot_paused: row.bot_paused === true,
    marketing_consent: row.marketing_consent === true,
  };
}

function contactPatchToRow(id: string, patch: ContactPatch & { external_id?: string }): Record<string, unknown> {
  const row: Record<string, unknown> = { ...patch };
  for (const field of SEALED_CONTACT_FIELDS) {
    if (field in patch) row[field] = seal(patch[field], contactAad(field, id));
  }
  if (patch.qualification) row.qualification = seal(JSON.stringify(patch.qualification), contactAad('qualification', id));
  return row;
}

export async function getContact(id: string): Promise<Contact> {
  return contactFromRow(must(await db().from('contacts').select('*').eq('id', id).single(), 'getContact'));
}

export async function upsertContact(
  channel: Channel,
  externalId: string,
  profile: { name?: string | null; username?: string | null; phone?: string | null } = {},
): Promise<Contact> {
  const hash = lookupKey(channel, externalId);
  const found = await db()
    .from('contacts')
    .select('*')
    .eq('channel', channel)
    .eq('external_id_hash', hash)
    .maybeSingle();
  if (found.error) throw new Error(`upsertContact: ${found.error.message}`);

  if (found.data) {
    const contact = contactFromRow(found.data);
    const patch: ContactPatch = {};
    if (!contact.name && profile.name) patch.name = profile.name;
    if (!contact.username && profile.username) patch.username = profile.username;
    return Object.keys(patch).length ? updateContact(contact.id, patch) : contact;
  }

  // The id is chosen here because it is part of every sealed field's associated data.
  // Two webhook deliveries can race; the unique key makes the loser fall back to a read.
  const id = randomUUID();
  const inserted = await db()
    .from('contacts')
    .upsert(
      {
        id,
        channel,
        external_id_hash: hash,
        ...contactPatchToRow(id, { external_id: externalId, name: profile.name, username: profile.username, phone: profile.phone }),
      },
      { onConflict: 'channel,external_id_hash', ignoreDuplicates: true },
    )
    .select('*')
    .maybeSingle();
  if (inserted.error) throw new Error(`upsertContact: ${inserted.error.message}`);
  if (inserted.data) return contactFromRow(inserted.data);
  return upsertContact(channel, externalId, profile);
}

export async function updateContact(id: string, patch: ContactPatch): Promise<Contact> {
  return contactFromRow(
    must(
      await db()
        .from('contacts')
        .update({ ...contactPatchToRow(id, patch), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single(),
      'updateContact',
    ),
  );
}

/** Returns false when Meta re-delivers a message we already stored. */
export async function recordInbound(contactId: string, body: string, metaMessageId: string): Promise<boolean> {
  const { error } = await db()
    .from('messages')
    .insert({ contact_id: contactId, role: 'customer', body: encrypt(body, messageAad(contactId)), meta_message_id: metaMessageId });
  if (error?.code === '23505') return false;
  if (error) throw new Error(`recordInbound: ${error.message}`);
  await db().from('contacts').update({ last_inbound_at: new Date().toISOString() }).eq('id', contactId);
  return true;
}

export async function recordOutbound(
  contactId: string,
  role: 'assistant' | 'human',
  body: string,
  metaMessageId?: string | null,
): Promise<void> {
  const { error } = await db()
    .from('messages')
    .insert({ contact_id: contactId, role, body: encrypt(body, messageAad(contactId)), meta_message_id: metaMessageId ?? null });
  if (error && error.code !== '23505') throw new Error(`recordOutbound: ${error.message}`);
}

/** Customer messages received since the given time, for flood protection. */
export async function customerMessagesSince(contactId: string, since: Date): Promise<number> {
  const { count, error } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('contact_id', contactId)
    .eq('role', 'customer')
    .gte('created_at', since.toISOString());
  if (error) throw new Error(`customerMessagesSince: ${error.message}`);
  return count ?? 0;
}

export async function messageExists(metaMessageId: string): Promise<boolean> {
  const { count } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('meta_message_id', metaMessageId);
  return (count ?? 0) > 0;
}

/** Newest-last slice of the conversation. */
export async function recentMessages(contactId: string, limit: number): Promise<StoredMessage[]> {
  const rows = must(
    await db()
      .from('messages')
      .select('id, role, body, meta_message_id, created_at')
      .eq('contact_id', contactId)
      .order('id', { ascending: false })
      .limit(limit),
    'recentMessages',
  ) as StoredMessage[];
  return rows.reverse().map((m) => ({ ...m, body: decrypt(m.body, messageAad(contactId)) }));
}

export async function latestCustomerMessageId(contactId: string): Promise<number | null> {
  const { data } = await db()
    .from('messages')
    .select('id')
    .eq('contact_id', contactId)
    .eq('role', 'customer')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function claimAgentTurn(contactId: string): Promise<boolean> {
  const { data, error } = await db().rpc('claim_agent_turn', { p_contact_id: contactId });
  if (error) throw new Error(`claimAgentTurn: ${error.message}`);
  return data === true;
}

export async function releaseAgentTurn(contactId: string): Promise<void> {
  await db().from('contacts').update({ agent_lock_until: null }).eq('id', contactId);
}

/** True the first time an event id is seen; false for redeliveries. */
export async function claimEvent(id: string): Promise<boolean> {
  const { error } = await db().from('processed_events').insert({ id });
  if (error?.code === '23505') return false;
  if (error) throw new Error(`claimEvent: ${error.message}`);
  return true;
}

export async function rememberStaffAlert(metaMessageId: string, contactId: string): Promise<void> {
  await db().from('staff_alerts').upsert({ meta_message_id: metaMessageId, contact_id: contactId });
}

export async function contactForStaffAlert(metaMessageId: string): Promise<Contact | null> {
  const { data } = await db()
    .from('staff_alerts')
    .select('contact:contacts(*)')
    .eq('meta_message_id', metaMessageId)
    .maybeSingle();
  const row = data?.contact as unknown as Record<string, unknown> | null | undefined;
  return row ? contactFromRow(row) : null;
}
