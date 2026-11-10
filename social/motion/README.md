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
| cartoon brief | reel, square, wide | `kind: "cartoon"`: characters acting on a set, see below. | `.mp4` |
| flights brief | story | `kind: "flights"` exactly as `templates/flights.tsx` takes it. | `.mp4` |

Overlays are ProRes 4444 with an alpha channel: drop them on a track above the footage in
DaVinci Resolve, Premiere or Final Cut. Each ends on an empty frame, so it cuts clean.
`scrim: true` lays ink rising from the lower edge behind the type; switch it off over footage
that is already dark there.

A brief never states a duration. It follows from the content (`src/briefs.ts`): the entrance,
then the copy's reading time (1 s plus 0.4 s a word) or `hold`, whichever is longer.

## Cartoons

A cartoon brief is a list of scenes (`social/briefs/cartoon/berlin-istanbul.json` is the worked
example). Each scene is a place in a light, a cast with a script, and a camera:

```json
{
  "place": "airport", "time": "day",
  "caption": "One line of narration, along the top.",
  "camera": { "follow": "host", "zoom": [1, 1.15] },
  "cast": [
    { "id": "host", "preset": "host", "carry": "suitcase", "x": 840,
      "script": [ { "at": 0.5, "do": "walk", "to": 1100 }, { "at": 4, "do": "talk", "say": "Einmal Istanbul, bitte." } ] }
  ]
}
```

- **Places:** `berlin`, `istanbul`, `airport`, `seaside`, `mountains`, `lounge`. **Light:** `dawn`,
  `day`, `dusk`, `night`. Every set is layered for parallax and alive on its own (clouds, a ferry,
  a departing plane, palms, chimney smoke); one tint lights the set and the figures alike.
- **Cast:** presets `host`, `traveller`, `guide`, `concierge`, `photographer`, `elder`; any part
  of a look can be overridden in the brief (`hair`, `hat`, `top`, colours, `beard`, `glasses`,
  `carry`, `height`). Up to five characters a scene.
- **Actions:** `idle`, `walk` (to a world x, 0 to 2400), `talk` (with `say`, a speech bubble),
  `wave`, `point`, `cheer`, `nod`, `think`, `shrug`. Poses blend into each other; a beat written
  before a walk has arrived waits for it.
- **Camera:** `follow` a character, or pan `from`/`to`; `zoom` 1 to 2, or a pair to push in.
- A scene lasts as long as its script and its reading time; scenes dissolve into each other.

`npm --prefix social/motion run sheet` renders the model sheet (every preset in every action),
`run places` a still of every set. Look at both after touching the rig, a look or a backdrop.

How it works: `src/cartoon/rig.ts` is the puppet (two-bone limbs posed by angles, the hip placed
so the lower foot stands on the ground, the walk driven by distance so feet do not slide),
`scene.ts` the film as data (schema, timeline, camera), `Character.tsx`, `looks.ts` and
`Backdrop.tsx` the drawing. A new action is a case in `actionPose`; a new place a function in
`Backdrop.tsx`; a new character a preset in `looks.ts`.

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
- A cartoon: unique cast ids, a camera that follows someone in the cast, walks with a target, and
  every speaker in the picture while speaking; two bubbles at once is a warning.
- After it: size, frame rate, duration, codec; an overlay has an alpha channel and ends empty;
  nothing opaque sits under the bands the platform covers.

`npm test` (in `social/motion`) holds the curve, the drawing schedule, the geometry, the copy
timing and every brief in `social/briefs/` to these rules, and the rig to its own (bones keep
their length, a standing foot is on the ground, nothing teleports between two frames); CI runs it with the type check.

## A new template

Schema and duration in `src/briefs.ts` (add it to `clipSchema` and `TEMPLATES`), the component in
`src/comps/`, a `<Composition>` per format in `src/Root.tsx`, a sample brief in
`social/briefs/motion/`. Build it from `src/lib/parts.tsx` (`Rise`, `MaskLine`, `Hairline`,
`Scrim`) so it moves like the rest. Default props carry required fields only: Remotion lays a
brief over them key by key, and an optional default would leak into every film.

Remotion downloads its own headless Chrome on first use; where that is blocked, set
`MOTION_BROWSER` to a Chrome headless shell. Remotion is free for individuals and companies of up
to three people; a larger team needs a company licence.
