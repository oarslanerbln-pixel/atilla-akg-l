import type { ReactElement } from "react";
import { BASE, bearing, formatCoords } from "../../src/lib/partners";
import { brand, C, display, GRID_SAFE, PORTRAIT, sans, serif, type Lang, type PhotoSpec, type PhotoTone } from "../kit";
import { distanceKm, formatInt } from "../motion/src/lib/geo";

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
  /** `noir`: the place, set large and tracked ("Malaysia"). Falls back to the title. */
  place?: string;
  /** `atlas`: where the film is, [lat, lon]; prints the coordinates and the distance from Berlin. */
  coords?: [number, number];
  /** `ticket`: one to three stops, e.g. BER → IST → KUL, with the city under each code. */
  route?: { code: string; city: string }[];
  /** `galerie`: the post's number in a series, printed as "N° 07". */
  index?: number;
  photo: PhotoSpec;
}

interface Template {
  /** The box the photo is cut to, where the face should land in it, and its colour treatment. */
  photo: { width: number; height: number; anchorY: number; tone?: PhotoTone };
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
            // The vignette's sides are a linear gradient: next/og draws a radial one with its
            // transparent centre at the edge colour's alpha, which dimmed the whole photo by a third.
            backgroundImage:
              "linear-gradient(90deg, rgba(20,15,10,0.3) 0%, rgba(20,15,10,0) 24%, rgba(20,15,10,0) 76%, rgba(20,15,10,0.3) 100%), linear-gradient(180deg, rgba(20,15,10,0.2) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 38%, rgba(20,15,10,0.78) 62%, rgba(20,15,10,0.94) 100%)",
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
            // Clear of the view count Instagram prints over the tile's lower-left corner.
            bottom: PORTRAIT.height - GRID_SAFE.bottom + 206,
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

/** Full-bleed photo with a champagne card floating over it; the brand mark sits where a chip would. */
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

/**
 * Largest size, up to `max`, at which `chars` characters of a face whose average advance is
 * `em` fit `width`. Satori wraps rather than shrinks, so the templates size their titles here.
 */
const fit = (chars: number, width: number, em: number, max: number) => Math.min(max, Math.floor(width / (chars * em)));

const longestLine = (b: CoverBrief) => Math.max(b.title.length, b.accent?.length ?? 0);

const LOCALE = { de: "de-DE", en: "en-GB", tr: "tr-TR" } as const;

/** Bottom of a text block that must stay clear of the view count Instagram prints over the tile. */
const CLEAR_OF_COUNT = PORTRAIT.height - GRID_SAFE.bottom + 206;

function Compass({ deg, size }: { deg: number; size: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 1.5} fill="none" stroke={C.goldLight} strokeWidth={1.5} />
      <line x1={r} y1={3} x2={r} y2={11} stroke={C.goldLight} strokeWidth={1.5} />
      <g transform={`rotate(${deg.toFixed(1)} ${r} ${r})`}>
        <polygon points={`${r},${r * 0.24} ${r + r * 0.12},${r} ${r - r * 0.12},${r}`} fill={C.goldLight} />
        <polygon points={`${r},${r * 1.76} ${r + r * 0.12},${r} ${r - r * 0.12},${r}`} fill="rgba(252,251,249,0.45)" />
      </g>
      <circle cx={r} cy={r} r={2.5} fill={C.porcelain} />
    </svg>
  );
}

/**
 * Atlas: full-bleed photo; at the top a compass turned to the bearing from Berlin with the
 * coordinates beside it, at the foot a left-aligned title in the site's Inter Tight. The figures
 * come from the site's own bearing() and formatCoords(), so a cover and a partner card agree.
 */
