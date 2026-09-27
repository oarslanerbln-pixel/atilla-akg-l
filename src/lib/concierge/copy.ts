// Fixed server-side messages. The concierge writes everything else itself, in the customer's language.
// Customer copy exists in DE / EN / TR like the site; staff and guide copy is Turkish.
import type { Lang } from './config';

export interface ConfirmedBooking {
  ref: string;
  tourName: string;
  startsAt: string;
  guests: number;
  depositEur: number;
  balanceEur: number;
  meetingPoint: string | null;
  meetingPointUrl: string | null;
  guideName: string | null;
}

const customer = {
  // Public answers under a comment. Several variants so the thread doesn't look automated.
  publicCommentReply: {
    de: ['Hab dir eine DM geschickt ✨', 'Schau mal in deine Nachrichten 📩', 'Ist unterwegs – check deine DMs!', 'Danke dir! Details kommen per DM.', 'Gerne – ich hab dir privat geschrieben.', 'Infos sind in deinem Postfach 🙌'],
    en: ['Sent you a DM ✨', 'Check your messages 📩', 'On its way – check your DMs!', 'Thank you! Details are in your DMs.', 'Happy to help – I messaged you privately.', 'The info is in your inbox 🙌'],
    tr: ["DM'den yazdım ✨", 'Mesaj kutunuza bakın 📩', "Gönderildi – DM'lerinizi kontrol edin!", "Teşekkürler! Detaylar DM'de.", 'Memnuniyetle – size özelden yazdım.', 'Bilgiler gelen kutunuzda 🙌'],
  },
  // Quick-reply buttons: Instagram allows at most 20 characters.
  tourButton: { de: 'Touren ansehen', en: 'Show me the tours', tr: 'Turları göster' },
  offerButton: { de: 'Link schicken', en: 'Send me the link', tr: 'Linki gönder' },
  offerTeaser: {
    de: (pitch: string) => `${pitch}\n\nTipp unten auf den Button, dann schicke ich dir den Link.`,
    en: (pitch: string) => `${pitch}\n\nTap the button below and I'll send you the link.`,
    tr: (pitch: string) => `${pitch}\n\nAşağıdaki butona dokunun, linki hemen göndereyim.`,
  },
  // Advertising notice required for affiliate links (DE: § 5a UWG, TR: Reklam Kurulu).
  offerLink: {
    de: (name: string, url: string) =>
      `Hier ist dein Link zu ${name}:\n${url}\n\nAnzeige: Das ist ein Partnerlink. Buchst oder beantragst du darüber etwas, erhält Atilla eine Provision – für dich ändert sich nichts. Konditionen und Beratung gibt es direkt beim Anbieter.`,
    en: (name: string, url: string) =>
      `Here is your link to ${name}:\n${url}\n\nAd: this is a partner link. If you book or sign up through it, Atilla earns a commission at no extra cost to you. Terms and advice come directly from the provider.`,
    tr: (name: string, url: string) =>
      `${name} için linkiniz:\n${url}\n\nReklam: Bu bir iş ortaklığı (affiliate) linkidir. Bu link üzerinden rezervasyon ya da başvuru yaparsanız Atilla komisyon alır; sizin için hiçbir şey değişmez. Koşullar ve danışmanlık için doğrudan sağlayıcıya başvurun.`,
  },
  commentReply: {
    de: 'Danke für dein Interesse! ✨ Schreib mir hier einfach, welche Tour dich reizt, wann du reisen möchtest und mit wie vielen Personen – ich stelle dir alles zusammen.',
    en: 'Thank you for your interest! ✨ Just reply here with the tour you have in mind, your travel dates and how many of you are coming – I will put everything together for you.',
    tr: 'İlginiz için teşekkürler! ✨ Buradan hangi turla ilgilendiğinizi, seyahat tarihlerinizi ve kaç kişi olacağınızı yazmanız yeterli; her şeyi sizin için hazırlayayım.',
  },
  fallback: {
    de: 'Danke für deine Nachricht! Atilla meldet sich persönlich bei dir, so schnell es geht.',
    en: 'Thank you for your message! Atilla will get back to you personally as soon as possible.',
    tr: 'Mesajınız için teşekkürler! Atilla en kısa sürede size bizzat dönüş yapacak.',
  },
  confirmed: {
    de: (b: ConfirmedBooking) =>
      [
        `✅ *Buchung bestätigt* – Ref. ${b.ref}`,
        `${b.tourName}\n${b.startsAt} · ${b.guests} Pers.`,
        `Anzahlung erhalten: ${b.depositEur} €. Restbetrag vor Ort: ${b.balanceEur} €.`,
        b.meetingPoint ? `Treffpunkt: ${b.meetingPoint}${b.meetingPointUrl ? `\n${b.meetingPointUrl}` : ''}` : '',
        b.guideName ? `Dein Guide: ${b.guideName}. Die Kontaktdaten erhältst du 48 Stunden vor der Tour.` : '',
        'Wir freuen uns auf dich! 🌅',
      ],
    en: (b: ConfirmedBooking) =>
      [
        `✅ *Booking confirmed* – Ref. ${b.ref}`,
        `${b.tourName}\n${b.startsAt} · ${b.guests} guests`,
        `Deposit received: €${b.depositEur}. Balance due on the day: €${b.balanceEur}.`,
        b.meetingPoint ? `Meeting point: ${b.meetingPoint}${b.meetingPointUrl ? `\n${b.meetingPointUrl}` : ''}` : '',
        b.guideName ? `Your guide: ${b.guideName}. You will receive their contact details 48 hours before the tour.` : '',
        'We look forward to welcoming you! 🌅',
      ],
    tr: (b: ConfirmedBooking) =>
      [
        `✅ *Rezervasyonunuz onaylandı* – Ref. ${b.ref}`,
        `${b.tourName}\n${b.startsAt} · ${b.guests} kişi`,
        `Kapora alındı: ${b.depositEur} €. Kalan tutar tur günü: ${b.balanceEur} €.`,
        b.meetingPoint ? `Buluşma noktası: ${b.meetingPoint}${b.meetingPointUrl ? `\n${b.meetingPointUrl}` : ''}` : '',
        b.guideName ? `Rehberiniz: ${b.guideName}. İletişim bilgileri turdan 48 saat önce gönderilecek.` : '',
        'Sizi ağırlamak için sabırsızlanıyoruz! 🌅',
      ],
  },
};

