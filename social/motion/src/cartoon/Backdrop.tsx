import React, { useId } from "react";

// The sets. Each place is drawn from shapes in layers at different depths, so a camera move
// gives parallax; each is lit four ways by one tint (TIMES), so the same set serves a morning
// arrival and a night out. Drawn in a space 1000 units high with the ground at GROUND; world x
// runs from 0 to WORLD and beyond on both sides, so the camera never finds an edge.

export const GROUND = 790;
export const WORLD = 2400;
export const PLACES = ["berlin", "istanbul", "airport", "seaside", "mountains", "lounge"] as const;
export type Place = (typeof PLACES)[number];
export const TIME_IDS = ["dawn", "day", "dusk", "night"] as const;
export type TimeOfDay = (typeof TIME_IDS)[number];

interface Light {
  sky: [string, string];
  /** Everything in the set is pulled this far towards this colour. */
  tint: string;
  strength: number;
  sun: { x: number; y: number; r: number; colour: string; moon?: boolean };
  /** Windows and lamps are on. */
  lit: boolean;
  /** CSS filter for the characters, so they stand in the same light as the set. */
  figure: string;
}

export const TIMES: Record<TimeOfDay, Light> = {
  dawn: { sky: ["#7fa3c4", "#f9d8b4"], tint: "#f2b98a", strength: 0.16, sun: { x: 0.7, y: 600, r: 50, colour: "#ffe2a8" }, lit: false, figure: "saturate(0.95) sepia(0.08)" },
  day: { sky: ["#63aadc", "#e3f1fa"], tint: "#ffffff", strength: 0, sun: { x: 0.78, y: 170, r: 42, colour: "#fff6cf" }, lit: false, figure: "none" },
  dusk: { sky: ["#3c4a82", "#f5a36c"], tint: "#c9603f", strength: 0.3, sun: { x: 0.28, y: 640, r: 58, colour: "#ffb574" }, lit: true, figure: "brightness(0.9) sepia(0.2) saturate(1.1)" },
  night: { sky: ["#0b1230", "#2b3766"], tint: "#141d3d", strength: 0.6, sun: { x: 0.76, y: 160, r: 36, colour: "#f3f0e2", moon: true }, lit: true, figure: "brightness(0.66) saturate(0.8)" },
};

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const towards = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const css = (v: number[]) => `rgb(${v.map(Math.round).join(", ")})`;

/** Repeatable pseudo-random numbers: the same skyline on every frame. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

interface Ctx {
  t: number;
  light: Light;
  /** A colour in this scene's light. */
  c: (hex: string, lighten?: number) => string;
  glow: string;
}

const WINDOW_LIT = "#ffd98a";

/** A block of flats with a grid of windows; some are lit at dusk and night. */
const Building: React.FC<{ x: number; w: number; h: number; wall: string; ctx: Ctx; seed: number; roof?: string }> = ({ x, w, h, wall, ctx, seed, roof = "#7a4a3a" }) => {
  const r = rng(seed);
  const cols = Math.max(2, Math.floor(w / 62));
  const rows = Math.max(2, Math.floor(h / 78));
  const gx = w / cols;
  const gy = (h - 40) / rows;
  return (
    <g transform={`translate(${x} ${GROUND - h})`}>
      <rect width={w} height={h} fill={ctx.c(wall)} />
      <rect x={-6} y={-12} width={w + 12} height={16} fill={ctx.c(roof)} />
      <rect width={12} height={h} fill="#000" opacity={0.08} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const lit = ctx.light.lit && r() > 0.45;
        return <rect key={i} x={(i % cols) * gx + gx * 0.26} y={Math.floor(i / cols) * gy + 22} width={gx * 0.48} height={gy * 0.56} rx={3} fill={lit ? WINDOW_LIT : ctx.c("#6f8798")} opacity={lit ? 0.95 : 0.8} />;
      })}
    </g>
  );
};

