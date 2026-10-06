import { ImageResponse } from "next/og";
import { MARK_FINE } from "@/components/brandMarkPaths";

/**
 * The share card, generated at build time.
 *
 * `metadata` pointed at /og-image.jpg, which was never in public/ — so every
 * link shared to WhatsApp, LinkedIn or a DM rendered without a preview. Next
 * picks this route up by convention and emits a real PNG, which also means the
 * card stays in step with the brand without anyone re-exporting an asset.
 *
 * It lives in the (de) group because a card applies down its own tree only,
 * and each language is a tree of its own; /en and /tr re-export it.
 */
export const alt = "Atilla BARBAROSSA — Visual Storytelling & Creative Direction";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#140f0a",
          color: "#fcfbf9",
          position: "relative",
        }}
      >
        {/* The brand mark (see BrandMark.tsx) in its finer cut, drawn with
            literal colours because the card is rendered outside the page's CSS. */}
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ marginBottom: 40 }}>
          {MARK_FINE.ink.map((d) => (
            <path key={d} d={d} fill="#fcfbf9" />
          ))}
          {MARK_FINE.teal.map((d) => (
            <path key={d} d={d} fill="#7fb8b8" />
          ))}
          <circle cx={MARK_FINE.sun.cx} cy={MARK_FINE.sun.cy} r={MARK_FINE.sun.r} fill="#d8b482" />
        </svg>

        <div style={{ display: "flex", fontSize: 84, letterSpacing: 4, fontWeight: 300 }}>
          Atilla
        </div>
        <div style={{ display: "flex", fontSize: 84, letterSpacing: 16, fontWeight: 700 }}>
          BARBAROSSA
        </div>

        <div
          style={{
            width: 140,
            height: 2,
            background: "#b38b59",
            margin: "40px 0",
          }}
        />

        <div style={{ fontSize: 24, letterSpacing: 6, color: "rgba(252, 251, 249, 0.75)" }}>
          VISUAL STORYTELLING · LUXURY FILMMAKING
        </div>
      </div>
    ),
    size,
  );
}
