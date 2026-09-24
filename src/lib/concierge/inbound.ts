import { CONCIERGE, env, sleep, type Channel } from './config';
import {
  claimAgentTurn,
  claimEvent,
  contactForStaffAlert,
  latestCustomerMessageId,
  messageExists,
  recordInbound,
  recordOutbound,
  releaseAgentTurn,
  updateContact,
  upsertContact,
  type Contact,
} from './db';
import {
  alertStaff,
  markWhatsAppRead,
  sendInstagramPrivateReply,
  sendToContact,
  sendWhatsAppText,
} from './meta';
import { commentReply, guessLang, staff } from './copy';
import { runConcierge } from './agent';

type Job = () => Promise<void>;

const displayName = (c: Contact) => c.name ?? (c.username ? `@${c.username}` : `+${c.external_id}`);

// ---------- Customer messages ----------

interface InboundMessage {
  channel: Channel;
  externalId: string;
  metaMessageId: string;
  text: string;
  name?: string;
  username?: string;
}

async function handleCustomerMessage(msg: InboundMessage): Promise<void> {
  const contact = await upsertContact(msg.channel, msg.externalId, {
    name: msg.name,
    username: msg.username,
    phone: msg.channel === 'whatsapp' ? msg.externalId : null,
  });
  if (!(await recordInbound(contact.id, msg.text, msg.metaMessageId))) return;
  if (msg.channel === 'whatsapp') await markWhatsAppRead(msg.metaMessageId);
  if (contact.bot_paused) return;

  await sleep(CONCIERGE.debounceMs);
  await answerWhenFree(contact.id);
}

/**
 * One agent run per contact at a time. A message that arrives mid-run is picked up by a
 * follow-up run of whoever holds the turn, so bursts get one coherent answer.
 */
async function answerWhenFree(contactId: string): Promise<void> {
  while (await claimAgentTurn(contactId)) {
    let answered: number | null;
    try {
      answered = await latestCustomerMessageId(contactId);
      await runConcierge(contactId);
    } finally {
      await releaseAgentTurn(contactId);
    }
    if ((await latestCustomerMessageId(contactId)) === answered) return;
  }
}

// ---------- Atilla on WhatsApp ----------

/** Atilla answers a customer by replying to the alert about them; "bot" hands back to the concierge. */
async function handleStaffMessage(metaMessageId: string, text: string, replyToId?: string): Promise<void> {
  if (!(await claimEvent(`staff:${metaMessageId}`))) return;
  const staffPhone = env('STAFF_WHATSAPP');
  const target = replyToId ? await contactForStaffAlert(replyToId) : null;
  if (!target) {
    await sendWhatsAppText(staffPhone, staff.help);
    return;
  }

  if (text.trim().toLowerCase() === 'bot') {
    await updateContact(target.id, { bot_paused: false });
    await alertStaff(staffPhone, staff.botResumed(displayName(target)), target);
    return;
  }

  const contact = target.bot_paused ? target : await updateContact(target.id, { bot_paused: true });
  await sendToContact(contact, text, 'human');
  await alertStaff(staffPhone, staff.relayed, contact);
}

// ---------- Instagram specifics ----------

/** Atilla replied from the Instagram app: log it and step the bot back for this customer. */
async function handleInstagramEcho(customerId: string, mid: string, text: string): Promise<void> {
  // Our own API sends echo back too; give recordOutbound a moment to store their ids.
  await sleep(3000);
  if (await messageExists(mid)) return;
  const contact = await upsertContact('instagram', customerId);
  await recordOutbound(contact.id, 'human', text, mid);
  if (!contact.bot_paused) {
    await updateContact(contact.id, { bot_paused: true });
    await alertStaff(env('STAFF_WHATSAPP'), staff.humanTookOver(displayName(contact)), contact);
  }
}

/** Comment-to-DM: a keyword under a post or reel opens a private conversation. */
async function handleInstagramComment(commentId: string, text: string, fromId: string, username?: string) {
  if (fromId === env('INSTAGRAM_ACCOUNT_ID')) return;
  const words = text.toLowerCase().split(/[^\p{L}\p{N}]+/u);
  if (!words.some((w) => CONCIERGE.commentKeywords.includes(w))) return;

  const contact = await upsertContact('instagram', fromId, { username });
  // Logged as the customer's opening line so the concierge knows where they came from.
  if (!(await recordInbound(contact.id, `[Instagram comment] ${text}`, `comment:${commentId}`))) return;

  const lang = contact.language ?? guessLang(text);
  const reply = commentReply(lang);
  const sent = await sendInstagramPrivateReply(commentId, reply);
  if (!contact.language) await updateContact(contact.id, { language: lang });
  await recordOutbound(contact.id, 'assistant', reply, sent.messageId);
}

