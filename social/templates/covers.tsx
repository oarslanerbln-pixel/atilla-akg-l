import type { ReactElement } from "react";
import { brand, C, display, GRID_SAFE, PORTRAIT, sans, serif, type Lang, type PhotoSpec } from "../kit";

// Reel covers, 1080×1920. Everything that must be read sits inside the profile grid's 3:4 crop.

export interface CoverBrief {
  kind: "cover";
  /** Output file prefix. */
  name: string;
  lang: Lang;
  /** Which templates to render; all when omitted. */
  templates?: CoverTemplate[];
  /** Small line above the title. For partner content it starts with the ad label ("Anzeige · …"). */
  eyebrow: string;
  title: string;
  /** Second title line, set in italic gold. */
  accent?: string;
  subtitle?: string;
  /** Short labels, shown as outlined tags by the templates that have room for them. */
  tags?: string[];
  photo: PhotoSpec;
}

interface Template {
  /** The box the photo is cut to, and where the face should land in it. */
  photo: { width: number; height: number; anchorY: number };
  render: (brief: CoverBrief, photo: string) => ReactElement;
}

const eyebrowStyle = (color: string) => ({
  display: "flex",
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 26,
  letterSpacing: 6,
  textTransform: "uppercase" as const,
  color,
});

const rule = (color: string, width = 88) => <div style={{ display: "flex", width, height: 2, backgroundColor: color }} />;

function Logo({ onInk, width }: { onInk: boolean; width: number }) {
  const logo = onInk ? brand.logoOnInk : brand.logoOnLight;
  // eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page
  return <img src={logo.src} width={width} height={Math.round(width / logo.ratio)} alt="" />;
}

function Photo({ src, width, height, style }: { src: string; width: number; height: number; style?: object }) {
  // eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page
  return <img src={src} width={width} height={height} alt="" style={{ position: "absolute", ...style }} />;
}

function Tags({ tags, color }: { tags?: string[]; color: string }) {
  if (!tags?.length) return null;
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 44 }}>
      {tags.map((t) => (
        <div
          key={t}
          style={{
            display: "flex",
            padding: "14px 30px",
            border: `1.5px solid ${color}`,
            borderRadius: 999,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: 5,
            textTransform: "uppercase",
            color,
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
}

/** Full-bleed photo, ink falling in from below, a serif title over it. */
const editorial: Template = {
  photo: { ...PORTRAIT, anchorY: 0.28 },
  render: (b, photo) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
      <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage:
            "linear-gradient(180deg, rgba(20,15,10,0.72) 0%, rgba(20,15,10,0.45) 17%, rgba(20,15,10,0) 29%, rgba(20,15,10,0) 42%, rgba(20,15,10,0.82) 68%, rgba(20,15,10,0.96) 100%)",
        }}
      />
      <div style={{ display: "flex", position: "absolute", top: GRID_SAFE.top + 56, left: 0, right: 0, justifyContent: "center" }}>
        <Logo onInk width={380} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 88,
          right: 88,
          bottom: PORTRAIT.height - GRID_SAFE.bottom + 48,
        }}
      >
        <div style={eyebrowStyle(C.goldLight)}>{b.eyebrow}</div>
        <div style={{ display: "flex", margin: "32px 0 36px" }}>{rule(C.gold)}</div>
        <div style={{ display: "flex", fontFamily: serif, fontSize: 132, lineHeight: 1.02, color: C.porcelain }}>{b.title}</div>
        {b.accent && (
          <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 132, lineHeight: 1.02, color: C.goldLight }}>
            {b.accent}
          </div>
        )}
        {b.subtitle && (
          <div style={{ display: "flex", marginTop: 36, fontFamily: sans, fontSize: 36, lineHeight: 1.35, color: C.onInkSoft }}>
            {b.subtitle}
          </div>
        )}
      </div>
    </div>
  ),
};

/**
 * Full-bleed photo under a soft vignette, everything centred low in the grid's crop: a tracked
 * eyebrow, a serif title with an italic gold second line, a tracked subline. No logo, no rule.
 */
const lounge: Template = {
  photo: { ...PORTRAIT, anchorY: 0.4 },
  render: (b, photo) => {
    // One size for both title lines, so the longer one still fits the 904 px text column.
    const longest = Math.max(b.title.length, b.accent?.length ?? 0);
    const size = Math.min(124, Math.floor(904 / (longest * 0.58)));
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
        <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "radial-gradient(ellipse at 50% 46%, rgba(20,15,10,0) 42%, rgba(20,15,10,0.5) 100%), linear-gradient(180deg, rgba(20,15,10,0.35) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 46%, rgba(20,15,10,0.78) 70%, rgba(20,15,10,0.94) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            left: 88,
            right: 88,
            bottom: PORTRAIT.height - GRID_SAFE.bottom + 56,
          }}
        >
          <div style={{ ...eyebrowStyle(C.goldLight), fontSize: 24, letterSpacing: 7, marginBottom: 30 }}>{b.eyebrow}</div>
          <div style={{ display: "flex", fontFamily: serif, fontSize: size, lineHeight: 1.04, color: C.porcelain }}>{b.title}</div>
          {b.accent && (
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: size, lineHeight: 1.04, color: C.goldLight }}>
              {b.accent}
            </div>
          )}
          {b.subtitle && (
            <div style={{ ...eyebrowStyle(C.onInkSoft), fontWeight: 400, fontSize: 22, letterSpacing: 6, marginTop: 40 }}>{b.subtitle}</div>
          )}
        </div>
      </div>
    );
  },
};

