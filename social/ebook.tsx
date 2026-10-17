import { join } from "node:path";
import type { ReactElement } from "react";
import sharp from "sharp";
import { brand, C, display, framePhoto, renderPng, sans, serif, type PhotoSpec } from "./kit";

// npx tsx social/ebook.tsx
// Twenty cover options for The Travel Creator Roadmap, 1200×1920 (the e-book ratio, 1:1.6), plus an
// overview sheet. Photos are Atilla's own frames from the media kit; nothing here ships with the site.

const SIZE = { width: 1200, height: 1920 } as const;
const OUT = join(__dirname, "out", "ebook");

const T = {
  eyebrow: "Das E-Book",
  title: ["The Travel", "Creator", "Roadmap"],
  subtitle: "Die Insider-Strategie für kostenlose Luxus-Hotels & bezahlte Kooperationen",
  badge: ["Inkl.", "Pitch-Templates", "& Hotel-Liste"],
};

const photos = {
  sea: { src: "public/media-kit/cover.webp", focus: [0.62, 0.55] },
  pool: { src: "public/media-kit/hotel.webp", focus: [0.4, 0.6] },
  courtyard: { src: "public/media-kit/courtyard.webp", focus: [0.5, 0.55] },
  restaurant: { src: "public/media-kit/restaurant.webp", focus: [0.5, 0.5] },
  portrait: { src: "public/roadmap/atilla.webp", focus: [0.6, 0.35] },
} satisfies Record<string, PhotoSpec>;

const fill = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, display: "flex" };
const svg = (body: string, w: number = SIZE.width, h: number = SIZE.height) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`).toString("base64")}`;

/* eslint-disable @next/next/no-img-element -- rendered by next/og, not a page */
function Img({ src, width, height, style }: { src: string; width: number; height: number; style?: object }) {
  return <img src={src} width={width} height={height} alt="" style={{ position: "absolute", ...style }} />;
}
function Logo({ onInk, width, style }: { onInk: boolean; width: number; style?: object }) {
  const logo = onInk ? brand.logoOnInk : brand.logoOnLight;
  return <img src={logo.src} width={width} height={Math.round(width / logo.ratio)} alt="" style={style} />;
}
function Mark({ onInk, size, style }: { onInk: boolean; size: number; style?: object }) {
  return <img src={onInk ? brand.markOnInk : brand.markOnLight} width={size} height={size} alt="" style={style} />;
}
/* eslint-enable @next/next/no-img-element */

const eyebrow = (color: string, extra?: object) => ({
  display: "flex",
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 26,
  letterSpacing: 9,
  textTransform: "uppercase" as const,
  color,
  ...extra,
});