// ---------- Payload parsing ----------

interface WhatsAppMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
  button?: { text: string };
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } };
  image?: { caption?: string };
  video?: { caption?: string };
  document?: { caption?: string; filename?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  context?: { id: string };
}

function whatsappText(m: WhatsAppMessage): string | null {
  switch (m.type) {
    case 'text':
      return m.text?.body ?? null;
    case 'button':
      return m.button?.text ?? null;
    case 'interactive':
      return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? null;
    case 'image':
    case 'video':
      return `[${m.type}]${m[m.type]?.caption ? ` ${m[m.type]!.caption}` : ''}`;
    case 'document':
      return `[document ${m.document?.filename ?? ''}]${m.document?.caption ? ` ${m.document.caption}` : ''}`;
    case 'audio':
      return '[voice message]';
    case 'location': {
      const l = m.location!;
      return `[location] ${[l.name, l.address].filter(Boolean).join(', ')} (${l.latitude}, ${l.longitude})`;
    }
    case 'reaction':
      return null;
    default:
      return `[${m.type}]`;
  }
}

interface InstagramEvent {
  sender: { id: string };
  recipient: { id: string };
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
    is_deleted?: boolean;
    is_unsupported?: boolean;
    quick_reply?: { payload: string };
    attachments?: { type: string }[];
    reply_to?: { story?: { id: string } };
  };
  postback?: { mid: string; title: string };
}

function instagramText(message: NonNullable<InstagramEvent['message']>): string | null {
  const attachments = (message.attachments ?? []).map((a) => `[${a.type === 'audio' ? 'voice message' : a.type}]`);
  const text = [message.reply_to?.story ? '[replied to your story]' : '', ...attachments, message.text ?? '']
    .filter(Boolean)
    .join(' ');
  return text || null;
}

/** Turns a Meta webhook payload into independent jobs to run after the 200 response. */
export function jobsFromMetaWebhook(payload: {
  object?: string;
  entry?: Record<string, unknown>[];
}): Job[] {
  const jobs: Job[] = [];
  const staffPhone = process.env.STAFF_WHATSAPP;

  if (payload.object === 'whatsapp_business_account') {
    for (const entry of payload.entry ?? []) {
      for (const change of (entry.changes as { value?: Record<string, unknown> }[] | undefined) ?? []) {
        const value = change.value ?? {};
        const names = new Map(
          ((value.contacts as { wa_id: string; profile?: { name?: string } }[] | undefined) ?? []).map((c) => [
            c.wa_id,
            c.profile?.name,
          ]),
        );
        for (const m of (value.messages as WhatsAppMessage[] | undefined) ?? []) {
          const text = whatsappText(m);
          if (!text) continue;
          if (staffPhone && m.from === staffPhone) {
            jobs.push(() => handleStaffMessage(m.id, text, m.context?.id));
          } else {
            jobs.push(() =>
              handleCustomerMessage({
                channel: 'whatsapp',
                externalId: m.from,
                metaMessageId: m.id,
                text,
                name: names.get(m.from),
              }),
            );
          }
        }
      }
    }
  }

  if (payload.object === 'instagram') {
    for (const entry of payload.entry ?? []) {
      for (const event of (entry.messaging as InstagramEvent[] | undefined) ?? []) {
        const { message, postback } = event;
        if (message?.is_echo) {
          if (message.text) jobs.push(() => handleInstagramEcho(event.recipient.id, message.mid, message.text!));
          continue;
        }
        if (message && !message.is_deleted && !message.is_unsupported) {
          const text = instagramText(message);
          if (text) {
            jobs.push(() =>
              handleCustomerMessage({ channel: 'instagram', externalId: event.sender.id, metaMessageId: message.mid, text }),
            );
          }
        } else if (postback) {
          jobs.push(() =>
            handleCustomerMessage({
              channel: 'instagram',
              externalId: event.sender.id,
              metaMessageId: postback.mid,
              text: postback.title,
            }),
          );
        }
      }
      for (const change of (entry.changes as { field: string; value: Record<string, unknown> }[] | undefined) ?? []) {
        if (change.field !== 'comments') continue;
        const v = change.value as { id: string; text?: string; from?: { id: string; username?: string } };
        if (v.text && v.from) jobs.push(() => handleInstagramComment(v.id, v.text!, v.from!.id, v.from!.username));
      }
    }
  }

  return jobs;
}
