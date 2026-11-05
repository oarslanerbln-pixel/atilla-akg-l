import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { translations, type Language } from "@/i18n/translations";
import { HTML_LANG } from "@/lib/locales";
import { SITE_NAME, localizedMetadata } from "@/lib/metadata";
import { cardCodes } from "@/lib/card";
import { BASE, formatCoords } from "@/lib/partners";
import { businessCard, contact } from "@/lib/site";
import { prettyUrl, qrSvg, type CardMode } from "./qr";

/**
 * What a link to /card shows before it is opened, in each language. The card
 * is sent by WhatsApp and handed over in person, so the preview is the card
 * itself: both faces, the portrait front over the QR back.
 *
 * The page is a handout, not a page to rank: it says noindex (and, as
 * CLAUDE.md asks, is not blocked in robots.ts, so the noindex is read), and
 * it is not in the sitemap.
 */
export function cardMetadata(lang: Language, mode: CardMode = "personal"): Metadata {
  const t = translations[lang];
  const business = mode === "business";
  return {
    ...localizedMetadata({
      page: business ? "cardBusiness" : "card",
      lang,
      title: `${business ? t.card_business_meta_title : t.card_meta_title} | ${SITE_NAME}`,
      description: business ? t.card_business_meta_description : t.card_meta_description,
    }),
    robots: { index: false, follow: true },
    // Added to a phone's home screen, the card opens full screen, like an app,
    // ready to be shown across a table.
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  };
}

export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_CONTENT_TYPE = "image/png";

export const cardAlt = (lang: Language, mode: CardMode = "personal") =>
  `${mode === "business" ? translations[lang].card_business_meta_title : translations[lang].card_meta_title} · ${SITE_NAME}`;

// next/og cannot read the site's custom properties; these are their values
// (src/app/globals.css).
const PAPER = "#fcfbf9";
const PORCELAIN = "#f4f1ea";
const WHITE = "#ffffff";
const INK = "#140f0a";
const TEXT = "#181512";
const MUTED = "#5a524a";
const ON_INK_MUTED = "rgba(252, 251, 249, 0.75)";
const GOLD = "#b38b59";
const GOLD_LIGHT = "#d8b482";
const GOLD_DARK = "#825b29";
const GOLD_READABLE = "#7c5423";
const TEAL = "#38787b";
const HAIRLINE = "rgba(24, 21, 18, 0.12)";

const font = (subset: "latin" | "latin-ext", weight: number) =>
  readFile(join(process.cwd(), `src/assets/fonts/inter-tight-${subset}-${weight}-normal.woff`));

const WEIGHTS = [300, 400] as const;

const dataUri = (type: string, data: Buffer | string) =>
  `data:${type};base64,${(typeof data === "string" ? Buffer.from(data) : data).toString("base64")}`;

/** Card faces in the preview: ISO ID-1, upright. */
const FACE = { width: 280, height: 444 };

