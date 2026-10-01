---
name: atilla-design
description: >
  Visual and interaction rules for the Atilla Barbarossa portfolio (Next.js 16,
  CSS Modules, three languages). Use this skill when:
  (1) changing the look of any section, component or page on the site,
  (2) adding a new section, overlay, card or floating element,
  (3) touching typography, spacing, colour, motion or stacking order,
  (4) fixing a layout bug on phones, tablets or laptops,
  (5) reviewing a visual change before it is committed.
license: MIT
metadata:
  author: atilla-barbarossa
  version: "1.0.0"
allowed-tools: Read Glob Grep Edit Write
---

# Atilla Barbarossa design rules

Editorial luxury on white: porcelain and gallery whites, obsidian type, one
warm gold, sharp corners, slow motion. Visitors arrive from Instagram on a
phone, read in German, English or Turkish, and the page must hold in all
three at 360 px.

`CLAUDE.md` holds the project facts. This skill is the checklist for changing
how the site looks and behaves.

## Process

- [ ] Read the component and its `.module.css` pair. Grep for the class before renaming or removing it.
- [ ] Use tokens from `src/app/globals.css`. Add a token only when no existing one fits.
- [ ] Put every new string in all three blocks of `src/i18n/translations.ts`.
- [ ] Measure at 360, 375, 768, 1024, 1280, 1440 and 1920 px, in DE, EN and TR (see "Measure").
- [ ] Check keyboard: Tab order, `:focus-visible`, Escape, focus return.
- [ ] Run `npx tsc --noEmit`, `npx eslint . --ignore-pattern ".claude/**"` and `npx next build`.
- [ ] State in the commit body what was measured and at which widths.

## Tokens

| Purpose | Token |
|---|---|
| Page ground | `--bg-primary` `#fcfbf9` |
| Alternate band | `--bg-secondary` `#f4f1ea` |
| Card | `--bg-card` `#ffffff` |
| Statement card, footer, mobile sheet | `--bg-ink`, `--bg-ink-soft` |
| Body text | `--text-primary`, `--text-secondary` |
| Text on ink | `--text-on-ink`, `--text-on-ink-muted` |
| Gold line, icon, border | `--accent-gold` |
| Gold on ink | `--accent-gold-light` |
| Gold text on white | `--accent-gold-readable` (the only gold that passes contrast as text) |
| Hairline | `--border-light`, `--border-ink` |
| Layout | `--max-width` 1200px, `--section-padding-y` 6rem, `--section-padding-y-mobile` 4rem |
| Easing | `--transition-smooth` = `0.4s cubic-bezier(0.16, 1, 0.3, 1)` |

- NEVER write a raw hex colour or `z-index` number in a module. A new layer takes a `--z-*` token or adds one to the scale in `globals.css`.
- NEVER use `--accent-gold` for small text on white. It fails contrast. Use `--accent-gold-readable`.

## Typography

- **Section heading (h2):** `var(--font-display)`, weight 300, mixed case ("Projekte", not "PROJEKTE"), plain ink, no gradient. Size about `clamp(2.5rem, 4.2vw, 3.6rem)`, line-height about 1.05, tracking about -0.035em.
- **Eyebrow above it:** a `<p>`, never an `<h3>`. `var(--font-inter)`, uppercase, 600, tracking 0.25em, gold. The gold lives here, not in the heading.
- **Figures:** `var(--font-display)` 300 with `font-variant-numeric: tabular-nums`, so counting numbers do not jitter.
- **Body:** `var(--font-inter)`. About 1.2rem / 1.8 on desktop and 1.05rem / 1.75 on phones.
- **Labels:** uppercase, 0.6 to 0.8rem. Tracking 0.1 to 0.16em. Wide tracking overflows narrow cards in German.
- One h1 per page. Headings go h2 → h3 without skipping.
- A heading split across lines keeps `{" "}` between the words, or search engines read them glued together.
- Playfair is retired. No serif on the page. The wordmark in exported artwork is Cormorant Garamond, outlined, from `public/brand/`.

## Geometry and surfaces

- Corners are sharp: `border-radius: 0`, the floating WhatsApp button included. The only round shapes are status dots.
- Cards: `--bg-card`, a 1px `--border-light` hairline, a soft shadow (`0 12px 30px rgba(24,21,18,0.05)`), and often a 2px gold line along the bottom edge.
- Hover lifts by 4 to 6 px at most. No scale-ups on whole cards.
- Ink cards carry gold at 0.28 alpha on the border and a light gold rule along the top.

## Layout

- Containers: `max-width: var(--max-width)`, side padding 2rem, 1.25 to 1.5rem on phones.
- Set grid children to `min-width: 0`, or long German words push the column wider than the screen.
- Keep a set of three as three: `repeat(3, minmax(0, 1fr))` on every width, set smaller on phones. A wrapping row leaves the third item alone on its own line.
- Leave no horizontal scroll at 360 px. 320 px may overflow and is accepted.
- Hero height is `svh`, not `vh`, so iOS address bars do not cut it.

