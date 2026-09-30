import 'server-only';
import { CONCIERGE, env, sleep, type Channel } from './config';
import {
  claimAgentTurn,
  claimEvent,
  contactForStaffAlert,
  customerMessagesSince,
  latestCustomerMessageId,
  messageExists,
  recordInbound,
  recordOutbound,
  releaseAgentTurn,
  updateContact,
  upsertContact,
  type Contact,
  type ContactPatch,
} from './db';
import {
  alertStaff,
  markWhatsAppRead,
  MetaApiError,
  replyToInstagramComment,
  sendInstagramPrivateReply,
  sendToContact,
  sendWhatsAppText,
  type QuickReply,
} from './meta';
import {
  commentReply,
  guessLang,
  offerButton,
  offerLink,
  offerTeaser,
  publicCommentReply,
  staff,
  tourButton,
} from './copy';
import {
  activeOffers,
  createOfferLink,
  offerForWords,
  OFFER_PAYLOAD,
  rememberMedia,
  sendOffer,
  sendOfferLink,
} from './offers';
import { runConcierge } from './agent';
import { normalizeWord, wordsOf } from './keywords';

type Job = () => Promise<void>;

const displayName = (c: Contact) => c.name ?? (c.username ? `@${c.username}` : `+${c.external_id}`);
/** A partner keyword counts in a DM only within a message this short ("GOLD", "Gold bitte"). */
const MAX_KEYWORD_MESSAGE_WORDS = 3;

// ---------- Customer messages ----------

interface InboundMessage {
  channel: Channel;
  externalId: string;
  metaMessageId: string;
  text: string;
  name?: string;
  username?: string;
  /** Set when the customer tapped a partner offer's "send me the link" button. */
  offerId?: string;
  /** The Instagram story this message replies to. */
  storyId?: string;
}

async function handleCustomerMessage(msg: InboundMessage): Promise<void> {
  const contact = await upsertContact(msg.channel, msg.externalId, {
    name: msg.name,
    username: msg.username,
    phone: msg.channel === 'whatsapp' ? msg.externalId : null,
  });
  const text = msg.text.slice(0, CONCIERGE.maxInboundChars);
  if (!(await recordInbound(contact.id, text, msg.metaMessageId))) return;
  if (msg.channel === 'whatsapp') await markWhatsAppRead(msg.metaMessageId);
  if (contact.bot_paused) return;
  if (await floodDetected(contact)) return;
  // The link request is answered directly; a paused or removed offer falls through to the concierge.
  if (msg.offerId && (await sendOfferLink(contact, msg.offerId))) return;
  if (await answerOfferKeyword(contact, msg)) return;

  await sleep(CONCIERGE.debounceMs);
  await answerWhenFree(contact.id);
}

/**
 * Story-to-DM: a partner-offer keyword sent as a short reply to a story ("GOLD") gets the offer
 * and its link at once, and the story is remembered as the source like a reel for comments. The
 * same short message outside a story reply (WhatsApp, a plain DM) is answered the same way.
 * Longer messages stay with the concierge, so a keyword in passing never hijacks a conversation.
 */
async function answerOfferKeyword(contact: Contact, msg: InboundMessage): Promise<boolean> {
  // Our own markers such as "[replied to your story]" are not the customer's words.
  const own = msg.text.replace(/\[[^\]]*\]/g, ' ');
  const words = wordsOf(own);
  if (!words.length || words.length > MAX_KEYWORD_MESSAGE_WORDS) return false;
  const offer = offerForWords(words, await activeOffers());
  if (!offer) return false;

  const patch: ContactPatch = {};
  if (!contact.language) patch.language = guessLang(own);
  if (!contact.source_media_id && msg.storyId) {
    await rememberMedia(msg.storyId);
    const keyword = words.find((w) => offer.keywords.some((k) => normalizeWord(k) === w));
    Object.assign(patch, { source_media_id: msg.storyId, source_keyword: keyword });
  }
  const updated = Object.keys(patch).length ? await updateContact(contact.id, patch) : contact;
  await sendOffer(updated, offer, true);
  return true;
}

/**
 * Flood protection: a sender far above any real customer's pace (spam, a bot, someone trying
 * to run up model costs) is handed to Atilla instead of being answered.
 */