function Title({ size, color, accent, align = "flex-start", weight = 300 }: { size: number; color: string; accent?: string; align?: string; weight?: 300 | 500 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align }}>
      {T.title.map((line, i) => (
        <div
          key={line}
          style={{
            display: "flex",
            fontFamily: display,
            fontWeight: weight,
            fontSize: size,
            lineHeight: 1.02,
            letterSpacing: -size * 0.02,
            color: accent && i === T.title.length - 1 ? accent : color,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function Subtitle({ color, width = 860, align = "left", size = 38 }: { color: string; width?: number; align?: "left" | "center"; size?: number }) {
  return (
    <div style={{ display: "flex", width, fontFamily: sans, fontSize: size, lineHeight: 1.4, color, textAlign: align, justifyContent: align === "center" ? "center" : "flex-start" }}>
      {T.subtitle}
    </div>
  );
}

function Badge({ color, size = 250, style }: { color: string; size?: number; style?: object }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size,
        border: `2px solid ${color}`,
        ...style,
      }}
    >
      <div style={{ display: "flex", position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderRadius: size, border: `1px solid ${color}` }} />
      {T.badge.map((l, i) => (
        <div key={l} style={eyebrow(color, { fontSize: i === 1 ? 19 : 18, letterSpacing: 2, marginTop: i ? 6 : 0 })}>
          {l}
        </div>
      ))}
    </div>
  );
}

const rule = (color: string, width = 120, style?: object) => <div style={{ display: "flex", width, height: 2, backgroundColor: color, ...style }} />;

type Cover = { name: string; label: string; render: () => Promise<ReactElement> };

const covers: Cover[] = [
  {
    name: "01-porcelain",
    label: "Porzellan, nur Typo",
    render: async () => (
      <div style={{ ...fill, backgroundColor: C.porcelain }}>
        <div style={{ display: "flex", position: "absolute", top: 48, left: 48, right: 48, bottom: 48, border: `1.5px solid ${C.gold}` }} />
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 230, left: 140, right: 140 }}>
          <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
          {rule(C.gold, 120, { margin: "44px 0 64px" })}
          <Title size={178} color={C.text} />
          <div style={{ display: "flex", marginTop: 72 }}>
            <Subtitle color={C.graphite} width={820} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", bottom: 150, left: 0, right: 0 }}>
          <Logo onInk={false} width={520} />
        </div>
      </div>
    ),
  },
  {
    name: "02-ink",
    label: "Tinte, Gold-Akzent",
    render: async () => (
      <div style={{ ...fill, backgroundColor: C.ink }}>
        <Mark onInk size={1300} style={{ position: "absolute", right: -380, bottom: -260, opacity: 0.07 }} />
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 230, left: 130, right: 130 }}>
          <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
          {rule(C.gold, 120, { margin: "44px 0 64px" })}
          <Title size={178} color={C.porcelain} accent={C.goldLight} />
          <div style={{ display: "flex", marginTop: 72 }}>
            <Subtitle color={C.onInkSoft} width={820} />
          </div>
        </div>
        <Logo onInk width={520} style={{ position: "absolute", left: 130, bottom: 150 }} />
      </div>
    ),
  },
  {
    name: "03-horizon",
    label: "Meer-Band oben",
    render: async () => {
      const photo = await framePhoto(photos.sea, 1200, 1000, 0.5);
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <Img src={photo} width={1200} height={1000} style={{ top: 0, left: 0 }} />
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 1000, backgroundImage: "linear-gradient(180deg, rgba(252,251,249,0) 70%, rgba(252,251,249,1) 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 930, left: 80, right: 80 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 40 }}>
              <Title size={150} color={C.text} accent={C.goldReadable} align="center" />
            </div>
            <div style={{ display: "flex", marginTop: 44 }}>
              <Subtitle color={C.graphite} width={860} align="center" size={34} />
            </div>
          </div>
          <Logo onInk={false} width={460} style={{ position: "absolute", left: 370, bottom: 96 }} />
          <Badge color={C.porcelain} size={270} style={{ top: 80, right: 80 }} />
        </div>
      );
    },
  },
  {
    name: "04-pool",
    label: "Infinity-Pool, dunkel",
    render: async () => {
      const photo = await framePhoto(photos.pool, 1200, 1300, 0.6);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1300} style={{ top: 0, left: 0 }} />
          <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 1300, backgroundImage: "linear-gradient(180deg, rgba(20,15,10,0.55) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 52%, rgba(20,15,10,0.85) 82%, rgba(20,15,10,1) 100%)" }} />
          <Logo onInk width={440} style={{ position: "absolute", left: 380, top: 110 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 1010, left: 80, right: 80 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 36 }}>
              <Title size={156} color={C.porcelain} accent={C.goldLight} align="center" />
            </div>
            <div style={{ display: "flex", marginTop: 44 }}>
              <Subtitle color={C.onInkSoft} width={860} align="center" size={34} />
            </div>
          </div>
          <Badge color={C.goldLight} size={270} style={{ top: 760, right: 70 }} />
        </div>
      );
    },
  },
  {
    name: "05-passepartout",
    label: "Galerie-Print",
    render: async () => {
      const photo = await framePhoto(photos.courtyard, 960, 820, 0.5);
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <Logo onInk={false} width={440} style={{ position: "absolute", left: 380, top: 120 }} />
          <div style={{ display: "flex", position: "absolute", top: 264, left: 104, width: 992, height: 852, border: `1.5px solid ${C.gold}` }} />
          <Img src={photo} width={960} height={820} style={{ top: 280, left: 120 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 1190, left: 80, right: 80 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 34 }}>
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, letterSpacing: -2, color: C.text }}>The Travel Creator</div>
            </div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, letterSpacing: -2, color: C.goldReadable }}>Roadmap</div>
            {rule(C.gold, 100, { margin: "44px 0 40px" })}
            <Subtitle color={C.graphite} width={860} align="center" size={32} />
          </div>
        </div>
      );
    },
  },
  {
    name: "06-route",
    label: "Die Route (Meilensteine)",
    render: async () => {
      const steps: [number, number, string, string][] = [
        [230, 1560, "01", "Profil"],
        [520, 1330, "02", "Pitch"],
        [800, 1150, "03", "Hotel"],
        [1000, 900, "04", "Kooperation"],
      ];
      const path = `<path d="M 120 1700 C 220 1600, 200 1580, 230 1560 S 420 1380, 520 1330 S 720 1200, 800 1150 S 980 960, 1000 900 S 1060 760, 1100 720" fill="none" stroke="${C.gold}" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`;
      const dots = steps
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 3 ? 18 : 12}" fill="${i === 3 ? C.goldLight : C.ink}" stroke="${C.goldLight}" stroke-width="3"/>`)
        .join("");
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={svg(path + dots)} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          {steps.map(([x, y, n, label], i) => (
            // The last stop sits near the edge: its label goes to the dot's left.
            <div
              key={n}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: i === steps.length - 1 ? "flex-end" : "flex-start",
                position: "absolute",
                ...(i === steps.length - 1 ? { right: SIZE.width - x + 40 } : { left: x + 34 }),
                top: y - 30,
              }}
            >
              <div style={eyebrow(C.goldLight, { fontSize: 20, letterSpacing: 5 })}>{n}</div>
              <div style={{ display: "flex", fontFamily: sans, fontSize: 30, color: C.porcelain, marginTop: 4 }}>{label}</div>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 180, left: 120, right: 120 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            {rule(C.gold, 120, { margin: "40px 0 56px" })}
            <Title size={164} color={C.porcelain} accent={C.goldLight} />
            <div style={{ display: "flex", marginTop: 56 }}>
              <Subtitle color={C.onInkSoft} width={760} size={34} />
            </div>
          </div>
          <Logo onInk width={360} style={{ position: "absolute", left: 120, bottom: 96 }} />
          <div style={eyebrow(C.onInkSoft, { position: "absolute", right: 110, bottom: 104, fontSize: 18, letterSpacing: 4 })}>52.52° N · 13.40° E</div>
        </div>
      );
    },
  },
  {
    name: "07-compass",
    label: "Kompass",
    render: async () => {
      const cx = 600;
      const cy = 1010;
      const ticks = Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const r1 = 470;
        const r2 = i % 18 === 0 ? 430 : i % 2 === 0 ? 448 : 458;
        return `<line x1="${cx + r1 * Math.sin(a)}" y1="${cy - r1 * Math.cos(a)}" x2="${cx + r2 * Math.sin(a)}" y2="${cy - r2 * Math.cos(a)}" stroke="${C.gold}" stroke-width="${i % 18 === 0 ? 3 : 1.5}"/>`;
      }).join("");
      const rings = `<circle cx="${cx}" cy="${cy}" r="470" fill="none" stroke="${C.gold}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="520" fill="none" stroke="${C.gold}" stroke-width="1" opacity="0.5"/>`;
      // The needle points north-east: the way up.
      const needle = `<g transform="rotate(38 ${cx} ${cy})"><path d="M ${cx} ${cy - 560} L ${cx + 10} ${cy - 470} L ${cx - 10} ${cy - 470} Z" fill="${C.gold}"/></g>`;
      const letters = [
        ["N", cx, cy - 384],
        ["O", cx + 396, cy + 10],
        ["S", cx, cy + 404],
        ["W", cx - 396, cy + 10],
      ]
        .map(([l, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Helvetica, Arial" font-size="26" letter-spacing="4" fill="${C.goldReadable}">${l}</text>`)
        .join("");
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <Img src={svg(rings + ticks + needle + letters)} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 180, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 780, left: 0, right: 0 }}>
            <Title size={140} color={C.text} accent={C.goldReadable} align="center" />
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1590, left: 0, right: 0 }}>
            <Subtitle color={C.graphite} width={880} align="center" size={32} />
          </div>
          <Logo onInk={false} width={420} style={{ position: "absolute", left: 390, bottom: 90 }} />
        </div>
      );
    },
  },
  {
    name: "08-diptych",
    label: "Diptychon, zwei Hotels",
    render: async () => {
      const [a, b] = await Promise.all([framePhoto(photos.courtyard, 592, 820, 0.5), framePhoto(photos.restaurant, 592, 820, 0.5)]);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 150, left: 110, right: 110 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            {rule(C.gold, 120, { margin: "40px 0 52px" })}
            <Title size={150} color={C.porcelain} accent={C.goldLight} />
            <div style={{ display: "flex", marginTop: 44 }}>
              <Subtitle color={C.onInkSoft} width={900} size={32} />
            </div>
          </div>
          <Img src={a} width={592} height={820} style={{ left: 0, bottom: 0 }} />
          <Img src={b} width={592} height={820} style={{ right: 0, bottom: 0 }} />
          <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 820, backgroundImage: "linear-gradient(180deg, rgba(20,15,10,0.9) 0%, rgba(20,15,10,0) 30%, rgba(20,15,10,0) 70%, rgba(20,15,10,0.85) 100%)" }} />
          <Logo onInk width={440} style={{ position: "absolute", left: 380, bottom: 80 }} />
        </div>
      );
    },
  },
  {
    name: "09-boarding-pass",
    label: "Bordkarte",
    render: async () => {
      const field = (k: string, v: string, big = false) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={eyebrow(C.goldReadable, { fontSize: 16, letterSpacing: 4 })}>{k}</div>
          <div style={{ display: "flex", fontFamily: display, fontWeight: big ? 300 : 500, fontSize: big ? 64 : 30, color: C.text, marginTop: 8 }}>{v}</div>
        </div>
      );
      const bars = Array.from({ length: 46 }, (_, i) => `<rect x="${i * 13}" y="0" width="${[3, 6, 2, 4, 8, 2][i % 6]}" height="120" fill="${C.text}"/>`).join("");
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 170, left: 120, right: 120 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            {rule(C.gold, 120, { margin: "40px 0 52px" })}
            <Title size={156} color={C.text} accent={C.goldReadable} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 960, left: 100, width: 1000, height: 640, backgroundColor: C.porcelain, borderRadius: 28, border: `1.5px solid ${C.hairline}`, padding: "48px 56px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={eyebrow(C.text, { fontSize: 20, letterSpacing: 6 })}>Boarding Pass</div>
              <Mark onInk={false} size={64} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 40 }}>
              {field("Von", "Creator", true)}
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 56, color: C.gold, marginBottom: 6 }}>→</div>
              {field("Nach", "Partner", true)}
            </div>
            <div style={{ display: "flex", width: "100%", height: 0, borderTop: `2px dashed ${C.hairline}`, margin: "44px 0 36px" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {field("Flug", "TCR-01")}
              {field("Klasse", "Luxus")}
              {field("Gate", "Pitch")}
              {field("Sitz", "1A")}
            </div>
            <Img src={svg(bars, 600, 120)} width={600} height={70} style={{ left: 56, bottom: 40 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1660, left: 0, right: 0 }}>
            <Subtitle color={C.graphite} width={900} align="center" size={28} />
          </div>
          <Logo onInk={false} width={380} style={{ position: "absolute", left: 410, bottom: 70 }} />
        </div>
      );
    },
  },
  {
    name: "10-portrait",
    label: "Autor im Bogen",
    render: async () => {
      const photo = await framePhoto(photos.portrait, 700, 860, 0.35);
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 150, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 36 }}>
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 104, letterSpacing: -2, color: C.text }}>The Travel Creator</div>
            </div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 104, letterSpacing: -2, color: C.goldReadable }}>Roadmap</div>
          </div>
          <div style={{ display: "flex", position: "absolute", top: 520, left: 236, width: 728, height: 888, borderRadius: "364px 364px 0 0", border: `1.5px solid ${C.gold}` }} />
          <div style={{ display: "flex", position: "absolute", top: 534, left: 250, width: 700, height: 860, borderRadius: "350px 350px 0 0", overflow: "hidden" }}>
            <Img src={photo} width={700} height={860} style={{ top: 0, left: 0 }} />
          </div>
          <Badge color={C.goldReadable} size={270} style={{ top: 1230, right: 120, backgroundColor: C.porcelain }} />
          <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1470, left: 0, right: 0 }}>
            <Subtitle color={C.graphite} width={880} align="center" size={32} />
          </div>
          <Logo onInk={false} width={460} style={{ position: "absolute", left: 370, bottom: 100 }} />
        </div>
      );
    },
  },
];

