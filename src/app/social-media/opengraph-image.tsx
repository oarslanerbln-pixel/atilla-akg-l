import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { packages } from "@/lib/packages";
import { translations } from "@/i18n/translations";

/**
 * The share card for /social-media, generated at build time.
 *
 * The page is sent by hand, so this card is the first thing a prospect sees:
 * the preview WhatsApp, Instagram or Mail draws under the link. The page sets
 * its own `openGraph`, which drops the root card, so without this file the
 * link arrived with no picture at all.
 *
 * It sets the three plates as the page does — paper, hairlines, Signature in
 * ink — with names and counts read from lib/packages.ts, so the card cannot
 * promise a package the page no longer offers. The words are the English
 * strings: the package names are English in every language, and one card
 * serves every link. A thumbnail crop keeps the centre, which is Signature.
 *
 * Inter Tight is read from src/assets/fonts (OFL, woff — the renderer does
 * not read woff2) and the wordmark comes outlined from public/brand, so
 * nothing is fetched while building and the lockup is the real one.
 */
const EN = translations.EN;

export const alt = `${EN.pkg_eyebrow} — ${packages.map((pkg) => pkg.name).join(", ")} · Atilla Barbarossa`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function OpenGraphImage() {
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
          <img src={lockupSrc} width={289} height={36} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 17,
              fontWeight: 400,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: GOLD_READABLE,
            }}
          >
            {EN.pkg_eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: 40,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 30,
                  }}
                >
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
                        textTransform: "uppercase",
                        color: GOLD_LIGHT,
                      }}
                    >
                      {EN.pkg_most_chosen}
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
                  <div
                    style={{
                      display: "flex",
                      fontSize: 132,
                      fontWeight: 200,
                      letterSpacing: -6,
                      lineHeight: 0.8,
                    }}
                  >
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
                      textTransform: "uppercase",
                      color: featured ? ON_INK_MUTED : MUTED,
                    }}
                  >
                    <span>{EN.pkg_videos}</span>
                    <span style={{ marginTop: 4 }}>{EN.pkg_per_month}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter Tight", data: light200, weight: 200, style: "normal" },
        { name: "Inter Tight", data: light300, weight: 300, style: "normal" },
        { name: "Inter Tight", data: regular400, weight: 400, style: "normal" },
      ],
    },
  );
}