async function floodDetected(contact: Contact): Promise<boolean> {
  const count = await customerMessagesSince(contact.id, new Date(Date.now() - 3600_000));
  if (count <= CONCIERGE.maxMessagesPerHour) return false;
  const paused = await updateContact(contact.id, { bot_paused: true });
  await alertStaff(env('STAFF_WHATSAPP'), staff.rateLimited(displayName(paused), count), paused);
  return true;
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

interface InstagramComment {
  commentId: string;
  text: string;
  fromId: string;
  /** The account the webhook is for, i.e. ours: its own comments get no answer. */
  accountId: string;
  username?: string;
  mediaId?: string;
}

/**
 * Comment-to-DM: a keyword under a post or reel opens a private conversation. Partner-offer
 * keywords (e.g. AMEX) get the offer, tour keywords the concierge. The commenter also gets a
 * short public answer, and the reel is remembered as the source of the lead.
 */
async function handleInstagramComment(c: InstagramComment): Promise<void> {
  if (c.fromId === c.accountId) return;
  const words = wordsOf(c.text);
  const offer = offerForWords(words, await activeOffers());
  const keyword = offer
    ? words.find((w) => offer.keywords.some((k) => normalizeWord(k) === w))
    : words.find((w) => CONCIERGE.commentKeywords.includes(w));
  if (!keyword) return;

  if (c.mediaId) await rememberMedia(c.mediaId);
  let contact = await upsertContact('instagram', c.fromId, { username: c.username });
  // Logged as the customer's opening line so the concierge knows where they came from.
  if (!(await recordInbound(contact.id, `[Instagram comment] ${c.text}`, `comment:${c.commentId}`))) return;

  const lang = contact.language ?? guessLang(c.text);
  const patch: ContactPatch = {};
  if (!contact.language) patch.language = lang;
  if (!contact.source_media_id && c.mediaId) Object.assign(patch, { source_media_id: c.mediaId, source_keyword: keyword });
  if (Object.keys(patch).length) contact = await updateContact(contact.id, patch);

  if (offer) {
    await privateReplyWithButton(contact, c.commentId, offerTeaser(lang, offer.pitch[lang]), {
      title: offerButton(lang),
      payload: `${OFFER_PAYLOAD}${offer.id}`,
    }, async () => `${offer.pitch[lang]}\n\n${offerLink(lang, offer.name[lang], await createOfferLink(offer, contact))}`);
  } else {
    const reply = commentReply(lang);
    await privateReplyWithButton(contact, c.commentId, reply, { title: tourButton(lang), payload: 'TOURS' }, async () => reply);
  }

  // A courtesy for other viewers; the DM matters, so a failure here is only logged.
  await replyToInstagramComment(c.commentId, publicCommentReply(lang)).catch((e) =>
    console.error('[concierge] public comment reply failed', e),
  );
}

/**
 * Instagram allows one private reply and nothing more until the customer answers, so it carries a
 * one-tap button. If the API refuses the button, the fallback text is sent without one.
 */
async function privateReplyWithButton(
  contact: Contact,
  commentId: string,
  text: string,
  button: QuickReply,
  fallback: () => Promise<string>,
): Promise<void> {
  let body = text;
  let sent: { messageId?: string };
  try {
    sent = await sendInstagramPrivateReply(commentId, text, [button]);
  } catch (e) {
    if (!(e instanceof MetaApiError) || e.status >= 500) throw e;
    console.error('[concierge] private reply with button refused, retrying without', e);
    body = await fallback();
    sent = await sendInstagramPrivateReply(commentId, body);
  }
  await recordOutbound(contact.id, 'assistant', body, sent.messageId);
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
          const payload = message.quick_reply?.payload;
          if (text) {
            jobs.push(() =>
              handleCustomerMessage({
                channel: 'instagram',
                externalId: event.sender.id,
                metaMessageId: message.mid,
                text,
                offerId: payload?.startsWith(OFFER_PAYLOAD) ? payload.slice(OFFER_PAYLOAD.length) : undefined,
                storyId: message.reply_to?.story?.id,
              }),
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
        const v = change.value as {
          id: string;
          text?: string;
          from?: { id: string; username?: string };
          media?: { id: string };
        };
        if (v.text && v.from) {
          const comment = {
            commentId: v.id,
            text: v.text,
            fromId: v.from.id,
            accountId: String(entry.id),
            username: v.from.username,
            mediaId: v.media?.id,
          };
          jobs.push(() => handleInstagramComment(comment));
        }
      }
    }
  }

  return jobs;
}
