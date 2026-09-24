import { createHmac, timingSafeEqual } from 'node:crypto';
import { CONCIERGE, env, type Lang } from './config';
import { recordOutbound, rememberStaffAlert, type Contact } from './db';

const WHATSAPP_LIMIT = 4000;
const INSTAGRAM_LIMIT = 1000;
// WhatsApp error: more than 24h since the customer last wrote, only templates are allowed.
const WA_REENGAGEMENT_REQUIRED = 131047;

export class MetaApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: number | undefined,
    message: string,
  ) {
    super(`Meta API ${status}${code ? ` (code ${code})` : ''}: ${message}`);
  }
}

async function graphPost(url: string, token: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { code?: number; message?: string } };
  if (!res.ok) throw new MetaApiError(res.status, json.error?.code, json.error?.message ?? res.statusText);
  return json as Record<string, unknown>;
}

/** Validates X-Hub-Signature-256. WhatsApp and Instagram may live in different Meta apps. */
export function verifyMetaSignature(rawBody: string, header: string | null): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const received = Buffer.from(header.slice('sha256='.length), 'hex');
  const secrets = [process.env.META_APP_SECRET, process.env.INSTAGRAM_APP_SECRET].filter(Boolean) as string[];
  return secrets.some((secret) => {
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
}

/** Splits on paragraph, then sentence boundaries so long answers arrive as natural chat bubbles. */
export function splitMessage(text: string, max: number): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    const window = rest.slice(0, max);
    const cut = Math.max(window.lastIndexOf('\n\n'), window.lastIndexOf('. '), window.lastIndexOf('\n'));
    const at = cut > max * 0.4 ? cut + 1 : max;
    parts.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

// ---------- WhatsApp Cloud API ----------

function whatsappUrl(): string {
  return `https://graph.facebook.com/${CONCIERGE.graphVersion}/${env('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
}

export async function sendWhatsAppText(to: string, text: string): Promise<string | undefined> {
  const json = await graphPost(whatsappUrl(), env('WHATSAPP_ACCESS_TOKEN'), {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text, preview_url: true },
  });
  return (json.messages as { id: string }[] | undefined)?.[0]?.id;
}

/** Template parameters may not contain newlines, tabs or long runs of spaces. */
function templateParam(text: string): string {
  return text.replace(/\s*\n+\s*/g, ' · ').replace(/\s{4,}/g, '   ').slice(0, 1000);
}

export async function sendWhatsAppTemplate(
  to: string,
  name: string,
  lang: string,
  params: string[],
): Promise<string | undefined> {
  const json = await graphPost(whatsappUrl(), env('WHATSAPP_ACCESS_TOKEN'), {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name,
      language: { code: lang },
      components: [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: templateParam(p) })) }],
    },
  });
  return (json.messages as { id: string }[] | undefined)?.[0]?.id;
}

/** Free-form text inside the 24h window, otherwise the approved template carrying the same text. */
async function sendWhatsAppWithFallback(to: string, text: string, template: string, lang: string) {
  try {
    return await sendWhatsAppText(to, text);
  } catch (error) {
    if (error instanceof MetaApiError && error.code === WA_REENGAGEMENT_REQUIRED) {
      return sendWhatsAppTemplate(to, template, lang, [text]);
    }
    throw error;
  }
}

export async function markWhatsAppRead(messageId: string): Promise<void> {
  await graphPost(whatsappUrl(), env('WHATSAPP_ACCESS_TOKEN'), {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
    typing_indicator: { type: 'text' },
  }).catch(() => undefined);
}

// ---------- Instagram API with Instagram Login ----------

function instagramUrl(): string {
  return `https://graph.instagram.com/${CONCIERGE.graphVersion}/${env('INSTAGRAM_ACCOUNT_ID')}/messages`;
}

export async function sendInstagramText(
  recipientId: string,
  text: string,
  opts: { humanAgent?: boolean } = {},
): Promise<string | undefined> {
  const json = await graphPost(instagramUrl(), env('INSTAGRAM_ACCESS_TOKEN'), {
    recipient: { id: recipientId },
    message: { text },
    // A human reply may go out up to 7 days after the customer's last message.
    ...(opts.humanAgent ? { messaging_type: 'MESSAGE_TAG', tag: 'HUMAN_AGENT' } : {}),
  });
  return json.message_id as string | undefined;
}

/** Private reply to a comment: opens a DM thread with the commenter. */
export async function sendInstagramPrivateReply(
  commentId: string,
  text: string,
): Promise<{ recipientId?: string; messageId?: string }> {
  const json = await graphPost(instagramUrl(), env('INSTAGRAM_ACCESS_TOKEN'), {
    recipient: { comment_id: commentId },
    message: { text },
  });
  return { recipientId: json.recipient_id as string | undefined, messageId: json.message_id as string | undefined };
}

// ---------- Channel-agnostic helpers ----------

/** Sends to a customer on their own channel and logs every bubble. */
export async function sendToContact(
  contact: Contact,
  text: string,
  role: 'assistant' | 'human' = 'assistant',
): Promise<void> {
  const lang: Lang = contact.language ?? 'en';
  if (contact.channel === 'whatsapp') {
    for (const part of splitMessage(text, WHATSAPP_LIMIT)) {
      const id = await sendWhatsAppWithFallback(contact.external_id, part, 'booking_update', lang);
      await recordOutbound(contact.id, role, part, id);
    }
  } else {
    for (const part of splitMessage(text, INSTAGRAM_LIMIT)) {
      const id = await sendInstagramText(contact.external_id, part, { humanAgent: role === 'human' });
      await recordOutbound(contact.id, role, part, id);
    }
  }
}

/** WhatsApp message to Atilla or a guide. Replies to it are relayed to `aboutContact`. */
export async function alertStaff(phone: string, text: string, aboutContact?: Contact): Promise<void> {
  const id = await sendWhatsAppWithFallback(phone, text, 'concierge_alert', 'tr');
  if (id && aboutContact) await rememberStaffAlert(id, aboutContact.id);
}
