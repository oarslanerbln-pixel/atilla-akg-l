import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, type Channel, type Lang } from './config';

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

export async function getContact(id: string): Promise<Contact> {
  return must(await db().from('contacts').select('*').eq('id', id).single(), 'getContact');
}

export async function upsertContact(
  channel: Channel,
  externalId: string,
  profile: { name?: string | null; username?: string | null; phone?: string | null } = {},
): Promise<Contact> {
  const found = await db()
    .from('contacts')
    .select('*')
    .eq('channel', channel)
    .eq('external_id', externalId)
    .maybeSingle();
  if (found.error) throw new Error(`upsertContact: ${found.error.message}`);

  if (found.data) {
    const contact = found.data as Contact;
    const patch: Partial<Contact> = {};
    if (!contact.name && profile.name) patch.name = profile.name;
    if (!contact.username && profile.username) patch.username = profile.username;
    return Object.keys(patch).length ? updateContact(contact.id, patch) : contact;
  }

  // Two webhook deliveries can race here; the unique key makes the loser fall back to a read.
  const inserted = await db()
    .from('contacts')
    .upsert(
      { channel, external_id: externalId, name: profile.name, username: profile.username, phone: profile.phone },
      { onConflict: 'channel,external_id', ignoreDuplicates: true },
    )
    .select('*')
    .maybeSingle();
  if (inserted.error) throw new Error(`upsertContact: ${inserted.error.message}`);
  if (inserted.data) return inserted.data as Contact;
  return upsertContact(channel, externalId, profile);
}

export async function updateContact(id: string, patch: Partial<Contact> & Record<string, unknown>): Promise<Contact> {
  return must(
    await db()
      .from('contacts')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single(),
    'updateContact',
  );
}

/** Returns false when Meta re-delivers a message we already stored. */
export async function recordInbound(contactId: string, body: string, metaMessageId: string): Promise<boolean> {
  const { error } = await db()
    .from('messages')
    .insert({ contact_id: contactId, role: 'customer', body, meta_message_id: metaMessageId });
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
    .insert({ contact_id: contactId, role, body, meta_message_id: metaMessageId ?? null });
  if (error && error.code !== '23505') throw new Error(`recordOutbound: ${error.message}`);
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
  return rows.reverse();
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
  return (data?.contact as unknown as Contact | undefined) ?? null;
}
