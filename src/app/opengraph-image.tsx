import { ImageResponse } from "next/og";

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
        <div
          style={{
            fontSize: 22,
            letterSpacing: 10,
            color: "#d8b482",
            marginBottom: 36,
          }}
        >
          CREATIVE DIRECTION
        </div>

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