export async function cardPreview(lang: Language, mode: CardMode = "personal") {
  const t = translations[lang];
  const business = mode === "business";
  const upper = (text: string) => text.toLocaleUpperCase(HTML_LANG[lang]);
  const codes = cardCodes()[lang];
  // The back shows the code each face opens with: the website, or the contact.
  const code = business ? codes.contact : codes.web;

  const [latin, latinExt, photo, lockup] = await Promise.all([
    Promise.all(WEIGHTS.map((weight) => font("latin", weight))),
    Promise.all(WEIGHTS.map((weight) => font("latin-ext", weight))),
    readFile(join(process.cwd(), "src/assets/card/og-photo.jpg")),
    readFile(join(process.cwd(), "public/brand/logo-horizontal-reverse.svg")),
  ]);
  const qr = dataUri(
    "image/svg+xml",
    qrSvg(code.matrix, { ink: TEXT, pupil: GOLD_DARK, paper: WHITE, teal: TEAL, sun: GOLD }),
  );

  const rows = business
    ? [
        { label: t.card_qr_mediakit, value: prettyUrl(codes.mediaKit.url) },
        { label: t.card_management, value: contact.management },
        { label: t.card_qr_whatsapp, value: businessCard.whatsappDisplay },
      ]
    : [
        { label: t.card_qr_whatsapp, value: businessCard.whatsappDisplay },
        { label: t.card_qr_instagram, value: businessCard.instagramHandle },
        { label: t.card_qr_web, value: prettyUrl(new URL(codes.web.url).origin) },
      ];
  const rowSize = business ? 22 : 26;

  const caps = { fontSize: 13, letterSpacing: 3, fontWeight: 400 } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 72px 0 64px",
          backgroundImage: `radial-gradient(circle at 26% 50%, ${WHITE} 0%, ${PAPER} 42%, ${PORCELAIN} 100%)`,
          color: TEXT,
          fontFamily: "Inter Tight",
        }}
      >
        {/* The two faces, the back leaning out from behind the front. */}
        <div style={{ display: "flex", position: "relative", width: 470, height: 540 }}>
          <div
            style={{
              position: "absolute",
              left: 172,
              top: 34,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: FACE.width,
              height: FACE.height,
              padding: "34px 30px",
              background: WHITE,
              border: `1px solid ${HAIRLINE}`,
              boxShadow: "0 30px 60px -28px rgba(20, 15, 10, 0.45)",
              transform: "rotate(7deg)",
            }}
          >
            <div style={{ display: "flex", ...caps, fontSize: 11, color: GOLD_READABLE }}>
              {upper(t.card_scan)}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og into the PNG, never sent to a browser */}
            <img src={qr} width={206} height={206} alt="" style={{ marginTop: 34 }} />
            <div style={{ display: "flex", marginTop: 26, fontSize: 24, fontWeight: 300 }}>{business ? t.card_qr_contact : t.card_qr_web}</div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 14, color: MUTED }}>
              {prettyUrl(code.url)}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 18,
              top: 52,
              display: "flex",
              flexDirection: "column",
              width: FACE.width,
              height: FACE.height,
              background: INK,
              boxShadow: "0 40px 70px -30px rgba(20, 15, 10, 0.6)",
              transform: "rotate(-4deg)",
            }}
          >
            <div style={{ display: "flex", position: "relative", width: FACE.width, height: 252 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og into the PNG, never sent to a browser */}
              <img src={dataUri("image/jpeg", photo)} width={FACE.width} height={252} alt="" />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: FACE.width,
                  height: 252,
                  display: "flex",
                  backgroundImage: `linear-gradient(to top, ${INK} 0%, rgba(20, 15, 10, 0.7) 22%, rgba(20, 15, 10, 0) 55%)`,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
              {/* The outlined lockup's viewBox is 495.08 × 76.9. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og into the PNG, never sent to a browser */}
              <img src={dataUri("image/svg+xml", lockup)} width={224} height={35} alt="" />
              <div style={{ display: "flex", marginTop: 18, fontSize: 15, fontWeight: 300, color: ON_INK_MUTED }}>
                {translations[lang].mk_about_role}
              </div>
              <div style={{ display: "flex", marginTop: 10, ...caps, fontSize: 10, color: GOLD_LIGHT }}>
                {upper(t.card_cities)}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 36,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: ON_INK_MUTED,
                }}
              >
                {formatCoords(BASE)}
              </div>
            </div>
            <div
              // next/og has no `inset`; the four sides are spelled out.
              style={{
                position: "absolute",
                top: 9,
                left: 9,
                width: FACE.width - 18,
                height: FACE.height - 18,
                display: "flex",
                border: "1px solid rgba(179, 139, 89, 0.4)",
              }}
            />
          </div>
        </div>

        {/* Who, and how to reach him. */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: 56 }}>
          <div style={{ display: "flex", ...caps, fontSize: 16, letterSpacing: 5, color: GOLD_READABLE }}>
            {upper(business ? t.card_business_eyebrow : t.card_eyebrow)}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 68, fontWeight: 300, letterSpacing: -2.5, lineHeight: 1 }}>
            Atilla Barbarossa
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 26, fontWeight: 300, color: MUTED }}>
            {t.mk_about_role}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, borderTop: `1px solid ${HAIRLINE}` }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}
              >
                <div style={{ display: "flex", ...caps, color: MUTED }}>{upper(row.label)}</div>
                <div style={{ display: "flex", fontSize: rowSize, fontWeight: 300 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts: WEIGHTS.flatMap((weight, index) => [
        { name: "Inter Tight", data: latin[index], weight, style: "normal" as const },
        { name: "Inter Tight Ext", data: latinExt[index], weight, style: "normal" as const },
      ]),
    },
  );
}
