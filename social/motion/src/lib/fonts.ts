import { continueRender, delayRender } from "remotion";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff2";
import inter400x from "@fontsource/inter/files/inter-latin-ext-400-normal.woff2";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import inter500x from "@fontsource/inter/files/inter-latin-ext-500-normal.woff2";
import tight300 from "@fontsource/inter-tight/files/inter-tight-latin-300-normal.woff2";
import tight300x from "@fontsource/inter-tight/files/inter-tight-latin-ext-300-normal.woff2";
import play400 from "@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2";
import play400x from "@fontsource/playfair-display/files/playfair-display-latin-ext-400-normal.woff2";
import play400i from "@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2";
import play400ix from "@fontsource/playfair-display/files/playfair-display-latin-ext-400-italic.woff2";
import play600 from "@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2";
import play600x from "@fontsource/playfair-display/files/playfair-display-latin-ext-600-normal.woff2";

// The same self-hosted files as the still templates (social/kit.tsx), bundled with the
// composition: a render never asks a font host for anything. latin carries German, latin-ext
// the Turkish letters (ğ, ş, ı, İ); the ranges are fontsource's own.

export const sans = "Inter";
export const display = "Inter Tight";
export const serif = "Playfair Display";

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const FACES: Array<[family: string, weight: string, style: string, latin: string, ext: string]> = [
  [sans, "400", "normal", inter400, inter400x],
  [sans, "500", "normal", inter500, inter500x],
  [display, "300", "normal", tight300, tight300x],
  [serif, "400", "normal", play400, play400x],
  [serif, "400", "italic", play400i, play400ix],
  [serif, "600", "normal", play600, play600x],
];

let loading: Promise<unknown> | undefined;

/** Holds the render until every face is in; a frame drawn in a fallback font would be a defect. */
export function loadFonts() {
  if (typeof document === "undefined" || loading) return;
  const handle = delayRender("fonts");
  loading = Promise.all(
    FACES.flatMap(([family, weight, style, latin, ext]) =>
      [
        [latin, LATIN],
        [ext, LATIN_EXT],
      ].map(([url, unicodeRange]) => {
        const face = new FontFace(family, `url(${url}) format("woff2")`, { weight, style, unicodeRange });
        document.fonts.add(face);
        return face.load();
      }),
    ),
  ).then(() => continueRender(handle));
}
