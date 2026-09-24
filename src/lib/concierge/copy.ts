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

export function fallbackReply(lang: Lang): string {
  return customer.fallback[lang];
}

export function bookingConfirmed(lang: Lang, booking: ConfirmedBooking): string {
  return customer.confirmed[lang](booking).filter(Boolean).join('\n\n');
}

/** Picks a customer language from free text before we know it (e.g. an Instagram comment). */
export function guessLang(text: string): Lang {
  if (/[çğışöü]|\b(merhaba|fiyat|tur|kaç|nasıl)\b/i.test(text)) return 'tr';
  if (/[äß]|\b(reise|preis|hallo|wann|wie viel)\b/i.test(text)) return 'de';
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
};
