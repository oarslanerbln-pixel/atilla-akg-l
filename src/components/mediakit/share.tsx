import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { translations, type Language } from "@/i18n/translations";
import { fill } from "@/i18n/format";
import { siteFacts } from "@/lib/faq";
import { HTML_LANG } from "@/lib/locales";
import { SITE_NAME, localizedMetadata } from "@/lib/metadata";
import { mediaKitFigures } from "./figures";

/**
 * What a link to /media-kit shows before it is opened. The page is sent by
 * email and messenger in the recipient's language, so each language has its
 * own static address (/media-kit, /media-kit/en, /media-kit/tr) and its own
 * card, prerendered like the /social-media ones (see packages/share.tsx).
 */
export function mediaKitMetadata(lang: Language): Metadata {
  const t = translations[lang];
  return localizedMetadata({
    page: "mediaKit",
    lang,
    title: `${t.mk_meta_title} | ${SITE_NAME}`,
    description: fill(t.mk_meta_description, siteFacts(lang)),
  });
}

export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_CONTENT_TYPE = "image/png";

export const cardAlt = (lang: Language) => `${translations[lang].mk_meta_title} · ${SITE_NAME}`;

const PAPER = "#fcfbf9";
const TEXT = "#181512";
const MUTED = "#5a524a";
const GOLD_READABLE = "#7c5423";
const HAIRLINE = "rgba(24, 21, 18, 0.12)";

const font = (subset: "latin" | "latin-ext", weight: number) =>
  readFile(join(process.cwd(), `src/assets/fonts/inter-tight-${subset}-${weight}-normal.woff`));

const WEIGHTS = [200, 300, 400] as const;

/**
 * The card, drawn at build time the way the page opens: the headline large on
 * paper and the four audience figures under a hairline. Capitals are set with
 * the language's own rules, not `textTransform` (see packages/share.tsx).
 * The latin subset lacks ğ, ş and İ, so the latin-ext subset is registered as
 * a second family: the renderer falls back to it, at the same weight, for any
 * glyph the first one does not have.
 */
export async function mediaKitCard(lang: Language) {
  const t = translations[lang];
  const upper = (text: string) => text.toLocaleUpperCase(HTML_LANG[lang]);

  const [latin, latinExt, lockup] = await Promise.all([
    Promise.all(WEIGHTS.map((weight) => font("latin", weight))),
    Promise.all(WEIGHTS.map((weight) => font("latin-ext", weight))),
    readFile(join(process.cwd(), "public/brand/logo-horizontal.svg")),
  ]);
  const lockupSrc = `data:image/svg+xml;base64,${lockup.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "52px 64px 56px",
          background: PAPER,
          color: TEXT,
          fontFamily: "Inter Tight",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* The outlined lockup's viewBox is 514.38 × 64. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn by next/og into the PNG, never sent to a browser */}
          <img src={lockupSrc} width={289} height={36} alt="" />
          <div style={{ display: "flex", fontSize: 17, fontWeight: 400, letterSpacing: 5, color: GOLD_READABLE }}>
            {upper(t.mk_eyebrow)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            fontSize: 88,
            fontWeight: 300,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          <div style={{ display: "flex" }}>{t.mk_title_1}</div>
          <div style={{ display: "flex", color: MUTED }}>{t.mk_title_2}</div>
        </div>

        <div style={{ display: "flex", marginTop: 44, borderTop: `1px solid ${HAIRLINE}` }}>
          {mediaKitFigures(lang).map((figure, index) => (
            <div
              key={figure.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                paddingTop: 22,
                paddingLeft: index === 0 ? 0 : 24,
                borderLeft: index === 0 ? "none" : `1px solid ${HAIRLINE}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 50, fontWeight: 200, letterSpacing: -2, lineHeight: 1 }}>
                {figure.value}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: 1.4,
                  color: MUTED,
                }}
              >
                {upper(figure.label)}
              </div>
            </div>
          ))}
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
