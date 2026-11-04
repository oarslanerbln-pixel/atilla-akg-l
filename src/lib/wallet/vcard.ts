import type { Language } from "@/i18n/translations";
import { CARD_NAME, CARD_ORGANIZATION, cardContact, cardCopy } from "./card";

/**
 * The card as a vCard 3.0, the format every phone's contacts app imports.
 * It works without any Wallet account, so the card page always offers it.
 */

/** Escape a value for a vCard text field (RFC 6350 §3.4). */
function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** Fold lines longer than 75 octets, as the format asks. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (parts.length ? 74 : 75), bytes.length);
    // Never cut a multi-byte character in half.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
  }
  return parts.join("\r\n ");
}

export function buildVCard(lang: Language): string {
  const { role } = cardCopy(lang);
  const [given, ...rest] = CARD_NAME.split(" ");
  const family = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(family)};${escape(given)};;;`,
    `FN:${escape(CARD_NAME)}`,
    `NICKNAME:${escape("Atilla Akgül")}`,
    `ORG:${escape(CARD_ORGANIZATION)}`,
    `TITLE:${escape(role)}`,
    `EMAIL;TYPE=INTERNET,WORK:${cardContact.email}`,
    `TEL;TYPE=CELL,VOICE:${cardContact.phone}`,
    `URL:${cardContact.website}`,
    `X-SOCIALPROFILE;TYPE=instagram:${cardContact.instagram}`,
    `X-SOCIALPROFILE;TYPE=tiktok:${cardContact.tiktok}`,
    `X-SOCIALPROFILE;TYPE=youtube:${cardContact.youtube}`,
    "END:VCARD",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