const coverLine = (color: string, size = 30) => ({ display: "flex", fontFamily: sans, fontWeight: 500, fontSize: size, lineHeight: 1.25, color });

/** Second round: further from the first ten, in layout, motif and palette. */
const more: Cover[] = [
  {
    name: "11-magazine",
    label: "Magazin-Cover",
    render: async () => {
      const photo = await framePhoto(photos.sea, 1200, 1340, 0.5);
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <Img src={photo} width={1200} height={1340} style={{ left: 0, bottom: 0 }} />
          <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 1340, backgroundImage: "linear-gradient(180deg, rgba(252,251,249,1) 0%, rgba(252,251,249,0) 14%, rgba(252,251,249,0) 52%, rgba(20,15,10,0.88) 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 70, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable, { fontSize: 24 })}>The Travel Creator</div>
            <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: 212, lineHeight: 1, letterSpacing: -4, color: C.text, marginTop: 6 }}>ROADMAP</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 80, top: 520, width: 430 }}>
            <div style={eyebrow(C.goldReadable, { fontSize: 20, letterSpacing: 5 })}>Inklusive</div>
            <div style={{ ...coverLine(C.text, 40), marginTop: 10 }}>Pitch-Vorlagen</div>
            <div style={{ ...coverLine(C.text, 40), marginTop: 26 }}>Hotel-Liste</div>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 40, color: C.goldReadable, marginTop: 26 }}>Vom Gratis-Aufenthalt zum bezahlten Deal</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 90 }}>
            <Subtitle color={C.porcelain} width={880} align="center" size={32} />
            <Logo onInk width={440} style={{ marginTop: 40 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "12-sunrise",
    label: "Sonnenaufgang",
    render: async () => {
      const horizon = 1180;
      const reflections = Array.from({ length: 14 }, (_, i) => {
        const y = horizon + 30 + i * 34;
        const half = 220 - i * 13;
        return `<rect x="${600 - half}" y="${y}" width="${half * 2}" height="${5 - i * 0.25}" rx="3" fill="${C.goldLight}" opacity="${0.75 - i * 0.045}"/>`;
      }).join("");
      const body =
        `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140f0a"/><stop offset="0.45" stop-color="#3b2418"/><stop offset="0.8" stop-color="#a8643a"/><stop offset="1" stop-color="#e3b27a"/></linearGradient>` +
        `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c14"/><stop offset="1" stop-color="#140f0a"/></linearGradient>` +
        `<radialGradient id="glow"><stop offset="0" stop-color="#f3d39c" stop-opacity="0.9"/><stop offset="1" stop-color="#f3d39c" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="1200" height="${horizon}" fill="url(#sky)"/><circle cx="600" cy="${horizon}" r="520" fill="url(#glow)"/><circle cx="600" cy="${horizon}" r="190" fill="#f6dcae"/>` +
        `<rect y="${horizon}" width="1200" height="${1920 - horizon}" fill="url(#sea)"/><rect y="${horizon}" width="1200" height="2" fill="#f6dcae" opacity="0.8"/>${reflections}`;
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={svg(body)} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 170, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 44 }}>
              <Title size={160} color={C.porcelain} align="center" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 100 }}>
            <Subtitle color={C.onInkSoft} width={860} align="center" size={32} />
            <Logo onInk width={420} style={{ marginTop: 56 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "13-index",
    label: "Im Buch: Liste",
    render: async () => {
      const items = ["Pitch-Vorlagen", "Hotel-Strategie", "Hotel-Liste", "Bezahlte Kooperationen"];
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 140, left: 110, right: 110 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
              <div style={eyebrow(C.graphite, { fontSize: 22 })}>Ausgabe 01</div>
            </div>
            <div style={{ display: "flex", width: "100%", height: 3, backgroundColor: C.text, margin: "36px 0 60px" }} />
            <Title size={176} color={C.text} weight={500} />
            <div style={{ display: "flex", flexDirection: "column", marginTop: 110 }}>
              <div style={eyebrow(C.goldReadable, { fontSize: 22, marginBottom: 18 })}>Im Buch</div>
              {items.map((it, i) => (
                <div key={it} style={{ display: "flex", alignItems: "center", borderTop: `1.5px solid ${C.hairline}`, padding: "26px 0" }}>
                  <div style={{ display: "flex", width: 110, fontFamily: display, fontWeight: 300, fontSize: 44, color: C.gold }}>{`0${i + 1}`}</div>
                  <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 50, color: C.text }}>{it}</div>
                </div>
              ))}
              <div style={{ display: "flex", borderTop: `1.5px solid ${C.hairline}` }} />
            </div>
          </div>
          <Logo onInk={false} width={420} style={{ position: "absolute", left: 110, bottom: 96 }} />
        </div>
      );
    },
  },
  {
    name: "14-postcard",
    label: "Briefmarke & Stempel",
    render: async () => {
      const photo = await framePhoto(photos.pool, 560, 700, 0.55);
      // Perforation: dots in the ground colour punched along the stamp's edge.
      const holes: string[] = [];
      for (let x = 0; x <= 640; x += 28) holes.push(`<circle cx="${x}" cy="0" r="11"/>`, `<circle cx="${x}" cy="780" r="11"/>`);
      for (let y = 0; y <= 780; y += 28) holes.push(`<circle cx="0" cy="${y}" r="11"/>`, `<circle cx="640" cy="${y}" r="11"/>`);
      const perforation = svg(`<g fill="${C.alabaster}">${holes.join("")}</g>`, 640, 780);
      const waves = Array.from({ length: 5 }, (_, i) => `<path d="M 0 ${40 + i * 30} q 40 -18 80 0 t 80 0 t 80 0 t 80 0 t 80 0" fill="none" stroke="${C.graphite}" stroke-width="3" opacity="0.55"/>`).join("");
      const postmark =
        `<circle cx="160" cy="160" r="150" fill="none" stroke="${C.graphite}" stroke-width="4" opacity="0.6"/><circle cx="160" cy="160" r="112" fill="none" stroke="${C.graphite}" stroke-width="2" opacity="0.6"/>` +
        `<text x="160" y="150" text-anchor="middle" font-family="Helvetica, Arial" font-size="34" letter-spacing="6" fill="${C.graphite}" opacity="0.75">BERLIN</text>` +
        `<text x="160" y="196" text-anchor="middle" font-family="Helvetica, Arial" font-size="24" letter-spacing="4" fill="${C.graphite}" opacity="0.75">ROADMAP</text>`;
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <div style={{ display: "flex", position: "absolute", top: 210, left: 460, width: 640, height: 780, backgroundColor: C.porcelain, boxShadow: "0 18px 40px rgba(20,15,10,0.18)", transform: "rotate(4deg)" }}>
            <Img src={photo} width={560} height={700} style={{ top: 40, left: 40 }} />
            <Img src={perforation} width={640} height={780} style={{ top: 0, left: 0 }} />
          </div>
          <Img src={svg(postmark + `<g transform="translate(300 90)">${waves}</g>`, 720, 330)} width={720} height={330} style={{ top: 860, left: 100, transform: "rotate(-8deg)" }} />
          <div style={{ display: "flex", position: "absolute", top: 240, left: 110, width: 320 }}>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 46, lineHeight: 1.3, color: C.graphite }}>Grüße aus dem nächsten Fünf-Sterne-Hotel.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 1200, left: 110, right: 110 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 34 }}>
              <Title size={140} color={C.text} accent={C.goldReadable} />
            </div>
          </div>
          <Logo onInk={false} width={400} style={{ position: "absolute", right: 110, bottom: 96 }} />
        </div>
      );
    },
  },
  {
    name: "15-passport",
    label: "Reisepass, Goldprägung",
    render: async () => (
      <div style={{ ...fill, backgroundColor: "#1d2a25" }}>
        <div style={{ display: "flex", position: "absolute", top: 60, left: 60, right: 60, bottom: 60, border: `2px solid ${C.gold}`, opacity: 0.55 }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 220, left: 0, right: 0 }}>
          <div style={eyebrow(C.goldLight, { fontSize: 30, letterSpacing: 14 })}>Creator Pass</div>
          <div style={eyebrow(C.goldLight, { fontSize: 20, letterSpacing: 8, marginTop: 18, opacity: 0.8 })}>Pass · Passport · Pasaport</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", top: 560, left: 350, width: 500, height: 500, borderRadius: 500, border: `2px solid ${C.goldLight}` }}>
          <Mark onInk size={330} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 1190, left: 0, right: 0 }}>
          {T.title.map((l) => (
            <div key={l} style={{ display: "flex", fontFamily: serif, fontSize: 104, letterSpacing: 10, lineHeight: 1.1, color: C.goldLight, textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", position: "absolute", left: 0, right: 0, bottom: 150 }}>
          <Logo onInk width={400} style={{ opacity: 0.85 }} />
        </div>
      </div>
    ),
  },
  {
    name: "16-keycard",
    label: "Hotel-Schlüsselkarte",
    render: async () => (
      <div style={{ ...fill, backgroundColor: C.alabaster }}>
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 160, left: 110, right: 110 }}>
          <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
          {rule(C.gold, 120, { margin: "40px 0 52px" })}
          <Title size={156} color={C.text} accent={C.goldReadable} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "absolute",
            top: 1010,
            left: 200,
            width: 820,
            height: 516,
            borderRadius: 36,
            backgroundColor: C.ink,
            padding: "56px 64px",
            boxShadow: "0 30px 60px rgba(20,15,10,0.28)",
            transform: "rotate(-7deg)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Mark onInk size={96} />
            <div style={eyebrow(C.goldLight, { fontSize: 20, letterSpacing: 6 })}>Suite 001</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 64, color: C.porcelain }}>Welcome, Creator.</div>
            <div style={eyebrow(C.onInkSoft, { fontSize: 18, letterSpacing: 5, marginTop: 16 })}>Check-in · Pitch · Kooperation</div>
          </div>
          <div style={{ display: "flex", position: "absolute", right: 64, bottom: 64, width: 120, height: 80, borderRadius: 10, backgroundImage: `linear-gradient(135deg, ${C.goldLight}, ${C.gold})` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1660, left: 0, right: 0 }}>
          <Subtitle color={C.graphite} width={900} align="center" size={28} />
        </div>
        <Logo onInk={false} width={380} style={{ position: "absolute", left: 410, bottom: 70 }} />
      </div>
    ),
  },
  {
    name: "17-colorblock",
    label: "Farbblock Gold/Tinte",
    render: async () => (
      <div style={{ ...fill, backgroundColor: C.ink }}>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, height: 1120, backgroundColor: C.gold }} />
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 150, left: 100, right: 100 }}>
          <div style={eyebrow(C.ink)}>{T.eyebrow}</div>
          <div style={{ display: "flex", marginTop: 300 }}>
            <Title size={210} color={C.ink} weight={500} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 1220, left: 100, right: 100 }}>
          <Subtitle color={C.porcelain} width={900} size={42} />
          {rule(C.gold, 120, { marginTop: 60 })}
          <div style={eyebrow(C.goldLight, { fontSize: 22, letterSpacing: 5, marginTop: 40 })}>Inkl. Pitch-Templates & Hotel-Liste</div>
        </div>
        <Logo onInk width={440} style={{ position: "absolute", left: 100, bottom: 100 }} />
      </div>
    ),
  },
  {
    name: "18-filmstrip",
    label: "Filmstreifen",
    render: async () => {
      const frames = await Promise.all([photos.sea, photos.courtyard, photos.restaurant].map((p) => framePhoto(p, 420, 300, 0.5)));
      const holes = Array.from({ length: 30 }, (_, i) => `<rect x="${20 + i * 46}" y="18" width="26" height="20" rx="4"/><rect x="${20 + i * 46}" y="382" width="26" height="20" rx="4"/>`).join("");
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 160, left: 110, right: 110 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            {rule(C.gold, 120, { margin: "40px 0 52px" })}
            <Title size={156} color={C.text} accent={C.goldReadable} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: 1030, left: -60, width: 1380, height: 420, backgroundColor: "#0d0a07", transform: "rotate(-5deg)" }}>
            <Img src={svg(`<g fill="${C.porcelain}" opacity="0.85">${holes}</g>`, 1380, 420)} width={1380} height={420} style={{ top: 0, left: 0 }} />
            {frames.map((f, i) => (
              <Img key={i} src={f} width={420} height={300} style={{ top: 60, left: 90 + i * 440 }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1590, left: 0, right: 0 }}>
            <Subtitle color={C.graphite} width={900} align="center" size={30} />
          </div>
          <Logo onInk={false} width={400} style={{ position: "absolute", left: 400, bottom: 80 }} />
        </div>
      );
    },
  },
  {
    name: "19-horizon-mark",
    label: "Horizont aus dem Logo",
    render: async () => {
      // The mark's own horizon, enlarged: two teal needles and the gold sun between them.
      const y = 960;
      const body =
        `<line x1="80" y1="${y}" x2="470" y2="${y}" stroke="#38787b" stroke-width="5" stroke-linecap="round"/>` +
        `<line x1="730" y1="${y}" x2="1120" y2="${y}" stroke="#38787b" stroke-width="5" stroke-linecap="round"/>` +
        `<circle cx="600" cy="${y}" r="92" fill="${C.gold}"/>` +
        `<line x1="600" y1="300" x2="600" y2="${y - 150}" stroke="${C.text}" stroke-width="1.5" opacity="0.25"/>`;
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <Img src={svg(body)} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 160, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 1150, left: 0, right: 0 }}>
            <Title size={128} color={C.text} align="center" />
            <div style={{ display: "flex", marginTop: 44 }}>
              <Subtitle color={C.graphite} width={860} align="center" size={30} />
            </div>
          </div>
          <Logo onInk={false} width={380} style={{ position: "absolute", left: 410, bottom: 80 }} />
        </div>
      );
    },
  },
  {
    name: "20-polaroids",
    label: "Polaroid-Collage",
    render: async () => {
      const shots = await Promise.all([photos.pool, photos.courtyard, photos.sea].map((p) => framePhoto(p, 440, 440, 0.5)));
      const place = [
        { top: 960, left: 90, rot: -9 },
        { top: 900, left: 640, rot: 7 },
        { top: 1240, left: 360, rot: -2 },
      ];
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 150, left: 110, right: 110 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            {rule(C.gold, 120, { margin: "40px 0 52px" })}
            <Title size={150} color={C.text} accent={C.goldReadable} />
            <div style={{ display: "flex", marginTop: 40 }}>
              <Subtitle color={C.graphite} width={900} size={30} />
            </div>
          </div>
          {shots.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                position: "absolute",
                top: place[i].top,
                left: place[i].left,
                width: 480,
                height: 560,
                backgroundColor: "#ffffff",
                boxShadow: "0 16px 36px rgba(20,15,10,0.22)",
                transform: `rotate(${place[i].rot}deg)`,
              }}
            >
              <Img src={s} width={440} height={440} style={{ top: 20, left: 20 }} />
            </div>
          ))}
          <Logo onInk={false} width={360} style={{ position: "absolute", right: 90, bottom: 70 }} />
        </div>
      );
    },
  },
];

