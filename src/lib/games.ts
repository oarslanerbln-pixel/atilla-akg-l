/**
 * Barbarossa Games: the games on /games. Each one is a static build under
 * public/games/<id>/ (a Unity WebGL export, copied in as it was built) and
 * opens in a tab of its own, full screen, away from the site's chrome.
 *
 * The texts live in translations.ts (`games_*`); this is what is not text.
 */
export const games = [
  {
    id: "sila-defteri",
    /** Its texts in translations.ts: games_sila_place, _badge, _text, _facts, _size. */
    textKey: "sila",
    /** The game's name; the same in every language. */
    title: "Sıla Defteri",
    /** Opened at index.html: the build loads its files by relative path. */
    href: "/games/sila-defteri/index.html",
    /** Drawn from the game's own art: Gül Baba in front of his tomb. */
    cover: { src: "/games/sila-defteri-cover.webp", width: 1600, height: 900 },
    /** Link preview (1200 × 630). */
    ogImage: { src: "/games/sila-defteri-og.jpg", width: 1200, height: 630 },
    /** Languages the game itself is playable in. */
    inLanguage: ["tr", "de"],
  },
] as const;

export type Game = (typeof games)[number];