const Lamp: React.FC<{ x: number; ctx: Ctx }> = ({ x, ctx }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    {ctx.light.lit && <circle cx={0} cy={-232} r={90} fill={ctx.glow} />}
    <rect x={-4} y={-225} width={8} height={225} fill={ctx.c("#3a3f44")} />
    <path d="M-20 -225 Q0 -250 20 -225 Z" fill={ctx.c("#3a3f44")} />
    <circle cx={0} cy={-222} r={9} fill={ctx.light.lit ? "#fff0c0" : ctx.c("#e6e2d8")} />
  </g>
);

const Tree: React.FC<{ x: number; s?: number; ctx: Ctx; sway: number }> = ({ x, s = 1, ctx, sway }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
    <rect x={-7} y={-150} width={14} height={150} fill={ctx.c("#6b4f3a")} />
    <g transform={`rotate(${sway.toFixed(2)} 0 -150)`}>
      <circle cx={0} cy={-210} r={74} fill={ctx.c("#5d8a5a")} />
      <circle cx={-44} cy={-176} r={48} fill={ctx.c("#517a4f")} />
      <circle cx={42} cy={-182} r={52} fill={ctx.c("#6a9a64")} />
    </g>
  </g>
);

type Layers = { far: React.ReactNode; mid: React.ReactNode; near: React.ReactNode; ground: React.ReactNode; front?: React.ReactNode };

const span = (step: number, from = -600, to = WORLD + 600) => Array.from({ length: Math.ceil((to - from) / step) }, (_, i) => from + i * step);

function berlin(ctx: Ctx): Layers {
  const r = rng(7);
  const skyline = span(118).map((x, i) => <rect key={i} x={x} y={GROUND - 110 - r() * 190} width={90 + r() * 50} height={320} fill={ctx.c("#a9b9c7", 0.25)} />);
  const walls = ["#e7d9c2", "#d7c1a6", "#cfd8dc", "#e2cdb8", "#c9b8a4"];
  return {
    far: (
      <g>
        {skyline}
        {/* the television tower */}
        <g transform="translate(1050 0)" fill={ctx.c("#93a4b4", 0.15)}>
          <path d={`M-9 ${GROUND} L-5 330 L5 330 L9 ${GROUND} Z`} />
          <circle cx={0} cy={318} r={36} />
          <rect x={-16} y={270} width={32} height={22} rx={6} />
          <path d="M-3 272 L0 120 L3 272 Z" />
        </g>
      </g>
    ),
    mid: (
      <g>
        {span(300).map((x, i) => (i % 6 === 4 ? null : <Building key={i} x={x} w={270} h={300 + ((i * 53) % 90)} wall={walls[i % walls.length]} ctx={ctx} seed={i + 3} />))}
        {/* the gate: six columns under an attic */}
        <g transform={`translate(${-600 + 4 * 300 + 6} ${GROUND})`} fill={ctx.c("#dccdae")}>
          <rect x={0} y={-250} width={258} height={46} />
          <rect x={30} y={-285} width={198} height={38} />
          <path d="M112 -285 L129 -322 L146 -285 Z" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={8 + i * 46} y={-204} width={18} height={204} />
          ))}
          <rect x={0} y={-12} width={258} height={12} />
        </g>
      </g>
    ),
    near: (
      <g>
        {span(520, -400).map((x, i) => (
          <React.Fragment key={i}>
            <Tree x={x} ctx={ctx} sway={Math.sin(ctx.t * 1.1 + i) * 1.6} />
            <Lamp x={x + 260} ctx={ctx} />
          </React.Fragment>
        ))}
      </g>
    ),
    ground: (
      <g>
        <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#cfc7ba")} />
        <rect x={-2000} y={GROUND + 74} width={8000} height={10} fill={ctx.c("#a9a195")} />
        <rect x={-2000} y={GROUND + 84} width={8000} height={180} fill={ctx.c("#6f6c6a")} />
      </g>
    ),
  };
}

