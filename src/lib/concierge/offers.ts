import 'server-only';
import { randomBytes } from 'node:crypto';
import { env, type Lang } from './config';
import { db, type Contact } from './db';
import { getInstagramMedia, sendToContact } from './meta';
import { offerLink } from './copy';

// Partner (affiliate) offers such as American Express cards. Links go out as SITE_URL/go/<click id>,
// so every click is counted per reel and the click id reaches the network as sub id.

export interface Offer {
  id: string;
  network: string;
  name: Record<Lang, string>;
  pitch: Record<Lang, string>;
  keywords: string[];
}

const CLICK_ID = /^[A-Za-z0-9_-]{16}$/;
/** Quick-reply payload prefix for "send me the link" buttons. */
export const OFFER_PAYLOAD = 'OFFER:';

export async function activeOffers(): Promise<Offer[]> {
  const { data, error } = await db().from('affiliate_offers').select('id, network, name, pitch, keywords').eq('active', true);
  if (error) throw new Error(`activeOffers: ${error.message}`);
  return data as Offer[];
}

export async function getOffer(id: string): Promise<Offer | null> {
  const { data } = await db()
    .from('affiliate_offers')
    .select('id, network, name, pitch, keywords')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle();
  return (data as Offer | null) ?? null;
}

/** The offer whose keyword appears in a comment, if any. Offers win over the tour keywords. */
export function offerForWords(words: string[], offers: Offer[]): Offer | undefined {
  return offers.find((o) => o.keywords.some((k) => words.includes(k.toLowerCase())));
}

/** A personal, countable link for this contact. */
export async function createOfferLink(offer: Offer, contact: Contact): Promise<string> {
  const id = randomBytes(12).toString('base64url');
  const { error } = await db()
    .from('affiliate_clicks')
    .insert({ id, offer_id: offer.id, contact_id: contact.id, source_media_id: contact.source_media_id });
  if (error) throw new Error(`createOfferLink: ${error.message}`);
  return `${env('SITE_URL')}/go/${id}`;
}

/** The customer tapped "send me the link" (or asked the concierge): a fresh tracked link. */
export async function sendOfferLink(contact: Contact, offerId: string): Promise<boolean> {
  const offer = await getOffer(offerId);
  if (!offer) return false;
  const lang = contact.language ?? 'en';
  await sendToContact(contact, offerLink(lang, offer.name[lang], await createOfferLink(offer, contact)));
  return true;
}

/** Counts the click and returns the network's tracking URL; null for unknown or paused offers. */
export async function resolveOfferClick(id: string): Promise<string | null> {
  if (!CLICK_ID.test(id)) return null;
  const { data, error } = await db().rpc('register_affiliate_click', { p_id: id });
  if (error) throw new Error(`resolveOfferClick: ${error.message}`);
  return typeof data === 'string' && data.startsWith('https://') ? data : null;
}

/** Stores a post or reel the first time it brings in a comment, with its link for the dashboard. */
export async function rememberMedia(mediaId: string): Promise<void> {
  const { count } = await db().from('instagram_media').select('id', { count: 'exact', head: true }).eq('id', mediaId);
  if (count) return;
  const media = await getInstagramMedia(mediaId).catch((e) => {
    console.error('[concierge] media lookup failed', e);
    return {} as { permalink?: string; caption?: string };
  });
  await db()
    .from('instagram_media')
    .upsert({ id: mediaId, permalink: media.permalink ?? null, caption: media.caption ?? null }, { ignoreDuplicates: true });
}
