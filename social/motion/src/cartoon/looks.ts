// What a character looks like. A look is data, so a brief can cast anyone: start from a preset
// and override what differs ({ "preset": "traveller", "top": "#38787b", "hat": "fedora" }).

export const HAIR = ["short", "long", "bun", "curly", "bald"] as const;
export const HATS = ["none", "fedora", "cap"] as const;
export const TOPS = ["blazer", "tee", "coat", "dress"] as const;
export const CARRY = ["none", "suitcase", "camera"] as const;

export interface Look {
  skin: string;
  hair: (typeof HAIR)[number];
  hairColour: string;
  beard: boolean;
  glasses: boolean;
  hat: (typeof HATS)[number];
  top: (typeof TOPS)[number];
  topColour: string;
  /** Shirt under a blazer or coat; the accent of a dress. */
  shirtColour: string;
  bottomColour: string;
  shoeColour: string;
  carry: (typeof CARRY)[number];
  /** 1 is an adult of average height. */
  height: number;
}

export const PRESETS = {
  // The host: dark blazer, open cream shirt, short beard.
  host: { skin: "#d9a57e", hair: "short", hairColour: "#2b211b", beard: true, glasses: false, hat: "none", top: "blazer", topColour: "#1f2a33", shirtColour: "#f4f1ea", bottomColour: "#2a2623", shoeColour: "#6b4a2f", carry: "none", height: 1 },
  traveller: { skin: "#e8b796", hair: "long", hairColour: "#5a3824", beard: false, glasses: false, hat: "none", top: "coat", topColour: "#b38b59", shirtColour: "#fcfbf9", bottomColour: "#2f3d4a", shoeColour: "#3a2c22", carry: "suitcase", height: 0.95 },
  guide: { skin: "#a8734f", hair: "curly", hairColour: "#1c1512", beard: false, glasses: true, hat: "none", top: "tee", topColour: "#38787b", shirtColour: "#fcfbf9", bottomColour: "#c9b99b", shoeColour: "#f4f1ea", carry: "none", height: 0.98 },
  concierge: { skin: "#c98d66", hair: "bun", hairColour: "#3b2a22", beard: false, glasses: false, hat: "none", top: "dress", topColour: "#6b2d3a", shirtColour: "#d8b482", bottomColour: "#6b2d3a", shoeColour: "#1c1512", carry: "none", height: 0.94 },
  photographer: { skin: "#f0c8a8", hair: "short", hairColour: "#a8672e", beard: false, glasses: true, hat: "cap", top: "tee", topColour: "#f4f1ea", shirtColour: "#fcfbf9", bottomColour: "#4a5a48", shoeColour: "#2a2623", carry: "camera", height: 1.02 },
  elder: { skin: "#d9b08c", hair: "short", hairColour: "#cfcac2", beard: true, glasses: true, hat: "fedora", top: "coat", topColour: "#4a4238", shirtColour: "#f4f1ea", bottomColour: "#3a342d", shoeColour: "#2a2623", carry: "none", height: 0.96 },
} as const satisfies Record<string, Look>;

export type PresetId = keyof typeof PRESETS;
export const PRESET_IDS = Object.keys(PRESETS) as [PresetId, ...PresetId[]];

export const lookOf = (cast: { preset: PresetId } & Partial<Look>): Look => {
  const { preset, ...over } = cast;
  return { ...PRESETS[preset], ...over };
};

/** A colour moved towards black (amount < 0) or white (amount > 0), for the far limb and the shade. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const to = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  const ch = (v: number) => Math.round(v + (to - v) * k);
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}
