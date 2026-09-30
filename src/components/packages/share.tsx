import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { packages } from "@/lib/packages";
import { translations, type Language } from "@/i18n/translations";
import { fill } from "@/i18n/format";
import { siteFacts } from "@/lib/faq";
import { HTML_LANG } from "@/lib/locales";
import { SITE_NAME, localizedMetadata } from "@/lib/metadata";

/**
 * What a link to /social-media shows before it is opened — the title, the
 * description and the card that WhatsApp, Instagram or Mail draw under it —
 * and what a search result for it shows.
 *
 * The page is sent by hand, in the prospect's language, and is also found by
 * search. German lives at /social-media; English and Turkish are static pages
 * at /social-media/en and /social-media/tr, each with its own card, served
 * under their own root layout so `<html lang>` matches (see the (en) and (tr)
 * route groups). next.config.ts rewrites the links that are actually sent
 * (`?lang=en`, `?lang=tr`) onto them. Plain folders rather than a [lang]
 * segment: a share card is a route handler, and route handlers do not
 * inherit a layout's generateStaticParams, so under [lang] the cards would be
 * drawn on request — reading fonts the deployment may not have traced.
 * Everything stays prerendered; nothing is decided per request.
 */

/**
 * The three addresses are canonical for their language and name each other
 * with hreflang, so a search engine shows the one in the searcher's language.
 */
export function packagesMetadata(lang: Language): Metadata {
  const t = translations[lang];
  return localizedMetadata({
    page: "socialMedia",
    lang,
    title: `${t.pkg_meta_title} | ${SITE_NAME}`,
    description: fill(t.pkg_meta_description, siteFacts(lang)),
  });
}

export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_CONTENT_TYPE = "image/png";

export const cardAlt = (lang: Language) =>
  `${translations[lang].pkg_eyebrow} — ${packages.map((pkg) => pkg.name).join(", ")} · ${SITE_NAME}`;

const INK = "#140f0a";
const PAPER = "#fcfbf9";
const CARD = "#ffffff";
const TEXT = "#181512";
const MUTED = "#5a524a";
const GOLD = "#b38b59";
const GOLD_LIGHT = "#d8b482";
const GOLD_READABLE = "#7c5423";
const HAIRLINE = "rgba(24, 21, 18, 0.12)";
const HAIRLINE_INK = "rgba(252, 251, 249, 0.16)";
const ON_INK = "#fcfbf9";
const ON_INK_MUTED = "rgba(252, 251, 249, 0.62)";

const font = (weight: number) =>
  readFile(join(process.cwd(), `src/assets/fonts/inter-tight-latin-${weight}-normal.woff`));

/**
 * The card, generated at build time: the three plates as the page sets them
 * — paper, hairlines, Signature in ink — with names and counts read from
 * lib/packages.ts, so it cannot promise a package the page no longer offers.
 * A thumbnail crop keeps the centre, which is Signature.
 *
 * Capitals are set here with the language's own rules rather than by
 * `textTransform`, which the renderer applies without a locale: Turkish needs
 * TERCİH and VİDEO, not TERCIH and VIDEO. Inter Tight is read from
 * src/assets/fonts (OFL, woff — the renderer does not read woff2) and the
 * wordmark comes outlined from public/brand, so nothing is fetched while
 * building and the lockup is the real one.
 */
export async function packagesCard(lang: Language) {
  const t = translations[lang];
  const upper = (text: string) => text.toLocaleUpperCase(HTML_LANG[lang]);

  const [light200, light300, regular400, lockup] = await Promise.all([
    font(200),
    font(300),
    font(400),
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
            {upper(t.pkg_eyebrow)}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 40, border: `1px solid ${HAIRLINE}` }}>
          {packages.map((pkg, index) => {
            const featured = Boolean(pkg.featured);
            return (
              <div
                key={pkg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "30px 36px 34px",
                  background: featured ? INK : CARD,
                  color: featured ? ON_INK : TEXT,
                  borderLeft: index === 0 ? "none" : `1px solid ${HAIRLINE}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30 }}>
                  <div style={{ display: "flex", fontSize: 17, letterSpacing: 2, color: GOLD }}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  {featured && (
                    <div
                      style={{
                        display: "flex",
                        padding: "5px 11px",
                        border: `1px solid ${GOLD}`,
                        fontSize: 12,
                        letterSpacing: 3,
                        color: GOLD_LIGHT,
                      }}
                    >
                      {upper(t.pkg_most_chosen)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 22,
                    fontSize: 46,
                    fontWeight: 300,
                    letterSpacing: -1.4,
                    lineHeight: 1,
                  }}
                >
                  {pkg.name}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    marginTop: "auto",
                    paddingTop: 22,
                    borderTop: `1px solid ${featured ? HAIRLINE_INK : HAIRLINE}`,
                  }}
                >
                  <div style={{ display: "flex", fontSize: 132, fontWeight: 200, letterSpacing: -6, lineHeight: 0.8 }}>
                    {pkg.videos}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: 18,
                      paddingBottom: 2,
                      fontSize: 14,
                      letterSpacing: 3,
                      color: featured ? ON_INK_MUTED : MUTED,
                    }}
                  >
                    <span>{upper(t.pkg_videos)}</span>
                    <span style={{ marginTop: 4 }}>{upper(t.pkg_per_month)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts: [
        { name: "Inter Tight", data: light200, weight: 200, style: "normal" },
        { name: "Inter Tight", data: light300, weight: 300, style: "normal" },
        { name: "Inter Tight", data: regular400, weight: 400, style: "normal" },
      ],
    },
  );
}