function istanbul(ctx: Ctx): Layers {
  const stone = ctx.c("#8d9db3", 0.2);
  const mosque = (x: number, s: number) => (
    <g transform={`translate(${x} 610) scale(${s})`} fill={stone}>
      <path d="M-90 0 A90 84 0 0 1 90 0 Z" />
      <path d="M-150 0 A52 48 0 0 1 -46 0 Z M46 0 A52 48 0 0 1 150 0 Z" />
      <rect x={-160} y={0} width={320} height={60} />
      {[-190, -120, 120, 190].map((m) => (
        <path key={m} d={`M${m - 6} 60 L${m - 4} -150 L${m} -196 L${m + 4} -150 L${m + 6} 60 Z`} />
      ))}
      <path d="M-2 -84 L0 -112 L2 -84 Z" />
    </g>
  );
  const boat = ((ctx.t * 16) % 3400) - 500;
  return {
    far: (
      <g>
        <path d={`M-800 660 Q-300 560 200 630 T1100 600 T2100 620 T3200 610 L3200 ${GROUND} L-800 ${GROUND} Z`} fill={ctx.c("#9fb0c4", 0.3)} />
        {mosque(520, 0.9)}
        {mosque(1560, 0.7)}
        {/* the tower over the old quarter */}
        <g transform="translate(1050 640)" fill={stone}>
          <rect x={-22} y={-150} width={44} height={150} />
          <rect x={-27} y={-166} width={54} height={18} />
          <path d="M-24 -166 L0 -230 L24 -166 Z" />
        </g>
      </g>
    ),
    mid: (
      <g>
        <rect x={-2000} y={650} width={8000} height={GROUND - 650} fill={ctx.c("#4f93ad")} />
        {span(170, -900, 3400).map((x, i) => (
          <rect key={i} x={x + Math.sin(ctx.t * 0.9 + i * 1.7) * 26} y={668 + ((i * 37) % 100)} width={70 + (i % 3) * 30} height={3} rx={1.5} fill="#fff" opacity={0.28} />
        ))}
        {/* a ferry crossing */}
        <g transform={`translate(${boat.toFixed(1)} ${(700 + Math.sin(ctx.t * 1.6) * 2).toFixed(1)})`}>
          <path d="M0 0 L190 0 L172 30 L14 30 Z" fill={ctx.c("#f2ede3")} />
          <rect x={34} y={-26} width={112} height={26} fill={ctx.c("#e2dccf")} />
          <rect x={92} y={-50} width={18} height={24} fill={ctx.c("#b5483c")} />
          <rect x={0} y={20} width={190} height={5} fill={ctx.c("#b5483c")} />
        </g>
      </g>
    ),
    near: (
      <g>
        {span(150, -450).map((x, i) => (
          <rect key={i} x={x} y={GROUND - 52} width={9} height={52} fill={ctx.c("#4a443d")} />
        ))}
        <rect x={-2000} y={GROUND - 54} width={8000} height={7} fill={ctx.c("#4a443d")} />
        {span(640, -200).map((x, i) => (
          <Lamp key={i} x={x} ctx={ctx} />
        ))}
        {/* gulls */}
        {[0, 1, 2].map((i) => {
          const x = ((ctx.t * (38 + i * 9) + i * 700) % 3200) - 300;
          const flap = Math.sin(ctx.t * 7 + i * 2) * 9;
          return <path key={i} d={`M${x - 20} ${300 + i * 60 - flap} Q${x - 8} ${292 + i * 60} ${x} ${302 + i * 60} Q${x + 8} ${292 + i * 60} ${x + 20} ${300 + i * 60 - flap}`} stroke={ctx.c("#f4f1ea")} strokeWidth={4} strokeLinecap="round" fill="none" />;
        })}
      </g>
    ),
    ground: <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#cdbfa8")} />,
  };
}