const atlas: Template = {
  photo: { ...PORTRAIT, anchorY: 0.36 },
  render: (b, photo) => {
    const here = b.coords && { lat: b.coords[0], lon: b.coords[1] };
    const size = fit(longestLine(b), 904, 0.5, 136);
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
        <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "linear-gradient(180deg, rgba(20,15,10,0.74) 0%, rgba(20,15,10,0.62) 14%, rgba(20,15,10,0.32) 23%, rgba(20,15,10,0) 33%, rgba(20,15,10,0) 44%, rgba(20,15,10,0.8) 66%, rgba(20,15,10,0.95) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            top: GRID_SAFE.top + 56,
            left: 88,
            right: 88,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {here && <Compass deg={bearing(BASE, here)} size={100} />}
            {here && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", fontFamily: sans, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: C.porcelain }}>
                  {formatCoords(here)}
                </div>
                <div style={{ ...eyebrowStyle(C.goldLight), fontSize: 23, letterSpacing: 5 }}>
                  {`Berlin → ${formatInt(distanceKm(BASE, here), b.lang)} km`}
                </div>
              </div>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page */}
          <img src={brand.markOnInk} width={84} height={84} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 88, right: 88, bottom: CLEAR_OF_COUNT }}>
          <div style={eyebrowStyle(C.goldLight)}>{b.eyebrow}</div>
          <div style={{ display: "flex", margin: "30px 0 26px" }}>{rule(C.gold, 64)}</div>
          <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.03, color: C.porcelain }}>
            {b.title}
          </div>
          {b.accent && (
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.03, color: C.goldLight }}>
              {b.accent}
            </div>
          )}
          {b.subtitle && (
            <div style={{ display: "flex", marginTop: 30, fontFamily: sans, fontSize: 30, lineHeight: 1.35, color: C.onInkSoft }}>{b.subtitle}</div>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Galerie: the website on Instagram. A print lying on gallery white, a museum label below it:
 * gold eyebrow, the heading in plain ink as the site sets its section headings, the number of the
 * post in the series. The wordmark sits above the grid's crop, seen only when the reel opens.
 */
const GALERIE_PHOTO = { width: 952, height: 930 };

const galerie: Template = {
  photo: { ...GALERIE_PHOTO, anchorY: 0.4 },
  render: (b, photo) => {
    const size = fit(longestLine(b), 780, 0.5, 112);
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.porcelain }}>
        <div style={{ display: "flex", position: "absolute", top: 104, left: 0, right: 0, justifyContent: "center" }}>
          <Logo onInk={false} width={320} />
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: GRID_SAFE.top + 40,
            left: 64,
            ...GALERIE_PHOTO,
            boxShadow: "0 34px 70px rgba(20,15,10,0.2), 0 6px 16px rgba(20,15,10,0.08)",
          }}
        >
          <Photo src={photo} {...GALERIE_PHOTO} style={{ top: 0, left: 0 }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "absolute",
            top: GRID_SAFE.top + 40 + GALERIE_PHOTO.height + 56,
            left: 64,
            right: 64,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>
            <div style={{ ...eyebrowStyle(C.goldReadable), fontSize: 22 }}>{b.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: display, fontWeight: 300, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.035, color: C.text }}>
              {b.title}
            </div>
            {b.accent && (
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: size, lineHeight: 1.0, letterSpacing: -size * 0.035, color: C.graphite }}>
                {b.accent}
              </div>
            )}
            {b.subtitle && (
              <div style={{ display: "flex", marginTop: 26, fontFamily: sans, fontSize: 28, lineHeight: 1.35, color: C.graphite }}>{b.subtitle}</div>
            )}
          </div>
          {b.index !== undefined && (
            <div style={{ display: "flex", marginTop: 52, fontFamily: display, fontWeight: 300, fontSize: 40, color: C.goldReadable }}>
              {`N° ${String(b.index).padStart(2, "0")}`}
            </div>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Noir: the photo in a warm duotone from ink to paper, the place set very large and widely
 * tracked, the title beneath it in one italic line. Every tile in the grid shares the same tone.
 */
const noir: Template = {
  photo: { ...PORTRAIT, anchorY: 0.36, tone: "mono" },
  render: (b, photo) => {
    const place = (b.place ?? b.title).toLocaleUpperCase(LOCALE[b.lang]);
    const size = fit(place.length, 920, 0.86, 184);
    const tracking = Math.round(size * 0.2);
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
        <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "linear-gradient(180deg, rgba(20,15,10,0.6) 0%, rgba(20,15,10,0.4) 16%, rgba(20,15,10,0) 30%, rgba(20,15,10,0) 42%, rgba(20,15,10,0.72) 66%, rgba(20,15,10,0.94) 100%)",
          }}
        />
        <div style={{ display: "flex", position: "absolute", top: GRID_SAFE.top + 56, left: 0, right: 0, justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not a page */}
          <img src={brand.markOnInk} width={80} height={80} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            left: 60,
            right: 60,
            bottom: CLEAR_OF_COUNT,
          }}
        >
          <div style={{ ...eyebrowStyle(C.goldLight), fontSize: 22, letterSpacing: 8 }}>{b.eyebrow}</div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              // Satori tracks the last letter too; the same space on the left keeps the word centred.
              paddingLeft: tracking,
              fontFamily: display,
              fontWeight: 200,
              fontSize: size,
              lineHeight: 1.0,
              letterSpacing: tracking,
              color: C.porcelain,
            }}
          >
            {place}
          </div>
          <div style={{ display: "flex", margin: "30px 0 28px" }}>{rule(C.gold, 64)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, fontFamily: serif, fontStyle: "italic", fontSize: 60, lineHeight: 1.15 }}>
            <div style={{ display: "flex", color: C.porcelain }}>{b.title}</div>
            {b.accent && <div style={{ display: "flex", color: C.goldLight }}>{b.accent}</div>}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Ticket: a porcelain boarding pass over the photo. The wordmark heads it, the route is the
 * airport codes joined by gold hairlines with a sun between them, the title sits below the tear.
 */
