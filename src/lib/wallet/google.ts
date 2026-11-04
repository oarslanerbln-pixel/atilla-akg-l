import "server-only";
import { createSign, randomUUID } from "node:crypto";
import type { Language } from "@/i18n/translations";
import { HTML_LANG } from "@/lib/locales";
import { siteUrl } from "@/lib/site";
import { CARD_COLORS, CARD_NAME, CARD_ORGANIZATION, cardContact, cardCopy, cardUrl, websiteHost } from "./card";

/**
 * The business card as a Google Wallet generic pass. Google takes the whole
 * pass inside a JWT signed with a service account of the Wallet issuer
 * account, and creates it when the visitor taps "Save": no API call from
 * here, no state kept. Without the two values below the endpoint answers 503
 * and the card page leaves the button out.
 *
 * Setup: docs/wallet-setup.md.
 */

type ServiceAccount = { client_email: string; private_key: string };

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const parsed = JSON.parse(json) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) throw new Error("GOOGLE_WALLET_SERVICE_ACCOUNT lacks client_email or private_key");
  return { client_email: parsed.client_email, private_key: parsed.private_key };
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");

function localized(lang: Language, value: string) {
  return { defaultValue: { language: HTML_LANG[lang], value } };
}

function genericObject(issuerId: string, lang: Language) {
  const { role, labels } = cardCopy(lang);
  const url = cardUrl(lang);
  return {
    // Google keeps one object per save, so each tap gets its own id.
    id: `${issuerId}.card-${randomUUID()}`,
    classId: `${issuerId}.business-card`,
    state: "ACTIVE",
    cardTitle: localized(lang, CARD_ORGANIZATION),
    header: localized(lang, CARD_NAME),
    subheader: localized(lang, role),
    logo: {
      sourceUri: { uri: new URL("/wallet/google-logo.png", siteUrl).href },
      contentDescription: localized(lang, CARD_NAME),
    },
    hexBackgroundColor: CARD_COLORS.background,
    barcode: { type: "QR_CODE", value: url, alternateText: websiteHost() },
    textModulesData: [
      { id: "phone", header: labels.phone, body: cardContact.phoneDisplay },
      { id: "email", header: labels.email, body: cardContact.email },
      { id: "management", header: labels.management, body: cardContact.management },
    ],
    linksModuleData: {
      uris: [
        { id: "website", uri: url, description: websiteHost() },
        { id: "email", uri: `mailto:${cardContact.email}`, description: labels.email },
        { id: "phone", uri: `tel:${cardContact.phone}`, description: labels.phone },
        { id: "instagram", uri: cardContact.instagram, description: labels.instagram },
        { id: "tiktok", uri: cardContact.tiktok, description: labels.tiktok },
        { id: "youtube", uri: cardContact.youtube, description: labels.youtube },
      ],
    },
  };
}

/** The "Save to Google Wallet" link, or null when the issuer is not configured. */
export function googleSaveUrl(lang: Language): string | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID?.trim();
  const account = serviceAccount();
  if (!issuerId || !account) return null;

  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: account.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [new URL(siteUrl).origin],
    payload: {
      genericClasses: [{ id: `${issuerId}.business-card` }],
      genericObjects: [genericObject(issuerId, lang)],
    },
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  return `https://pay.google.com/gp/v/save/${unsigned}.${base64url(signature)}`;
}
