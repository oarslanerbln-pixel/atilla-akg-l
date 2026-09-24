import { ImageResponse } from "next/og";
import { RAYS } from "@/components/BrandMark";

/**
 * The share card, generated at build time.
 *
 * `metadata` pointed at /og-image.jpg, which was never in public/ — so every
 * link shared to WhatsApp, LinkedIn or a DM rendered without a preview. Next
 * picks this route up by convention and emits a real PNG, which also means the
 * card stays in step with the brand without anyone re-exporting an asset.
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
        {/* The compass mark (see BrandMark.tsx), drawn with literal colours
            because the card is rendered outside the page's CSS. */}
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ marginBottom: 40 }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#fcfbf9" strokeWidth="1.2" />
          {RAYS.map(([dark, gold]) => [
            <polygon key={dark} points={dark} fill="#fcfbf9" />,
            <polygon key={gold} points={gold} fill="#b38b59" />,
          ])}
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
