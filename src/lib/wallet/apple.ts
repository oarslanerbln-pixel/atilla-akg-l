import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PKPass } from "passkit-generator";
import { translations, type Language } from "@/i18n/translations";
import { LANGUAGES, HTML_LANG } from "@/lib/locales";
import { WALLET_NAME, readPem, walletFacts, walletQrUrl } from "./content";
import { APPLE_ENV, appleWalletReady } from "./ready";

/**
 * The Apple Wallet pass (.pkpass): a generic pass in the card's colours, the
 * lockup top left, the portrait as thumbnail, WhatsApp, Instagram and the
 * website on the front, every link on the back, and a QR code that opens
 * the website.
 *
 * Apple only installs a pass signed with a Pass Type ID certificate from an
 * Apple Developer account, so nothing here works until the five variables
 * in ready.ts are set (docs/wallet-setup.md). Until then `appleWalletReady()` is
 * false, the card shows no Wallet button for Apple devices and the route
 * answers 503: it never hands out a file a phone would refuse.
 *
 * Labels are English in pass.json and translated in de.lproj and tr.lproj,
 * so Wallet shows them in the phone's language, and in English on a phone
 * set to any other.
 */

const ENV = APPLE_ENV;
const PASSPHRASE = "APPLE_WALLET_SIGNER_KEY_PASSPHRASE";

export { appleWalletReady };

const IMAGES = ["icon", "logo", "thumbnail"].flatMap((name) =>
  ["", "@2x", "@3x"].map((scale) => `${name}${scale}.png`),
);

/** Same colours as the card's front: ink ground, porcelain type, gold labels. */
const COLOURS = {
  backgroundColor: "rgb(20, 15, 10)",
  foregroundColor: "rgb(252, 251, 249)",
  labelColor: "rgb(216, 180, 130)",
};

/** Escapes a string for an Apple .strings file. */
const strings = (map: Record<string, string>) =>
  Object.fromEntries(Object.entries(map).map(([key, value]) => [key, value.replace(/"/g, '\\"')]));

export async function applePass(lang: Language): Promise<Buffer> {
  const env = (name: string) => process.env[name] as string;
  const base = walletFacts("EN");
  const facts = walletFacts(lang);

  const files = Object.fromEntries(
    await Promise.all(
      IMAGES.map(async (name) => [name, await readFile(join(process.cwd(), "src/assets/wallet", name))] as const),
    ),
  );

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: env(ENV.passTypeId),
    teamIdentifier: env(ENV.teamId),
    serialNumber: "atilla-barbarossa-card-1",
    organizationName: WALLET_NAME,
    description: base.description,
    ...COLOURS,
    generic: {
      primaryFields: [{ key: "name", label: base.role, value: WALLET_NAME }],
      secondaryFields: [{ key: "whatsapp", label: base.labels.whatsapp, value: facts.whatsapp.display }],
      auxiliaryFields: [
        { key: "instagram", label: base.labels.instagram, value: facts.instagram.display },
        { key: "website", label: base.labels.website, value: facts.website.display },
      ],
      backFields: [
        { key: "back-whatsapp", label: base.labels.whatsapp, value: facts.whatsapp.display, dataDetectorTypes: ["PKDataDetectorTypePhoneNumber"] },
        {
          key: "back-website",
          label: base.labels.website,
          value: facts.website.href,
          attributedValue: `<a href="${facts.website.href}">${facts.website.display}</a>`,
        },
        {
          key: "back-instagram",
          label: base.labels.instagram,
          value: facts.instagram.href,
          attributedValue: `<a href="${facts.instagram.href}">${facts.instagram.display}</a>`,
        },
        { key: "back-tiktok", label: "TikTok", value: facts.tiktok, attributedValue: `<a href="${facts.tiktok}">TikTok</a>` },
        { key: "back-youtube", label: "YouTube", value: facts.youtube, attributedValue: `<a href="${facts.youtube}">YouTube</a>` },
        { key: "back-email", label: base.labels.email, value: facts.email, attributedValue: `<a href="mailto:${facts.email}">${facts.email}</a>` },
        { key: "back-card", label: base.labels.card, value: facts.cardUrl, attributedValue: `<a href="${facts.cardUrl}">${facts.cardUrl.replace(/^https:\/\//, "")}</a>` },
        { key: "back-base", value: base.cities },
      ],
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: walletQrUrl(lang),
        messageEncoding: "iso-8859-1",
        altText: facts.website.display,
      },
    ],
  };

  const pass = new PKPass(
    { ...files, "pass.json": Buffer.from(JSON.stringify(passJson)) },
    {
      wwdr: readPem(env(ENV.wwdr)),
      signerCert: readPem(env(ENV.signerCert)),
      signerKey: readPem(env(ENV.signerKey)),
      signerKeyPassphrase: process.env[PASSPHRASE] || undefined,
    },
  );

  // The English strings above are the keys; the other languages translate them.
  for (const other of LANGUAGES.filter((l) => l !== "EN")) {
    const t = walletFacts(other);
    pass.localize(
      HTML_LANG[other],
      strings({
        [base.description]: t.description,
        [base.role]: t.role,
        [base.cities]: t.cities,
        [base.labels.website]: t.labels.website,
        [base.labels.email]: t.labels.email,
        [base.labels.card]: t.labels.card,
      }),
    );
  }
  // English gets a file too, so Wallet counts it among the pass's languages.
  pass.localize("en", strings({ [base.role]: translations.EN.mk_about_role }));

  return pass.getAsBuffer();
}
