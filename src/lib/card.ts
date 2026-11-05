import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import QRCode from "qrcode";
import type { Language } from "@/i18n/translations";
import { LANGUAGES, pagePath } from "@/lib/locales";
import { businessCard, contact, siteUrl, socialProfiles } from "@/lib/site";
import { QR_TARGETS, packModules, type CardCodes, type QrTarget } from "@/components/card/qr";

/**
 * The digital business card's server side: what each QR code opens, the
 * codes themselves, and the contact file (/atilla-barbarossa.vcf).
 */

const absolute = (path: string) => new URL(path, siteUrl).href;

/** Where each code on the card leads, in a language. */
export function cardTargets(lang: Language): Record<QrTarget, string> {
  return {
    card: absolute(pagePath("card", lang)),
    // No prefilled text: it would double the code's density for one sentence.
    whatsapp: `https://wa.me/${businessCard.whatsapp}`,
    instagram: socialProfiles.instagram,
    web: absolute(pagePath("home", lang)),
    mediaKit: absolute(pagePath("mediaKit", lang)),
    businessCard: absolute(pagePath("cardBusiness", lang)),
    contact: contactQrText(),
    contactPage: absolute(pagePath("contact", lang)),
  };
}

/**
 * The contact itself, as a QR code holds it: scanned with a phone's camera it
 * offers "Add to contacts" straight away, offline, without opening the site.
 * The short form of the contact file below (no portrait, which no QR code
 * could carry), kept to what fits a code a phone reads from a screen.
 */
export function contactQrText(): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Barbarossa;Atilla",
    "FN:Atilla Barbarossa",
    `TEL;TYPE=CELL:+${businessCard.whatsapp}`,
    `EMAIL:${contact.email}`,
    `URL:${absolute("/")}`,
    "END:VCARD",
  ].join("\n");
}

const encode = (text: string, version?: number) =>
  QRCode.create(text, { errorCorrectionLevel: "H", ...(version ? { version } : {}) });

/**
 * The contact code carries several times an address's text, so it has its
 * own grid, at level M: a level-H code of it would be too fine to read off a
 * phone screen. M still restores the 3 % the brand mark covers.
 */
const encodeContact = (text: string) => QRCode.create(text, { errorCorrectionLevel: "M" });

/**
 * Every code the card can show, in every language, all at the version the
 * longest address needs. The grid then stays the same size when the visitor
 * switches between them, and only the dots change.
 */
export function cardCodes(): CardCodes {
  const targets = Object.fromEntries(LANGUAGES.map((lang) => [lang, cardTargets(lang)])) as Record<
    Language,
    Record<QrTarget, string>
  >;
  const addresses = QR_TARGETS.filter((target) => target !== "contact");
  const version = Math.max(
    ...LANGUAGES.flatMap((lang) => addresses.map((target) => encode(targets[lang][target]).version)),
  );

  return Object.fromEntries(
    LANGUAGES.map((lang) => [
      lang,
      Object.fromEntries(
        QR_TARGETS.map((target) => {
          const url = targets[lang][target];
          const { modules } = target === "contact" ? encodeContact(url) : encode(url, version);
          return [target, { url, matrix: { size: modules.size, hex: packModules(modules.data) } }];
        }),
      ),
    ]),
  ) as CardCodes;
}

/* ---------- The contact file ---------- */

/** vCard 3.0 text escaping: backslash, comma, semicolon, newline. */
const text = (value: string) => value.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** Lines longer than 75 octets continue on the next line after a space (RFC 2425). All lines here are ASCII. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(` ${line.slice(i, i + 74)}`);
  return parts.join("\r\n");
}

/**
 * The card's contact, as a phone saves it: name, role, the card's WhatsApp
 * number, the mail address, the website, the three profiles and a portrait.
 * vCard 3.0, which iOS, Android and Outlook all read; the role is the one the
 * portfolio uses in every language.
 */
export async function businessVCard(): Promise<string> {
  const photo = await readFile(join(process.cwd(), "src/assets/card/portrait.jpg"));

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${text("Barbarossa")};${text("Atilla")};;;`,
    `FN:${text("Atilla Barbarossa")}`,
    `TITLE:${text("Creative Director & Filmmaker")}`,
    `TEL;TYPE=CELL,VOICE,pref:+${businessCard.whatsapp}`,
    `EMAIL;TYPE=INTERNET,WORK,pref:${contact.email}`,
    // The management address, labelled as such in Apple's and Google's contacts.
    `item1.EMAIL;TYPE=INTERNET:${contact.management}`,
    "item1.X-ABLabel:Management",
    `URL:${absolute("/")}`,
    `X-SOCIALPROFILE;TYPE=instagram:${socialProfiles.instagram}`,
    `X-SOCIALPROFILE;TYPE=tiktok:${socialProfiles.tiktok}`,
    `X-SOCIALPROFILE;TYPE=youtube:${socialProfiles.youtube}`,
    "ADR;TYPE=WORK:;;;Berlin;;;Germany",
    `PHOTO;ENCODING=b;TYPE=JPEG:${photo.toString("base64")}`,
    "END:VCARD",
  ];

  return lines.map(fold).join("\r\n") + "\r\n";
}