/** Third round: Atilla in the courtyard (social/assets, gitignored), 1500×2000, so it can fill the cover. */
const hero: PhotoSpec = { src: "social/assets/ebook-atilla-courtyard.jpg", focus: [0.5, 0.47] };

const withAtilla: Cover[] = [
  {
    name: "21-sky",
    label: "Titel im Himmel",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1920, 0.47);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ ...fill, backgroundImage: "linear-gradient(180deg, rgba(20,15,10,0.5) 0%, rgba(20,15,10,0.15) 30%, rgba(20,15,10,0) 42%, rgba(20,15,10,0) 70%, rgba(20,15,10,0.75) 88%, rgba(20,15,10,0.92) 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 100, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 28 }}>
              <Title size={132} color={C.porcelain} align="center" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 90 }}>
            <Subtitle color={C.porcelain} width={900} align="center" size={32} />
            <Logo onInk width={420} style={{ marginTop: 44 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "22-band",
    label: "Porzellan oben, Foto unten",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1300, 0.36);
      return (
        <div style={{ ...fill, backgroundColor: C.porcelain }}>
          <Img src={photo} width={1200} height={1300} style={{ left: 0, bottom: 0 }} />
          <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 1300, backgroundImage: "linear-gradient(180deg, rgba(252,251,249,1) 0%, rgba(252,251,249,0) 16%, rgba(252,251,249,0) 70%, rgba(20,15,10,0.92) 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 110, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 30 }}>
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, letterSpacing: -2, color: C.text }}>The Travel Creator</div>
            </div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 112, letterSpacing: -2, color: C.goldReadable }}>Roadmap</div>
            <div style={{ display: "flex", marginTop: 26 }}>
              <Subtitle color={C.graphite} width={860} align="center" size={28} />
            </div>
          </div>
          <Logo onInk width={400} style={{ position: "absolute", left: 400, bottom: 70 }} />
        </div>
      );
    },
  },
  {
    name: "23-passepartout",
    label: "Galerie-Print mit Atilla",
    render: async () => {
      const photo = await framePhoto(hero, 900, 1080, 0.45);
      return (
        <div style={{ ...fill, backgroundColor: C.alabaster }}>
          <Logo onInk={false} width={400} style={{ position: "absolute", left: 400, top: 96 }} />
          <div style={{ display: "flex", position: "absolute", top: 194, left: 134, width: 932, height: 1112, border: `1.5px solid ${C.gold}` }} />
          <Img src={photo} width={900} height={1080} style={{ top: 210, left: 150 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 1370, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldReadable)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 26 }}>
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 100, letterSpacing: -2, color: C.text }}>The Travel Creator</div>
            </div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 100, letterSpacing: -2, color: C.goldReadable }}>Roadmap</div>
            <div style={{ display: "flex", marginTop: 28 }}>
              <Subtitle color={C.graphite} width={860} align="center" size={28} />
            </div>
          </div>
        </div>
      );
    },
  },
  {
    name: "24-magazine",
    label: "Magazin mit Atilla",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1920, 0.47);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ ...fill, backgroundImage: "linear-gradient(180deg, rgba(20,15,10,0.35) 0%, rgba(20,15,10,0) 25%, rgba(20,15,10,0) 72%, rgba(20,15,10,0.8) 100%)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 70, left: 0, right: 0 }}>
            <div style={eyebrow(C.porcelain, { fontSize: 24 })}>The Travel Creator</div>
            <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: 212, lineHeight: 1, letterSpacing: -4, color: C.porcelain, marginTop: 6 }}>ROADMAP</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 70, top: 440, width: 330 }}>
            <div style={eyebrow(C.goldLight, { fontSize: 20, letterSpacing: 5 })}>Inklusive</div>
            <div style={{ ...coverLine(C.porcelain, 38), marginTop: 10 }}>Pitch-Vorlagen</div>
            <div style={{ ...coverLine(C.porcelain, 38), marginTop: 20 }}>Hotel-Liste</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", position: "absolute", right: 70, top: 440, width: 360 }}>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 40, lineHeight: 1.25, color: C.porcelain, textAlign: "right" }}>Vom Gratis-Aufenthalt zum bezahlten Deal</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 80 }}>
            <Subtitle color={C.porcelain} width={900} align="center" size={30} />
            <Logo onInk width={400} style={{ marginTop: 36 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "25-arch",
    label: "Bogen auf Tinte",
    render: async () => {
      const photo = await framePhoto(hero, 760, 1060, 0.45);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 120, left: 0, right: 0 }}>
            <div style={eyebrow(C.goldLight)}>{T.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 28 }}>
              <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 100, letterSpacing: -2, color: C.porcelain }}>The Travel Creator</div>
            </div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 100, letterSpacing: -2, color: C.goldLight }}>Roadmap</div>
          </div>
          <div style={{ display: "flex", position: "absolute", top: 446, left: 206, width: 788, height: 1088, borderRadius: "394px 394px 0 0", border: `1.5px solid ${C.gold}` }} />
          <div style={{ display: "flex", position: "absolute", top: 460, left: 220, width: 760, height: 1060, borderRadius: "380px 380px 0 0", overflow: "hidden" }}>
            <Img src={photo} width={760} height={1060} style={{ top: 0, left: 0 }} />
          </div>
          <Badge color={C.goldLight} size={250} style={{ top: 1330, right: 90, backgroundColor: C.ink }} />
          <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 1590, left: 0, right: 0 }}>
            <Subtitle color={C.onInkSoft} width={880} align="center" size={30} />
          </div>
          <Logo onInk width={400} style={{ position: "absolute", left: 400, bottom: 80 }} />
        </div>
      );
    },
  },
  {
    name: "26-cinema",
    label: "Kino-Format",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1100, 0.42);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1100} style={{ top: 290, left: 0 }} />
          <div style={{ display: "flex", position: "absolute", top: 290, left: 0, width: 1200, height: 1100, backgroundImage: "linear-gradient(90deg, rgba(20,15,10,0.45) 0%, rgba(20,15,10,0) 22%, rgba(20,15,10,0) 78%, rgba(20,15,10,0.45) 100%)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "absolute", top: 110, left: 90, right: 90 }}>
            <div style={eyebrow(C.goldLight, { fontSize: 22, letterSpacing: 7 })}>Atilla Barbarossa präsentiert</div>
            <Mark onInk size={84} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: 230, left: 90, right: 90, height: 1.5, backgroundColor: C.gold, opacity: 0.6 }} />
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 1440, left: 90, right: 90 }}>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 124, letterSpacing: -2, lineHeight: 1, color: C.porcelain }}>The Travel Creator</div>
            <div style={{ display: "flex", fontFamily: display, fontWeight: 300, fontSize: 124, letterSpacing: -2, lineHeight: 1.05, color: C.goldLight }}>Roadmap</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "absolute", left: 90, right: 90, bottom: 70 }}>
            <Subtitle color={C.onInkSoft} width={640} size={26} />
            <div style={eyebrow(C.goldLight, { fontSize: 18, letterSpacing: 5 })}>Das E-Book</div>
          </div>
        </div>
      );
    },
  },
];

