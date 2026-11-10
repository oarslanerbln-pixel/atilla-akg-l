import { COLOURS } from "../../../brand/mark";
import { C } from "../../../palette";
import type { MarkColours } from "../brand/MarkDraw";

// A ground and everything that sits on it. "alpha" is the ink-ground palette on a transparent
// frame: an overlay for footage, exported with an alpha channel.

export type Tone = "ink" | "paper" | "alpha";

export interface Theme {
  ground: string;
  text: string;
  soft: string;
  accent: string;
  hairline: string;
  mark: MarkColours;
}

const onInk: Theme = {
  ground: C.ink,
  text: C.porcelain,
  soft: C.onInkSoft,
  accent: C.goldLight,
  hairline: "rgba(252, 251, 249, 0.28)",
  mark: { ink: COLOURS.paper, teal: COLOURS.tealOnInk, gold: COLOURS.goldOnInk },
};

export const THEMES: Record<Tone, Theme> = {
  ink: onInk,
  alpha: { ...onInk, ground: "transparent" },
  paper: {
    ground: C.porcelain,
    text: C.text,
    soft: C.graphite,
    accent: C.goldReadable,
    hairline: C.hairline,
    mark: { ink: COLOURS.ink, teal: COLOURS.teal, gold: COLOURS.gold },
  },
};
