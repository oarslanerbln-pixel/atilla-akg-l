import "server-only";
import { createSign } from "node:crypto";
import { HTML_LANG } from "@/lib/locales";
import { siteUrl } from "@/lib/site";
import type { Language } from "@/i18n/translations";
import { WALLET_NAME, readPem, walletFacts, walletQrUrl } from "./content";
import { GOOGLE_ENV, googleWalletReady } from "./ready";

/**
 * Google Wallet: a "Save to Google Wallet" link carrying a signed JWT that
 * holds the whole pass (a generic class and object), so Google creates it
 * when the visitor saves it and no API call is made from here.
 *
 * Needs an issuer account in the Google Pay & Wallet Console and a service
 * account key (docs/wallet-setup.md). Until the three variables in ready.ts are set,
 * `googleWalletReady()` is false, the card shows no Wallet button for
 * Android and the route answers 503.
 *
 * Google fetches the logo and the hero image from this site
 * (public/wallet/), on its own servers, when the pass is saved.
 */

const ENV = GOOGLE_ENV;

export { googleWalletReady };

/** Bump to publish changed content: Google keeps an object it already has. */
const VERSION = 1;

const base64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");
const text = (language: string, value: string) => ({ defaultValue: { language, value } });

export function googleSaveUrl(lang: Language): string {
  const env = (name: string) => process.env[name] as string;
  const issuer = env(ENV.issuerId);
  const facts = walletFacts(lang);
  const language = HTML_LANG[lang];
  const classId = `${issuer}.atilla_barbarossa_card`;
  const image = (path: string, description: string) => ({
    sourceUri: { uri: new URL(path, siteUrl).href },
    contentDescription: text(language, description),
  });

  const object = {
    id: `${issuer}.atilla_barbarossa_card_v${VERSION}_${language}`,
    classId,
    state: "ACTIVE",
    hexBackgroundColor: "#140f0a",
    logo: image("/wallet/google-logo.png", WALLET_NAME),
    cardTitle: text(language, WALLET_NAME),
    subheader: text(language, facts.role),
    header: text(language, WALLET_NAME),
    heroImage: image("/wallet/google-hero.jpg", WALLET_NAME),
    barcode: { type: "QR_CODE", value: walletQrUrl(lang), alternateText: facts.website.display },
    textModulesData: [
      { id: "whatsapp", header: facts.labels.whatsapp, body: facts.whatsapp.display },
      { id: "instagram", header: facts.labels.instagram, body: facts.instagram.display },
      { id: "website", header: facts.labels.website, body: facts.website.display },
    ],
    linksModuleData: {
      uris: [
        { id: "whatsapp", uri: facts.whatsapp.href, description: facts.labels.whatsapp },
        { id: "phone", uri: facts.whatsapp.tel, description: facts.whatsapp.display },
        { id: "instagram", uri: facts.instagram.href, description: facts.labels.instagram },
        { id: "website", uri: facts.website.href, description: facts.website.display },
        { id: "email", uri: `mailto:${facts.email}`, description: facts.email },
      ],
    },
  };

  const claims = {
    iss: env(ENV.serviceAccountEmail),
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [new URL(siteUrl).origin],
    payload: { genericClasses: [{ id: classId }], genericObjects: [object] },
  };

  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(readPem(env(ENV.privateKey)));
  return `https://pay.google.com/gp/v/save/${unsigned}.${base64url(signature)}`;
}