/** Fourth round: 24 refined, with a larger kicker and benefits, set off by a soft shadow to read on the sky. */
const shadow = "0 2px 18px rgba(20,15,10,0.55)";
const kicker = (size: number, extra?: object) => eyebrow(C.porcelain, { fontSize: size, letterSpacing: size * 0.32, textShadow: shadow, ...extra });
const masthead = (size = 212) => (
  <div style={{ display: "flex", fontFamily: serif, fontWeight: 600, fontSize: size, lineHeight: 1, letterSpacing: -4, color: C.porcelain, textShadow: "0 4px 30px rgba(20,15,10,0.35)" }}>ROADMAP</div>
);
const skyShade = "linear-gradient(180deg, rgba(20,15,10,0.55) 0%, rgba(20,15,10,0.18) 24%, rgba(20,15,10,0) 36%, rgba(20,15,10,0) 66%, rgba(20,15,10,0.85) 90%, rgba(20,15,10,0.95) 100%)";

const magazine: Cover[] = [
  {
    name: "27-magazine-a",
    label: "Magazin A: große Zeilen",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1920, 0.47);
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ ...fill, backgroundImage: skyShade }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 64, left: 0, right: 0 }}>
            <div style={kicker(44)}>The Travel Creator</div>
            <div style={{ display: "flex", marginTop: 4 }}>{masthead()}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 64, top: 400, width: 380 }}>
            <div style={eyebrow(C.goldLight, { fontSize: 24, letterSpacing: 6, textShadow: shadow })}>Inklusive</div>
            <div style={{ ...coverLine(C.porcelain, 50), marginTop: 12, textShadow: shadow }}>Pitch-Vorlagen</div>
            <div style={{ ...coverLine(C.porcelain, 50), marginTop: 10, textShadow: shadow }}>Hotel-Liste</div>
          </div>
          <div style={{ display: "flex", position: "absolute", right: 64, top: 400, width: 400 }}>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 52, lineHeight: 1.2, color: C.porcelain, textAlign: "right", textShadow: shadow }}>Vom Gratis-Aufenthalt zum bezahlten Deal</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 80 }}>
            <Subtitle color={C.porcelain} width={980} align="center" size={36} />
            <Logo onInk width={420} style={{ marginTop: 40 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "28-magazine-b",
    label: "Magazin B: Linien & Siegel",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1920, 0.47);
      const line = <div style={{ display: "flex", width: 150, height: 2, backgroundColor: C.goldLight }} />;
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ ...fill, backgroundImage: skyShade }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 64, left: 0, right: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {line}
              <div style={kicker(40, { color: C.goldLight })}>The Travel Creator</div>
              {line}
            </div>
            <div style={{ display: "flex", marginTop: 6 }}>{masthead()}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 64, top: 410, width: 420 }}>
            {["Pitch-Vorlagen", "Hotel-Liste", "Bezahlte Deals"].map((b, i) => (
              <div key={b} style={{ display: "flex", alignItems: "baseline", marginTop: i ? 14 : 0 }}>
                <div style={{ display: "flex", width: 64, fontFamily: display, fontWeight: 500, fontSize: 34, color: C.goldLight, textShadow: shadow }}>{`0${i + 1}`}</div>
                <div style={{ ...coverLine(C.porcelain, 46), textShadow: shadow }}>{b}</div>
              </div>
            ))}
          </div>
          <Badge color={C.porcelain} size={290} style={{ top: 400, right: 64, backgroundColor: "rgba(20,15,10,0.35)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 80 }}>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 54, color: C.goldLight, marginBottom: 22 }}>Vom Gratis-Aufenthalt zum bezahlten Deal</div>
            <Subtitle color={C.porcelain} width={980} align="center" size={32} />
            <Logo onInk width={400} style={{ marginTop: 36 }} />
          </div>
        </div>
      );
    },
  },
  {
    name: "29-magazine-c",
    label: "Magazin C: Leiste unten",
    render: async () => {
      const photo = await framePhoto(hero, 1200, 1920, 0.47);
      const benefits = ["Pitch-Vorlagen", "Hotel-Liste", "Bezahlte Deals"];
      return (
        <div style={{ ...fill, backgroundColor: C.ink }}>
          <Img src={photo} width={1200} height={1920} style={{ top: 0, left: 0 }} />
          <div style={{ ...fill, backgroundImage: skyShade }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", top: 70, left: 0, right: 0 }}>
            {masthead(226)}
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 14 }}>
              <div style={{ display: "flex", width: 90, height: 2, backgroundColor: C.porcelain }} />
              <div style={kicker(46)}>The Travel Creator</div>
              <div style={{ display: "flex", width: 90, height: 2, backgroundColor: C.porcelain }} />
            </div>
            <div style={{ display: "flex", fontFamily: serif, fontStyle: "italic", fontSize: 50, color: C.porcelain, marginTop: 26, textShadow: shadow }}>Vom Gratis-Aufenthalt zum bezahlten Deal</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 0, right: 0, bottom: 70 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 40px", border: `1.5px solid ${C.goldLight}`, borderRadius: 999, backgroundColor: "rgba(20,15,10,0.45)" }}>
              {benefits.map((b, i) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                  {i > 0 && <div style={{ display: "flex", width: 10, height: 10, borderRadius: 10, backgroundColor: C.goldLight }} />}
                  <div style={{ ...coverLine(C.porcelain, 38) }}>{b}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 34 }}>
              <Subtitle color={C.porcelain} width={980} align="center" size={32} />
            </div>
            <Logo onInk width={400} style={{ marginTop: 34 }} />
          </div>
        </div>
      );
    },
  },
];