function airport(ctx: Ctx): Layers {
  // A departure every nine seconds.
  const k = (ctx.t % 9) / 9;
  const plane = { x: 200 + k * 2300, y: 690 - k * k * 620, turn: -6 - k * 18 };
  return {
    far: (
      <g>
        <g transform="translate(1700 0)" fill={ctx.c("#aab6c0", 0.2)}>
          <path d={`M-14 ${GROUND} L-9 420 L9 420 L14 ${GROUND} Z`} />
          <path d="M-46 420 L-34 366 L34 366 L46 420 Z" />
          <rect x={-40} y={350} width={80} height={18} rx={5} />
        </g>
        {span(520, -300).map((x, i) => (
          <path key={i} d={`M${x} ${GROUND} L${x} 690 Q${x + 150} 640 ${x + 300} 690 L${x + 300} ${GROUND} Z`} fill={ctx.c("#b9c3cb", 0.2)} />
        ))}
        <g transform={`translate(${plane.x.toFixed(1)} ${plane.y.toFixed(1)}) rotate(${plane.turn.toFixed(1)}) scale(1.1)`}>
          <path d="M-70 0 Q-74 -12 -50 -13 L48 -13 Q76 -9 80 0 Q76 9 48 12 L-50 12 Q-70 11 -70 0 Z" fill={ctx.c("#f6f4ee")} />
          <path d="M-8 4 L-46 44 L-26 44 L22 6 Z" fill={ctx.c("#d9dde0")} />
          <path d="M-52 -12 L-72 -48 L-56 -48 L-34 -12 Z" fill={ctx.c("#b38b59")} />
          <rect x={-30} y={-6} width={78} height={4} rx={2} fill={ctx.c("#5d7f96")} />
        </g>
      </g>
    ),
    mid: (
      <g>
        {/* glass: the sky and the departing plane show through it */}
        <rect x={-2000} y={430} width={8000} height={GROUND - 430} fill={ctx.c("#a8cbdc")} opacity={0.5} />
        <rect x={-2000} y={430} width={8000} height={120} fill="#fff" opacity={ctx.light.lit ? 0.04 : 0.16} />
        {span(170, -900, 3400).map((x, i) => (
          <rect key={i} x={x} y={430} width={8} height={GROUND - 430} fill={ctx.c("#e4eaed")} />
        ))}
        <rect x={-2000} y={600} width={8000} height={7} fill={ctx.c("#e4eaed")} />
        <path d={`M-2000 436 Q1200 360 6000 436 L6000 400 Q1200 324 -2000 400 Z`} fill={ctx.c("#dfe5e8")} />
        {ctx.light.lit && <rect x={-2000} y={436} width={8000} height={GROUND - 436} fill={WINDOW_LIT} opacity={0.14} />}
      </g>
    ),
    near: (
      <g>
        {span(380, -300).map((x, i) => (
          <rect key={i} x={x} y={GROUND - 46} width={14} height={46} rx={6} fill={ctx.c("#b38b59")} />
        ))}
        {/* the departures sign: a pictogram, no lettering */}
        {span(1100, 200).map((x, i) => (
          <g key={i} transform={`translate(${x} ${GROUND - 330})`}>
            <rect x={-5} y={0} width={10} height={330} fill={ctx.c("#4a4f55")} />
            <rect x={-70} y={-70} width={140} height={80} rx={10} fill={ctx.c("#1f2a33")} />
            <path d="M-34 -22 L22 -42 Q36 -46 40 -38 Q40 -32 28 -27 L-6 -12 L-22 -8 L-14 -18 Z" fill="#ffd98a" />
          </g>
        ))}
      </g>
    ),
    ground: (
      <g>
        <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#d9d3c9")} />
        <rect x={-2000} y={GROUND + 60} width={8000} height={8} fill={ctx.c("#b38b59")} />
      </g>
    ),
  };
}