/** Porcelain page with the photo matted like a print, magazine-style title below. */
const passepartout: Template = {
  photo: { width: 936, height: 860, anchorY: 0.34 },
  render: (b, photo) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.porcelain }}>
      <div style={{ display: "flex", position: "absolute", top: GRID_SAFE.top + 40, left: 0, right: 0, justifyContent: "center" }}>
        <Logo onInk={false} width={400} />
      </div>
      <div style={{ display: "flex", position: "absolute", top: 368, left: 56, width: 968, height: 892, border: `1.5px solid ${C.gold}` }} />
      <Photo src={photo} width={936} height={860} style={{ top: 384, left: 72 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "absolute",
          top: 1300,
          left: 72,
          right: 72,
        }}
      >
        <div style={eyebrowStyle(C.goldReadable)}>{b.eyebrow}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 26 }}>
          <div style={{ display: "flex", fontFamily: serif, fontSize: 104, color: C.text }}>{b.title}</div>
          {b.accent && (
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 104, color: C.goldReadable }}>{b.accent}</div>
          )}
        </div>
        {b.subtitle && (
          <div style={{ display: "flex", marginTop: 18, fontFamily: sans, fontSize: 34, color: C.graphite, textAlign: "center" }}>
            {b.subtitle}
          </div>
        )}
      </div>
    </div>
  ),
};

/** Photo above, ink panel below with a light grotesk title and tags. */
const SPLIT_PHOTO = 1080;

const split: Template = {
  photo: { width: 1080, height: SPLIT_PHOTO, anchorY: 0.4 },
  render: (b, photo) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
      <Photo src={photo} width={1080} height={SPLIT_PHOTO} style={{ top: 0, left: 0 }} />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: SPLIT_PHOTO,
          backgroundImage: "linear-gradient(180deg, rgba(20,15,10,0.72) 0%, rgba(20,15,10,0.45) 28%, rgba(20,15,10,0) 42%, rgba(20,15,10,0) 80%, rgba(20,15,10,0.9) 100%)",
        }}
      />
      <div style={{ display: "flex", position: "absolute", top: GRID_SAFE.top + 48, left: 88 }}>
        <Logo onInk width={340} />
      </div>
      <div style={{ display: "flex", position: "absolute", top: SPLIT_PHOTO, left: 0, right: 0, height: 2, backgroundColor: C.gold }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: SPLIT_PHOTO + 56, left: 88, right: 88 }}>
        <div style={eyebrowStyle(C.goldLight)}>{b.eyebrow}</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 28, columnGap: 28 }}>
          <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, lineHeight: 1.04, color: C.porcelain }}>
            {b.title}
          </div>
          {b.accent && (
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, lineHeight: 1.04, color: C.goldLight }}>
              {b.accent}
            </div>
          )}
        </div>
        {b.subtitle && (
          <div style={{ display: "flex", marginTop: 26, fontFamily: sans, fontSize: 34, lineHeight: 1.35, color: C.onInkSoft }}>
            {b.subtitle}
          </div>
        )}
        <Tags tags={b.tags} color={C.goldLight} />
      </div>
    </div>
  ),
};

/** Full-bleed photo with a champagne card floating over it; the compass mark sits where a chip would. */
const card: Template = {
  photo: { ...PORTRAIT, anchorY: 0.27 },
  render: (b, photo) => (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
      <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage:
            "linear-gradient(180deg, rgba(20,15,10,0.72) 0%, rgba(20,15,10,0.45) 17%, rgba(20,15,10,0.05) 29%, rgba(20,15,10,0.1) 45%, rgba(20,15,10,0.7) 100%)",
        }}
      />
      <div style={{ display: "flex", position: "absolute", top: GRID_SAFE.top + 56, left: 0, right: 0, justifyContent: "center" }}>
        <Logo onInk width={380} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "absolute",
          left: 110,
          top: GRID_SAFE.bottom - 40 - 542,
          width: 860,
          height: 542,
          padding: "52px 56px",
          borderRadius: 36,
          backgroundImage: "linear-gradient(128deg, #efdcb4 0%, #c9a468 34%, #f4e6c6 56%, #b99258 82%, #d8b482 100%)",
          boxShadow: "0 48px 90px rgba(0,0,0,0.5)",
          border: "1.5px solid rgba(255,255,255,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page */}
          <img src={brand.markOnLight} width={84} height={84} alt="" />
          <div style={{ ...eyebrowStyle(C.text), fontSize: 22, letterSpacing: 5, maxWidth: 520, textAlign: "right", justifyContent: "flex-end" }}>
            {b.eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: serif, fontSize: 92, lineHeight: 1.02, color: C.text }}>{b.title}</div>
          {b.accent && (
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 92, lineHeight: 1.02, color: "#5c3d17" }}>
              {b.accent}
            </div>
          )}
          {b.subtitle && (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 24,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "rgba(24,21,18,0.78)",
              }}
            >
              {b.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  ),
};

export const COVER_TEMPLATES = { lounge, editorial, passepartout, split, card } satisfies Record<string, Template>;
export type CoverTemplate = keyof typeof COVER_TEMPLATES;