/** The chosen cover (October 2026). `final` renders it for Tentary and for the site. */
const CHOSEN = "28-magazine-b";

/**
 * Tentary gets 1600×2560 (the common e-book size): the 1200×1920 layout drawn at 4/3, so type and
 * lines stay sharp. The site gets public/roadmap/cover.webp at 960×1536, the size the pages declare.
 */
async function final(all: Cover[]) {
  const cover = all.find((c) => c.name === CHOSEN);
  if (!cover) throw new Error(`No cover named ${CHOSEN}`);
  const scale = 4 / 3;
  const big = { width: Math.round(SIZE.width * scale), height: Math.round(SIZE.height * scale) };
  const element = (
    <div style={{ display: "flex", width: big.width, height: big.height, position: "relative" }}>
      {/* next/og scales around the centre whatever the origin: centre the layout in the large frame. */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: (big.height - SIZE.height) / 2,
          left: (big.width - SIZE.width) / 2,
          width: SIZE.width,
          height: SIZE.height,
          transform: `scale(${scale})`,
        }}
      >
        {await cover.render()}
      </div>
    </div>
  );
  const png = join(OUT, "final", `roadmap-cover-${big.width}x${big.height}.png`);
  await renderPng(element, png, big);
  const webp = join(__dirname, "..", "public", "roadmap", "cover.webp");
  await sharp(png).resize(960, 1536, { kernel: "lanczos3" }).webp({ quality: 78 }).toFile(webp);
  console.log(png);
  console.log(webp);
}