export function commentReply(lang: Lang): string {
  return customer.commentReply[lang];
}

export function publicCommentReply(lang: Lang): string {
  const options = customer.publicCommentReply[lang];
  return options[Math.floor(Math.random() * options.length)];
}

export const tourButton = (lang: Lang) => customer.tourButton[lang];
export const offerButton = (lang: Lang) => customer.offerButton[lang];
export const offerTeaser = (lang: Lang, pitch: string) => customer.offerTeaser[lang](pitch);
export const offerLink = (lang: Lang, name: string, url: string) => customer.offerLink[lang](name, url);

export function fallbackReply(lang: Lang): string {
  return customer.fallback[lang];
}

export function bookingConfirmed(lang: Lang, booking: ConfirmedBooking): string {
  return customer.confirmed[lang](booking).filter(Boolean).join('\n\n');
}

/** Picks a customer language from free text before we know it (e.g. an Instagram comment). */
export function guessLang(text: string): Lang {
  if (/[çğışöü]|\b(merhaba|fiyat|tur|kaç|nasıl|ucus|lutfen)\b/i.test(text)) return 'tr';
  if (/[äß]|\b(reise|preis|hallo|wann|wie viel|bitte|danke|flug|platin)\b/i.test(text)) return 'de';
  return 'en';
}

export const staff = {
  handoff: (who: string, channel: string, reason: string, summary: string) =>
    `🔔 *Devir* – ${who} (${channel})\nSebep: ${reason}\n\n${summary}\n\n↩️ Bu mesajı *yanıtlayarak* müşteriye doğrudan yazabilirsin. Botu tekrar açmak için yanıtına sadece *bot* yaz.`,
  humanTookOver: (who: string) =>
    `ℹ️ ${who} ile Instagram'dan sen yazdığın için bot bu sohbette durduruldu. Tekrar açmak için bu mesajı *bot* diye yanıtla.`,
  relayed: '✓ İletildi. Bot bu müşteride kapalı; açmak için *bot* diye yanıtla.',
  botResumed: (who: string) => `🤖 Bot ${who} için tekrar aktif.`,
  help: 'Bir müşteriye yazmak için ilgili bildirim mesajını yanıtla (mesaja basılı tut → Yanıtla).',
  refusal: (who: string) => `⚠️ Bot ${who} ile sohbette cevap veremedi, sohbeti sana devrettim.`,
  bookingPaid: (who: string, b: ConfirmedBooking) =>
    `💶 *Kapora ödendi* – ${b.ref}\n${who}\n${b.tourName}\n${b.startsAt} · ${b.guests} kişi\nKapora ${b.depositEur} € · Kalan ${b.balanceEur} €${b.guideName ? `\nRehber: ${b.guideName}` : '\n⚠️ Rehber atanmadı!'}`,
  guideAssigned: (b: ConfirmedBooking, customerName: string) =>
    `🧭 *Yeni tur* – ${b.ref}\n${b.tourName}\n${b.startsAt}\n${b.guests} kişi · Misafir: ${customerName}\nBuluşma: ${b.meetingPoint ?? '-'}`,
  rateLimited: (who: string, count: number) =>
    `🛑 ${who} son bir saatte ${count} mesaj gönderdi. Olası spam veya kötüye kullanım nedeniyle bot bu sohbette durduruldu. Tekrar açmak için bu mesajı *bot* diye yanıtla.`,
  paymentMismatch: (ref: string, expected: string, received: string) =>
    `⚠️ *Ödeme kontrolü başarısız* – ${ref}\nBeklenen: ${expected}\nGelen: ${received}\nRezervasyon onaylanmadı. Lütfen Stripe panelinden kontrol et.`,
  instagramTokenFailed: (expiresOn: string | null, error: string) =>
    `⚠️ *Instagram token yenilenemedi.* ${expiresOn ? `Mevcut token ${expiresOn} tarihinde sona eriyor` : 'Mevcut token en geç 60 gün içinde sona eriyor'}; sonra bot Instagram'da cevap veremez.\nMeta'da yeni token üretip Vercel'de INSTAGRAM_ACCESS_TOKEN'a yapıştır ve yeniden deploy et (docs/concierge-setup.md, 4. Instagram).\nHata: ${error}`,
};
