# Motion

Films in the brand's look, rendered offline with [Remotion](https://www.remotion.dev): the mark
drawn by a pen, titles and location tags to lay over footage, the flights story moving. Like the
still templates next door, nothing here ships with the site. It is its own package, so the
site's install and Vercel's build never carry a video renderer.

```bash
cd social/motion && npm install        # once
npm run motion -- social/briefs/motion/brand-sting.json      # from the repo root
npm run motion -- social/briefs/flights-deutschland.json     # a flights brief, as a moving story
npm run motion -- <brief> --check      # read the brief and run its checks, render nothing
npm --prefix social/motion run studio  # live preview; every field of a brief is editable there
```

Files land in `social/out/motion/` (gitignored): the film, `<name>-sheet.png` with six stills
across it, and `<name>-report.json`. Look at the sheet before the film; most defects show there.

## Templates

| `template` | Formats | What it is | File |
|---|---|---|---|
| `sting` | reel, square, wide | The mark is drawn, the sun comes up, the name is uncovered. `tone`: `ink`, `paper`, or `alpha` (transparent, over footage). `out: "fade"` for an opening, `"stay"` for a closing card. Optional `line` under the name. | `.mp4`, alpha `.mov` |
| `title` | reel, wide | A cover's type, moving: eyebrow, serif title, italic gold second line. Same fields as a cover brief. | alpha `.mov` |
| `location` | reel, wide | A compass turning from north to the bearing from Berlin, the place, its coordinates and distance. Computed from `lat`/`lon` by the site's own `bearing()`. | alpha `.mov` |
| flights brief | story | `kind: "flights"` exactly as `templates/flights.tsx` takes it. | `.mp4` |

Overlays are ProRes 4444 with an alpha channel: drop them on a track above the footage in
DaVinci Resolve, Premiere or Final Cut. Each ends on an empty frame, so it cuts clean.
`scrim: true` lays ink rising from the lower edge behind the type; switch it off over footage
that is already dark there.

A brief never states a duration. It follows from the content (`src/briefs.ts`): the entrance,
then the copy's reading time (1 s plus 0.4 s a word) or `hold`, whichever is longer.

## How it is built

- **One source each.** The mark is `social/brand/mark.ts` (`outlinePart` draws the part a pen
  has reached; the last frame is the exported artwork, line for line). The wordmark is
  `brandWordmarkPaths.ts`. Colours are `social/palette.ts`, shared with the still templates.
  Bearings are `src/lib/partners.ts`. The flights copy is `social/flights.ts`.
- **Timing lives in `src/lib/tokens.ts`**: the site's curve `[0.16, 1, 0.3, 1]`, entrances of
  0.9 s over 36 px, exits of 0.45 s. Motion is a pure function of the frame number (Remotion
  renders frames in parallel, in any order). No springs, nothing bounces.
- **Formats and safe areas** are `src/lib/formats.ts`: a reel keeps 240 px clear above, 420 below
  and 140 on the right; a story 250 above and below.
- **Fonts** are the self-hosted `@fontsource` files, bundled; a render asks no host for anything.

## Checks

`npm run motion` stops with exit code 1 on an error.

- Before the render: the brief matches its schema; a title with `partner` set starts its eyebrow
  with the ad label (Anzeige, Ad, Reklam); a flights keyword is one `supabase/offers.sql` answers to.
- After it: size, frame rate, duration, codec; an overlay has an alpha channel and ends empty;
  nothing opaque sits under the bands the platform covers.

`npm test` (in `social/motion`) holds the curve, the drawing schedule, the geometry, the copy
timing and every brief in `social/briefs/` to these rules; CI runs it with the type check.

## A new template

Schema and duration in `src/briefs.ts` (add it to `clipSchema` and `TEMPLATES`), the component in
`src/comps/`, a `<Composition>` per format in `src/Root.tsx`, a sample brief in
`social/briefs/motion/`. Build it from `src/lib/parts.tsx` (`Rise`, `MaskLine`, `Hairline`,
`Scrim`) so it moves like the rest. Default props carry required fields only: Remotion lays a
brief over them key by key, and an optional default would leak into every film.

Remotion downloads its own headless Chrome on first use; where that is blocked, set
`MOTION_BROWSER` to a Chrome headless shell. Remotion is free for individuals and companies of up
to three people; a larger team needs a company licence.