async function main() {
  const all = [...covers, ...more, ...withAtilla, ...magazine];
  if (process.argv[2] === "final") return final(all);
  const only = process.argv[2]; // e.g. "11" renders 11–20 only
  const from = only ? Number(only) - 1 : 0;
  const files: string[] = [];
  for (const c of all.slice(from)) {
    const file = join(OUT, `${c.name}.png`);
    await renderPng(await c.render(), file, SIZE);
    files.push(file);
    console.log(file);
  }
  // One overview per ten: two rows of five at a quarter size, numbered.
  const w = 300;
  const h = 480;
  const gap = 36;
  const label = 48;
  for (let set = 0; set * 10 < files.length; set++) {
    const chunk = files.slice(set * 10, set * 10 + 10);
    const tiles = await Promise.all(
      chunk.map(async (f, i) => {
        const c = all[from + set * 10 + i];
        const caption = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${label}"><text x="0" y="32" font-family="Helvetica, Arial" font-size="22" fill="${C.text}">${c.name.slice(0, 2)} · ${c.label.replace(/&/g, "&amp;")}</text></svg>`,
        );
        const tile = await sharp(f).resize(w, h).png().toBuffer();
        const x = gap + (i % 5) * (w + gap);
        const y = gap + Math.floor(i / 5) * (h + label + gap);
        return [
          { input: tile, left: x, top: y },
          { input: caption, left: x, top: y + h },
        ];
      }),
    );
    const first = all[from + set * 10].name.slice(0, 2);
    const sheet = join(OUT, `overview-${first}.png`);
    await sharp({ create: { width: gap + 5 * (w + gap), height: gap + 2 * (h + label + gap), channels: 3, background: "#e9e4da" } })
      .composite(tiles.flat())
      .png()
      .toFile(sheet);
    console.log(sheet);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
