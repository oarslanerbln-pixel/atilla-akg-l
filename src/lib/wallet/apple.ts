import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import forge from "node-forge";
import type { Language } from "@/i18n/translations";
import { HTML_LANG } from "@/lib/locales";
import { CARD_COLORS, CARD_NAME, CARD_ORGANIZATION, cardContact, cardCopy, cardUrl, websiteHost } from "./card";
import { appleWalletConfigured } from "./config";
import { zip } from "./zip";

/**
 * The business card as an Apple Wallet pass (.pkpass): pass.json, the images
 * from public/wallet (written by `npm run wallet`), a manifest of their SHA-1
 * hashes, and a detached PKCS#7 signature of that manifest made with the
 * Pass Type ID certificate. Wallet refuses a pass whose signature does not
 * chain to Apple's WWDR certificate, so without the four values below the
 * endpoint answers 503 and the card page leaves the button out.
 *
 * Setup: docs/wallet-setup.md.
 */

type AppleConfig = {
  passTypeId: string;
  teamId: string;
  certificate: forge.pki.Certificate;
  key: forge.pki.rsa.PrivateKey;
  wwdr: forge.pki.Certificate;
};

/** A PEM from the environment: either the PEM itself or its base64. */
function pem(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("-----BEGIN")) return trimmed.replace(/\\n/g, "\n");
  return Buffer.from(trimmed, "base64").toString("utf8");
}

function appleConfig(): AppleConfig | null {
  if (!appleWalletConfigured()) return null;
  const passphrase = process.env.APPLE_PASS_KEY_PASSPHRASE;
  const keyPem = pem(process.env.APPLE_PASS_KEY!);
  const key = passphrase ? forge.pki.decryptRsaPrivateKey(keyPem, passphrase) : forge.pki.privateKeyFromPem(keyPem);
  if (!key) throw new Error("APPLE_PASS_KEY could not be read (wrong passphrase?)");
  return {
    passTypeId: process.env.APPLE_PASS_TYPE_ID!,
    teamId: process.env.APPLE_TEAM_ID!,
    certificate: forge.pki.certificateFromPem(pem(process.env.APPLE_PASS_CERT!)),
    // Pass certificates are RSA; Apple issues no other kind for Wallet.
    key: key as forge.pki.rsa.PrivateKey,
    wwdr: forge.pki.certificateFromPem(pem(process.env.APPLE_WWDR_CERT!)),
  };
}

/** "#140f0a" → "rgb(20, 15, 10)", the form pass.json asks for. */
function rgb(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function passJson(config: AppleConfig, lang: Language) {
  const { role, description, labels } = cardCopy(lang);
  const url = cardUrl(lang);
  const link = (href: string, text: string) => `<a href="${href}">${text}</a>`;
  const handle = (href: string) => `@${new URL(href).pathname.replace(/^\/@?/, "").replace(/\/$/, "")}`;

  return {
    formatVersion: 1,
    passTypeIdentifier: config.passTypeId,
    teamIdentifier: config.teamId,
    // One pass per language: adding it again replaces it instead of piling up copies.
    serialNumber: `business-card-${HTML_LANG[lang]}`,
    organizationName: CARD_NAME,
    description,
    logoText: CARD_ORGANIZATION,
    backgroundColor: rgb(CARD_COLORS.background),
    foregroundColor: rgb(CARD_COLORS.foreground),
    labelColor: rgb(CARD_COLORS.label),
    sharingProhibited: false,
    barcodes: [{ format: "PKBarcodeFormatQR", message: url, messageEncoding: "iso-8859-1", altText: websiteHost() }],
    generic: {
      primaryFields: [{ key: "name", label: role.toLocaleUpperCase(HTML_LANG[lang]), value: CARD_NAME }],
      secondaryFields: [{ key: "phone", label: labels.phone, value: cardContact.phoneDisplay }],
      auxiliaryFields: [{ key: "email", label: labels.email, value: cardContact.email }],
      backFields: [
        { key: "website", label: labels.website, value: url, attributedValue: link(url, websiteHost()) },
        { key: "email-back", label: labels.email, value: cardContact.email },
        { key: "phone-back", label: labels.phone, value: cardContact.phoneDisplay },
        { key: "management", label: labels.management, value: cardContact.management },
        { key: "instagram", label: labels.instagram, value: cardContact.instagram, attributedValue: link(cardContact.instagram, handle(cardContact.instagram)) },
        { key: "tiktok", label: labels.tiktok, value: cardContact.tiktok, attributedValue: link(cardContact.tiktok, handle(cardContact.tiktok)) },
        { key: "youtube", label: labels.youtube, value: cardContact.youtube, attributedValue: link(cardContact.youtube, handle(cardContact.youtube)) },
      ],
    },
  };
}

const IMAGES = [
  "icon.png",
  "icon@2x.png",
  "icon@3x.png",
  "logo.png",
  "logo@2x.png",
  "logo@3x.png",
  "thumbnail.png",
  "thumbnail@2x.png",
  "thumbnail@3x.png",
];

function sign(manifest: Buffer, config: AppleConfig): Buffer {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifest.toString("binary"));
  p7.addCertificate(config.certificate);
  p7.addCertificate(config.wwdr);
  p7.addSigner({
    key: config.key,
    certificate: config.certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date().toISOString() },
    ],
  });
  p7.sign({ detached: true });
  return Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), "binary");
}

/** The signed .pkpass, or null when the certificates are not configured. */
export async function buildApplePass(lang: Language): Promise<Buffer | null> {
  const config = appleConfig();
  if (!config) return null;

  const dir = join(process.cwd(), "public", "wallet");
  const files: Record<string, Buffer> = {
    "pass.json": Buffer.from(JSON.stringify(passJson(config, lang))),
  };
  for (const name of IMAGES) files[name] = await readFile(join(dir, name));

  const manifest = Buffer.from(
    JSON.stringify(Object.fromEntries(Object.entries(files).map(([name, data]) => [name, createHash("sha1").update(data).digest("hex")]))),
  );

  return zip([
    ...Object.entries(files).map(([name, data]) => ({ name, data })),
    { name: "manifest.json", data: manifest },
    { name: "signature", data: sign(manifest, config) },
  ]);
}