function seaside(ctx: Ctx): Layers {
  const palm = (x: number, s: number, i: number) => (
    <g key={i} transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <path d="M-10 0 Q-34 -180 16 -330 L30 -326 Q-8 -180 12 0 Z" fill={ctx.c("#8a6a48")} />
      <g transform={`translate(22 -330) rotate(${(Math.sin(ctx.t * 1.3 + i) * 3).toFixed(2)})`} fill={ctx.c("#3f8a5c")}>
        {[-150, -110, -60, -20, 30, 70].map((a, j) => (
          <path key={j} d="M0 0 Q70 -46 150 8 Q78 -8 0 12 Z" transform={`rotate(${a + Math.sin(ctx.t * 1.7 + j) * 2.5})`} opacity={j % 2 ? 0.88 : 1} />
        ))}
      </g>
    </g>
  );
  return {
    far: (
      <g>
        <rect x={-2000} y={610} width={8000} height={GROUND - 610} fill={ctx.c("#3f9fb8")} />
        <rect x={-2000} y={610} width={8000} height={34} fill={ctx.c("#68b9cc")} />
        <path d="M1500 610 Q1640 560 1790 590 Q1880 572 1960 610 Z" fill={ctx.c("#7fa894", 0.25)} />
        {span(190, -900, 3400).map((x, i) => (
          <path key={i} d={`M${x + Math.sin(ctx.t * 0.8 + i) * 30} ${650 + ((i * 41) % 110)} q22 -9 44 0 q22 9 44 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.35} />
        ))}
        {/* a sail on the horizon */}
        <g transform={`translate(${(700 + ctx.t * 9).toFixed(1)} ${(626 + Math.sin(ctx.t * 1.4) * 2).toFixed(1)})`}>
          <path d="M0 0 L0 -74 L44 -8 Z" fill={ctx.c("#fbf8f1")} />
          <path d="M-4 0 L-4 -58 L-32 -6 Z" fill={ctx.c("#e9e3d6")} />
          <path d="M-40 0 L52 0 L40 14 L-30 14 Z" fill={ctx.c("#7c5423")} />
        </g>
      </g>
    ),
    mid: (
      <g>
        <path d={`M-2000 ${GROUND - 26} Q1200 ${GROUND - 60} 6000 ${GROUND - 26} L6000 ${GROUND} L-2000 ${GROUND} Z`} fill={ctx.c("#f1dfb8")} />
        {/* the surf */}
        <path d={`M-2000 ${GROUND - 30} Q1200 ${GROUND - 64 + Math.sin(ctx.t * 1.2) * 5} 6000 ${GROUND - 30}`} stroke="#fff" strokeWidth={7} fill="none" opacity={0.8} />
        {span(700, -100).map((x, i) => palm(x, 1 + (i % 2) * 0.18, i))}
        {span(900, 420).map((x, i) => (
          <g key={i} transform={`translate(${x} ${GROUND})`}>
            <rect x={-3} y={-170} width={6} height={170} fill={ctx.c("#e9e3d6")} />
            <path d="M-110 -160 Q0 -250 110 -160 Z" fill={ctx.c("#b5483c")} />
            <path d="M-36 -160 Q0 -250 36 -160 Z" fill={ctx.c("#f4f1ea")} />
            <path d="M30 -40 L150 -40 L176 -78 L186 -72 L160 -28 L36 -28 Z" fill={ctx.c("#38787b")} />
            <rect x={44} y={-28} width={6} height={28} fill={ctx.c("#6b4f3a")} />
            <rect x={140} y={-28} width={6} height={28} fill={ctx.c("#6b4f3a")} />
          </g>
        ))}
      </g>
    ),
    near: null,
    ground: (
      <g>
        <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#ecd9b0")} />
        {span(140, -900, 3400).map((x, i) => (
          <ellipse key={i} cx={x + ((i * 53) % 90)} cy={GROUND + 30 + ((i * 71) % 150)} rx={26} ry={4} fill="#000" opacity={0.05} />
        ))}
      </g>
    ),
  };
}

function mountains(ctx: Ctx): Layers {
  const ridge = (y: number, amp: number, seed: number, colour: string, snow: boolean) => {
    const r = rng(seed);
    const peaks = span(260, -900, 3400).map((x) => [x + r() * 80, y - amp * (0.45 + r() * 0.55)] as const);
    const d = peaks.map(([x, py], i) => `${i ? "L" : "M"}${x - 130} ${y} L${x} ${py}`).join(" ") + ` L3600 ${y} L3600 ${GROUND} L-900 ${GROUND} Z`;
    return (
      <g>
        <path d={d} fill={colour} />
        {snow && peaks.map(([x, py], i) => <path key={i} d={`M${x} ${py} L${x - 34} ${py + (y - py) * 0.3} L${x - 12} ${py + (y - py) * 0.22} L${x + 4} ${py + (y - py) * 0.34} L${x + 30} ${py + (y - py) * 0.26} Z`} fill={ctx.c("#fbfaf6")} />)}
      </g>
    );
  };
  const smoke = [0, 1, 2].map((i) => {
    const k = ((ctx.t * 0.35 + i / 3) % 1);
    return <circle key={i} cx={1262 + k * 40} cy={GROUND - 250 - k * 110} r={9 + k * 18} fill="#fff" opacity={(1 - k) * 0.45} />;
  });
  return {
    far: (
      <g>
        {ridge(660, 420, 11, ctx.c("#a9bdcc", 0.3), true)}
        <g transform="translate(140 0)">{ridge(700, 280, 23, ctx.c("#7f9aad", 0.15), false)}</g>
      </g>
    ),
    mid: (
      <g>
        <path d={`M-2000 720 Q400 660 1300 716 T3600 700 L3600 ${GROUND} L-2000 ${GROUND} Z`} fill={ctx.c("#6f9a68")} />
        {span(64, -900, 3400).map((x, i) => {
          const h = 90 + ((i * 47) % 70);
          return i % 9 > 5 ? null : <path key={i} d={`M${x} ${GROUND - 40} L${x + 24} ${GROUND - 40 - h} L${x + 48} ${GROUND - 40} Z`} fill={ctx.c(i % 2 ? "#3f6b4d" : "#356043")} />;
        })}
        {/* a chalet with the stove on */}
        {smoke}
        <g transform={`translate(1100 ${GROUND})`}>
          <rect x={0} y={-150} width={240} height={150} fill={ctx.c("#8a5a3a")} />
          <rect x={0} y={-60} width={240} height={60} fill={ctx.c("#e9e0d0")} />
          <path d="M-30 -146 L120 -250 L270 -146 Z" fill={ctx.c("#5a3a2a")} />
          <path d="M-30 -146 L120 -250 L270 -146 L262 -140 L120 -238 L-22 -140 Z" fill={ctx.c("#fbfaf6")} />
          <rect x={150} y={-246} width={22} height={50} fill={ctx.c("#5a3a2a")} />
          <rect x={40} y={-128} width={48} height={48} rx={3} fill={ctx.light.lit ? WINDOW_LIT : ctx.c("#6f8798")} />
          <rect x={150} y={-128} width={48} height={48} rx={3} fill={ctx.light.lit ? WINDOW_LIT : ctx.c("#6f8798")} />
          <rect x={98} y={-50} width={40} height={50} fill={ctx.c("#5a3a2a")} />
        </g>
      </g>
    ),
    near: (
      <g>
        {span(120, -500).map((x, i) => (
          <rect key={i} x={x} y={GROUND - 40} width={8} height={40} fill={ctx.c("#7a5a40")} />
        ))}
        <rect x={-2000} y={GROUND - 34} width={8000} height={6} fill={ctx.c("#7a5a40")} />
        <rect x={-2000} y={GROUND - 18} width={8000} height={6} fill={ctx.c("#7a5a40")} />
      </g>
    ),
    ground: (
      <g>
        <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#8fb26c")} />
        <path d={`M-2000 ${GROUND + 56} L6000 ${GROUND + 56} L6000 ${GROUND + 110} L-2000 ${GROUND + 110} Z`} fill={ctx.c("#d7c7a4")} />
        {span(90, -900, 3400).map((x, i) => (
          <circle key={i} cx={x + ((i * 37) % 70)} cy={GROUND + 14 + ((i * 29) % 30)} r={4} fill={ctx.c(["#fbfaf6", "#f2c94c", "#e98f7a"][i % 3])} />
        ))}
      </g>
    ),
  };
}

function lounge(ctx: Ctx, sky: React.ReactNode): Layers {
  const windows = span(1100, 80, WORLD);
  return {
    far: null,
    mid: (
      <g>
        <rect x={-2000} y={0} width={8000} height={GROUND} fill={ctx.c("#efe6d6")} />
        <rect x={-2000} y={GROUND - 66} width={8000} height={66} fill={ctx.c("#ded2bd")} />
        {windows.map((x, i) => (
          <g key={i}>
            <svg x={x} y={150} width={760} height={470} viewBox="0 150 760 470" preserveAspectRatio="xMidYMid slice" overflow="hidden">
              {sky}
              {span(86, 0, 800).map((bx, j) => (
                <rect key={j} x={bx} y={600 - 60 - ((j * 67 + i * 31) % 150)} width={62} height={300} fill={ctx.c("#93a6b8", 0.2)} />
              ))}
            </svg>
            <rect x={x} y={150} width={760} height={470} rx={4} fill="none" stroke={ctx.c("#f8f4ec")} strokeWidth={18} />
            <rect x={x + 372} y={150} width={14} height={470} fill={ctx.c("#f8f4ec")} />
            {/* curtains */}
            <path d={`M${x - 26} 120 L${x + 70} 120 Q${x + 30} 380 ${x + 60} 660 L${x - 26} 660 Z`} fill={ctx.c("#b38b59")} opacity={0.9} />
            <path d={`M${x + 786} 120 L${x + 690} 120 Q${x + 730} 380 ${x + 700} 660 L${x + 786} 660 Z`} fill={ctx.c("#b38b59")} opacity={0.9} />
          </g>
        ))}
        {/* pictures between the windows */}
        {span(1100, -180, WORLD).map((x, i) => (
          <g key={i}>
            <rect x={x} y={250} width={150} height={190} fill={ctx.c("#fbf8f1")} stroke={ctx.c("#7c5423")} strokeWidth={8} />
            <circle cx={x + 75} cy={330} r={30} fill={ctx.c("#b38b59")} />
            <path d={`M${x + 14} 426 L${x + 60} 366 L${x + 96} 400 L${x + 136} 350 L${x + 136} 426 Z`} fill={ctx.c("#38787b")} />
          </g>
        ))}
      </g>
    ),
    near: (
      <g>
        {span(1100, 560, WORLD).map((x, i) => (
          <g key={i} transform={`translate(${x} ${GROUND})`}>
            {/* armchair, side table, lamp, plant */}
            {ctx.light.lit && <circle cx={330} cy={-330} r={170} fill={ctx.glow} />}
            <rect x={322} y={-300} width={8} height={300} fill={ctx.c("#3a342d")} />
            <path d="M286 -300 L302 -372 L350 -372 L366 -300 Z" fill={ctx.light.lit ? "#ffe9b8" : ctx.c("#f1e6cf")} />
            <path d="M0 -150 Q0 -232 60 -232 L170 -232 Q230 -232 230 -150 L230 -30 L0 -30 Z" fill={ctx.c("#2f6769")} />
            <path d="M-26 -120 Q-26 -150 4 -150 Q34 -150 34 -120 L34 -30 L-26 -30 Z M196 -120 Q196 -150 226 -150 Q256 -150 256 -120 L256 -30 L196 -30 Z" fill={ctx.c("#38787b")} />
            <rect x={34} y={-104} width={162} height={50} rx={14} fill={ctx.c("#4a8f91")} />
            <rect x={-10} y={-30} width={14} height={30} fill={ctx.c("#3a342d")} />
            <rect x={226} y={-30} width={14} height={30} fill={ctx.c("#3a342d")} />
            <g transform="translate(-170 0)">
              <path d="M-34 0 L-26 -70 L26 -70 L34 0 Z" fill={ctx.c("#b5683c")} />
              {[-50, -24, 0, 24, 50].map((a, j) => (
                <path key={j} d="M0 -70 Q-16 -170 0 -240 Q16 -170 0 -70 Z" fill={ctx.c(j % 2 ? "#3f8a5c" : "#356f4b")} transform={`rotate(${a + Math.sin(ctx.t + j) * 1.5} 0 -70)`} />
              ))}
            </g>
          </g>
        ))}
      </g>
    ),
    ground: (
      <g>
        <rect x={-2000} y={GROUND} width={8000} height={260} fill={ctx.c("#b08c62")} />
        {span(210, -900, 3400).map((x, i) => (
          <rect key={i} x={x} y={GROUND} width={3} height={260} fill="#000" opacity={0.08} />
        ))}
        {span(1100, 420, WORLD).map((x, i) => (
          <ellipse key={i} cx={x + 250} cy={GROUND + 70} rx={330} ry={46} fill={ctx.c("#6b2d3a")} opacity={0.85} />
        ))}
      </g>
    ),
  };
}

export const Backdrop: React.FC<{
  place: Place;
  time: TimeOfDay;
  /** World x of the view's left edge, the view's width and seconds into the scene. */
  cam: number;
  view: number;
  t: number;
  children?: React.ReactNode;
}> = ({ place, time, cam, view, t, children }) => {
  const id = useId();
  const light = TIMES[time];
  const ctx: Ctx = {
    t,
    light,
    // Distance first (towards the horizon's colour), then the hour's tint over everything.
    c: (hex, lighten = 0) => css(towards(towards(rgb(hex), rgb(light.sky[1]), lighten), rgb(light.tint), light.strength)),
    glow: `url(#${id}glow)`,
  };
  const r = rng(99);
  const sky = (
    <g>
      <rect x={0} y={0} width={Math.max(view, 800)} height={1000} fill={`url(#${id}sky)`} />
      {time === "night" && Array.from({ length: 70 }, (_, i) => <circle key={i} cx={r() * Math.max(view, 800)} cy={r() * 560} r={1 + r() * 1.8} fill="#fff" opacity={0.35 + 0.45 * Math.abs(Math.sin(t * (0.6 + r()) + i))} />)}
      <circle cx={light.sun.x * view} cy={light.sun.y} r={light.sun.r * 3.2} fill={`url(#${id}halo)`} />
      <circle cx={light.sun.x * view} cy={light.sun.y} r={light.sun.r} fill={light.sun.colour} />
      {light.sun.moon && <circle cx={light.sun.x * view + 14} cy={light.sun.y - 8} r={light.sun.r * 0.86} fill={light.sky[0]} />}
    </g>
  );
  const layers = place === "berlin" ? berlin(ctx) : place === "istanbul" ? istanbul(ctx) : place === "airport" ? airport(ctx) : place === "seaside" ? seaside(ctx) : place === "mountains" ? mountains(ctx) : lounge(ctx, sky);
  const at = (depth: number) => `translate(${(-cam * depth).toFixed(2)} 0)`;
  const clouds = time === "night" ? 0.12 : 0.85;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={light.sky[0]} />
          <stop offset={0.78} stopColor={light.sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}halo`}>
          <stop offset={0} stopColor={light.sun.colour} stopOpacity={0.5} />
          <stop offset={1} stopColor={light.sun.colour} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset={0} stopColor="#ffe2a0" stopOpacity={0.5} />
          <stop offset={1} stopColor="#ffe2a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      {sky}
      {place !== "lounge" && (
        <g transform={at(0.06)} opacity={clouds}>
          {span(430, -400, 3200).map((x, i) => {
            const cx = ((x + t * (5 + (i % 3) * 2) + 400) % 3600) - 400;
            const y = 150 + ((i * 97) % 260);
            const s = 0.8 + (i % 3) * 0.3;
            return (
              <g key={i} transform={`translate(${cx.toFixed(1)} ${y}) scale(${s})`} fill="#fff" opacity={0.82}>
                <ellipse cx={0} cy={0} rx={90} ry={26} />
                <ellipse cx={-34} cy={-18} rx={44} ry={26} />
                <ellipse cx={28} cy={-24} rx={54} ry={32} />
              </g>
            );
          })}
        </g>
      )}
      <g transform={at(0.18)}>{layers.far}</g>
      <g transform={at(place === "lounge" ? 1 : 0.5)}>{layers.mid}</g>
      <g transform={at(1)}>
        {layers.ground}
        {layers.near}
        <g style={{ filter: light.figure }}>{children}</g>
      </g>
    </g>
  );
};