## Motion

- framer-motion with ease `[0.16, 1, 0.3, 1]`. Entrances run 0.6 to 1.2 s and travel 20 to 40 px. No springs with visible bounce.
- `MotionConfig reducedMotion="user"` wraps the app. Under `usePrefersCalm()` (reduced motion, reduced data, Save-Data), nothing heavy autoplays.
- The hero opening waits for the intro (`useIntroDone`). The intro plays once per visitor, ever.
- NEVER hold the scroll or hijack the wheel. The hero stays one screen tall.

## Mobile data

- Nothing loads from a third party at runtime: no CDN fonts, images or scripts. Fonts come from `next/font`, media from `public/`.
- Video: `preload="none"` with a self-hosted poster. It loads on open, never on hover.
- Anything heavy loads on visibility. A new dependency in the critical path needs its gzip weight measured and the user's approval. For scale, the hero is a few KB of shader.

## Interaction and accessibility

- Interactive means `<button>`, `<a>` or a real form field. NEVER a `<div onClick>`.
- Every overlay (menu, lightbox, dialog) must:
  - close with Escape;
  - return focus to its opener;
  - lock scroll through `useScrollLock`, which locks `<html>`, not `<body>` (`<html>` carries `overflow-x`);
  - stay out of the way when closed: `pointer-events: none` plus `visibility: hidden`, or unmounted. An invisible layer that still takes clicks makes the page feel "stuck".
- A floating element hides wherever it would cover controls: the hero, the contact section, the footer. Observe each target with its own IntersectionObserver. An observer fires only on a state change, so a "scrolled past" test based on `top < 0` breaks on anchor jumps.
- Style `:focus-visible` on every control: 2px gold outline, 2px offset.
- An icon-only control needs an `aria-label` in all three languages.

## Three languages

- Every visible string goes through `t('key')`. It needs DE, EN and TR in `translations.ts`.
- German runs about 30% longer than English. Size labels for German first.
- Turkish needs `İ`/`ı` to survive uppercase. In CSS, `<html lang="tr">` handles it. In JS, use `toLocaleUpperCase(HTML_LANG[lang])` as in `packages/share.tsx`, never `toUpperCase()` on visible text.
- Numbers: `Intl.NumberFormat` per language (306.000 / 306,000 / 306.000; `94,2 %` / `94.2%` / `%94,2`).
- Brand voice that stays English in every language: "Let's Connect", "LET'S TALK", "Case Study".

## Measure

The Browser pane in the desktop app pauses rAF, IntersectionObserver and `whileInView` while it is hidden. Use it for layout and text. Use the Playwright browser for motion and observers.

**Layout at many widths in one call** (Browser pane, `javascript_tool`): load the page into iframes. Add about 17 px to each width, because the iframe's classic scrollbar takes it from the client width.

```js
const widths = [360, 375, 768, 1024, 1280, 1440];
const out = {};
for (const w of widths) {
  const f = Object.assign(document.createElement('iframe'), { src: location.href });
  f.style.cssText = `width:${w + 17}px;height:900px;position:absolute;left:-99999px`;
  document.body.append(f);
  await new Promise(r => (f.onload = r));
  await new Promise(r => setTimeout(r, 1500));
  const d = f.contentDocument;
  out[w] = {
    hScroll: d.documentElement.scrollWidth > d.documentElement.clientWidth,
    sectionH: d.querySelector('#stats')?.offsetHeight,
  };
  f.remove();
}
out;
```

**Screenshots in the hidden pane:** framer-motion leaves elements at their start state. Inject this before the shot, and only for the shot:

```css
main *, footer * { opacity: 1 !important; transform: none !important; }
```

**Scroll:** use `scrollTo({ top, behavior: 'instant' })`. Smooth scroll does not advance in a hidden pane.

**Languages:** `/`, `/en`, `/tr`. Run every measurement in all three.

## Ground rules

- ALWAYS use tokens, CSS Modules and the `[0.16, 1, 0.3, 1]` easing. NEVER use Tailwind.
- ALWAYS ship a visual change in DE, EN and TR, measured at 360 px and at 1440 px.
- ALWAYS make an overlay closable with Escape, return focus, and drop pointer events when hidden.
- NEVER load fonts, images or scripts from a third-party host.
- NEVER add a dependency to the hero or another critical path without a measured weight and the user's approval.
- NEVER put gold into the h2 itself. It belongs to the eyebrow, the hairlines and the figures' accents.
- PREFER smaller type and tighter tracking on phones over dropping content.
- PREFER one IntersectionObserver per target over geometry tests inside a single callback.