function Leg({ code }: { code: number }) {
  // Lifted off the row's foot by the city line and half the code, so it runs through the codes' middle.
  return (
    <div style={{ display: "flex", flexGrow: 1, flexBasis: 0, alignItems: "center", margin: `0 18px ${32 + Math.round(code * 0.36)}px` }}>
      <div style={{ display: "flex", flexGrow: 1, flexBasis: 0, height: 1.5, backgroundColor: C.gold }} />
      <div style={{ display: "flex", width: 16, height: 16, borderRadius: 999, backgroundColor: C.gold, margin: "0 10px" }} />
      <div style={{ display: "flex", flexGrow: 1, flexBasis: 0, height: 1.5, backgroundColor: C.gold }} />
    </div>
  );
}

const ticket: Template = {
  photo: { ...PORTRAIT, anchorY: 0.3 },
  render: (b, photo) => {
    const stops = (b.route ?? []).slice(0, 3);
    const code = stops.length > 2 ? 88 : 116;
    const titleSize = fit((b.title + (b.accent ? ` ${b.accent}` : "")).length, 2 * 820, 0.5, 66);
    return (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", backgroundColor: C.ink }}>
        <Photo src={photo} {...PORTRAIT} style={{ top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage:
              "linear-gradient(180deg, rgba(20,15,10,0.45) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 50%, rgba(20,15,10,0.4) 80%, rgba(20,15,10,0.6) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            left: 72,
            right: 72,
            bottom: PORTRAIT.height - GRID_SAFE.bottom + 150,
            padding: "44px 52px 46px",
            borderRadius: 28,
            backgroundColor: C.porcelain,
            boxShadow: "0 40px 80px rgba(0,0,0,0.42)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Logo onInk={false} width={290} />
            <div style={{ ...eyebrowStyle(C.goldReadable), fontSize: 19, letterSpacing: 4, maxWidth: 440, textAlign: "right", justifyContent: "flex-end" }}>
              {b.eyebrow}
            </div>
          </div>
          <div style={{ display: "flex", height: 1, marginTop: 30, backgroundColor: C.hairline }} />
          {stops.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 26 }}>
              {stops.flatMap((s, i) => [
                ...(i > 0 ? [<Leg key={`leg-${i}`} code={code} />] : []),
                <div key={s.code} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === stops.length - 1 ? "flex-end" : "center" }}>
                  <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: code, lineHeight: 1.0, letterSpacing: 2, color: C.text }}>
                    {s.code.toLocaleUpperCase(LOCALE[b.lang])}
                  </div>
                  <div style={{ ...eyebrowStyle(C.graphite), fontSize: 18, letterSpacing: 4, marginTop: 10 }}>{s.city}</div>
                </div>,
              ])}
              {stops.length === 1 && <Leg code={code} />}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
            {Array.from({ length: 52 }, (_, i) => (
              <div key={i} style={{ display: "flex", width: 6, height: 6, borderRadius: 999, backgroundColor: "rgba(24,21,18,0.2)" }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, marginTop: 28, fontFamily: display, fontWeight: 300, fontSize: titleSize, lineHeight: 1.05, letterSpacing: -titleSize * 0.03 }}>
            <div style={{ display: "flex", color: C.text }}>{b.title}</div>
            {b.accent && <div style={{ display: "flex", color: C.goldReadable }}>{b.accent}</div>}
          </div>
          {b.subtitle && <div style={{ ...eyebrowStyle(C.graphite), fontSize: 19, letterSpacing: 4, marginTop: 14 }}>{b.subtitle}</div>}
        </div>
      </div>
    );
  },
};

export const COVER_TEMPLATES = { lounge, editorial, passepartout, split, card, atlas, galerie, noir, ticket } satisfies Record<string, Template>;
export type CoverTemplate = keyof typeof COVER_TEMPLATES;
