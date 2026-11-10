// The brand's colours for everything drawn outside the page's CSS: the still templates (kit.tsx)
// and the motion engine (social/motion). They mirror src/app/globals.css; no imports here, so
// both a Node script and a browser bundle can read it.

export const C = {
  porcelain: "#fcfbf9",
  alabaster: "#f4f1ea",
  ink: "#140f0a",
  text: "#181512",
  graphite: "#5a524a",
  gold: "#b38b59",
  goldLight: "#d8b482",
  goldReadable: "#7c5423",
  onInkSoft: "rgba(252, 251, 249, 0.72)",
  hairline: "rgba(24, 21, 18, 0.14)",
} as const;
