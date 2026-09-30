# Claude Code Configuration & Project Guidelines
# Project: Atilla Barbarossa Portfolio (Luxury Editorial Visual Storytelling)

## 📌 Project Overview
- **Name:** Atilla Barbarossa (Atilla Akgül) Portfolio
- **Field:** Creative Direction, Visual Storytelling, Luxury Filmmaking, Executive Aviation & Hospitality
- **Design Aesthetic:** Editorial Luxury White Theme (Porcelain & warm gallery whites, obsidian typography, timeless warm gold accents, serif editorial headings)

---

## 🛠 Tech Stack & Dependencies
- **Framework:** Next.js 16.3.3 (App Router)
- **Library:** React 19.2.8
- **Language:** TypeScript 5
- **Animations:** `framer-motion` (^13.1.1)
- **Icons:** `lucide-react` (^1.35.0)
- **Styling:** Vanilla CSS + CSS Modules (`*.module.css`) + Global Tokens in `src/app/globals.css`
- ⚠️ **NO Tailwind CSS!** Do NOT install or use Tailwind CSS utility classes. Always use CSS Modules and custom properties.

---

## 🎨 Design System & CSS Tokens
Always utilize CSS variables defined in `src/app/globals.css`:
- **Backgrounds:**
  - `--bg-primary: #fcfbf9` (Luminous gallery white)
  - `--bg-secondary: #f4f1ea` (Soft porcelain alabaster)
  - `--bg-card: #ffffff` (Crisp floating white)
  - `--bg-ink: #140f0a` (Statement dark cards, contrast footer)
- **Text & Typography:**
  - `--text-primary: #181512` (Obsidian charcoal)
  - `--text-secondary: #5a524a` (Warm graphite)
  - `--text-on-ink: #fcfbf9` (Light text on ink surfaces)
  - Section headings: `var(--font-display)` — Inter Tight 300, plain ink,
    mixed case ("Projekte", not "PROJEKTE"). The gold lives in the small
    uppercase eyebrow above each one, not in the heading itself.
  - Headings, figures, the editorial quote: `var(--font-display)` (Inter Tight 300/400/500). Playfair is no longer used.
  - Body & UI: `var(--font-inter)` (Clean Sans-serif)
- **Accents:**
  - `--accent-gold: #b38b59`
  - `--accent-gold-light: #d8b482`
  - `--accent-gold-readable: #7c5423`
- **Borders & Spacing:**
  - `--border-light: rgba(24, 21, 18, 0.08)`
  - `--max-width: 1200px`
  - `--section-padding-y: 6rem`

---

## 🌐 Multilingual Architecture (i18n)
- Custom React context located at `src/context/LanguageContext.tsx`.
- Hook: `useLanguage()` provides `{ activeLang, setActiveLang, t }`.
- Available languages: `DE` (Default), `EN`, `TR`.
- Each language has its own address, rendered on the server in that language:
  `/`, `/en`, `/tr` and `/social-media`, `/social-media/en`, `/social-media/tr`.
  Three root layouts (`src/app/(de)`, `(en)`, `(tr)`, sharing
  `RootDocument.tsx`) give each its own `<html lang>` and start the context in
  it. Paths and hreflang come from `src/lib/locales.ts`. The switchers still
  change the language in place.
- Translation store: `src/i18n/translations.ts`.
- **Rule:** Every user-facing text MUST be added to all 3 languages (`DE`, `EN`, `TR`) in `translations.ts` and consumed via `t('key_name')`. Never hardcode plain strings into components!

---

## 📁 Directory Structure
```
src/
├── app/
│   ├── globals.css          # Design tokens, z-index scale, base styles, reset
│   ├── RootDocument.tsx     # <html lang>, fonts, site-wide JSON-LD, providers
│   ├── Providers.tsx        # Context providers wrapper (LanguageProvider)
│   ├── global-not-found.tsx # Trilingual 404 (no single root layout to use)
│   ├── (de)/                # Root layout lang="de": /, impressum, datenschutz,
│   │                        #   roadmap, social-media; opengraph-image.tsx
│   ├── (en)/                # Root layout lang="en": /en, /social-media/en
│   ├── (tr)/                # Root layout lang="tr": /tr, /social-media/tr
│   │                        #   (?lang=en|tr on /social-media is rewritten onto these)
│   ├── robots.ts, sitemap.ts
│   ├── api/contact/route.ts # Contact form delivery (Resend)
│   └── llms.txt/route.ts    # Plain-text summary for AI answer engines
├── components/              # Modular UI components with *.module.css pairs
│   ├── HomePage.tsx         # The portfolio, shared by /, /en and /tr
│   ├── JsonLd.tsx           # Renders one structured-data block
│   ├── Faq.tsx              # FAQ section (text from lib/faq.ts)
│   ├── Preloader.tsx
│   ├── CustomCursor.tsx
│   ├── Navbar.tsx
│   ├── LiveClock.tsx
│   ├── Hero.tsx
│   ├── HeroHorizon.tsx      # Live WebGL sea-at-sunrise backdrop
│   ├── WhatsAppButton.tsx   # Floating wa.me link between hero and contact
│   ├── packages/            # /social-media page (plates data in lib/packages.ts,
│                            #   metadata and share cards in share.tsx)
│   ├── Brands.tsx           # Grey credit-line marquee, constant 30 px/s
│   ├── Stats.tsx
│   ├── FeaturedWork.tsx
│   ├── Services.tsx
│   ├── CaseStudy.tsx
│   ├── EditorialQuote.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   ├── Partners.tsx         # Tourism boards & institutions
│   ├── LatestReels.tsx      # Newest Instagram films (server), ReelsRail.tsx (client)
│   ├── BrandMark.tsx        # The compass mark, inline
│   └── LegalPage.tsx        # Shell shared by the two legal routes
├── context/
│   └── LanguageContext.tsx  # Language state & provider
├── lib/
│   ├── site.ts              # URL, contact, social profiles, audience figures
│   ├── locales.ts           # Language addresses, hreflang, html lang
│   ├── metadata.ts          # Title, description, canonical, previews
│   ├── structuredData.ts    # schema.org graphs per page
│   ├── faq.ts               # FAQ entries and the facts that fill them
│   ├── partners.ts, brands.ts, packages.ts, roadmap.ts
├── hooks/
│   ├── useSoundDesign.ts    # Shared AudioContext for the click sound
│   ├── useScrollLock.ts     # Body scroll lock, counted across overlays
│   └── usePrefersCalm.ts    # prefers-reduced-motion / -data / Save-Data
└── i18n/
    └── translations.ts      # All translations for DE, EN, TR
```

---

## 🤖 AI Concierge (Instagram + WhatsApp tour sales)
- Server-only code in `src/lib/concierge/`; webhooks in `src/app/api/webhooks/{meta,stripe}/route.ts`.
- Stack: `@anthropic-ai/sdk` (Claude tool-use loop in `agent.ts`), `@supabase/supabase-js` (CRM, schema in `supabase/migrations/`), `stripe` (deposit Checkout).
- Partner (affiliate) offers are data in `supabase/offers.sql` (idempotent, run in the SQL Editor); a keyword in a comment, a story reply or a short DM sends the tracked `/go/<id>` link.
- Fixed customer messages live in `src/lib/concierge/copy.ts` (DE/EN/TR), not `translations.ts`, because they are sent server-side.
- Setup and env vars: `docs/concierge-setup.md`, `.env.example`.
- Current state, open gaps and next steps (dated snapshot, for a new session picking the work up): `docs/automation-handover.md`.
- Instagram tokens expire after 60 days: `tokens.ts` keeps the current one sealed in `access_tokens` (seeded from `INSTAGRAM_ACCESS_TOKEN`) and the weekly Vercel Cron `src/app/api/cron/instagram-token/route.ts` (`vercel.json`, `CRON_SECRET`) renews it. Instagram calls take `instagramAccessToken()`, never the env var directly.
- Personal data is encrypted in the app before it reaches Supabase (`crypto.ts`, AES-256-GCM, AAD `table.column:rowId`). Never write personal fields to the DB directly: go through the mappers in `db.ts` / `bookings.ts`. Look contacts up by `external_id_hash` (blind index), never by `external_id`.

---

## ⚙️ Development & Scripts
- `npm run dev` - Start local development server (localhost:3000)
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks
- `npx tsc --noEmit` - Type check only
- `npm run social -- social/briefs/<brief>.json` - Render reel covers / stories into `social/out/` (see `social/README.md`)

Run `tsc --noEmit`, `next build` and `eslint` before every push; all three are
expected to pass with zero output.

## 🤝 Partners (tourism boards & institutions)
`src/lib/partners.ts` is the single source for the Partners section, the
`ItemList` in the root layout's structured data and `/llms.txt`. Add or edit a
partner there and all three follow.

- **Logo:** drop the organisation's official file into `public/partners/`,
  unaltered, and set `logo: { src, width, height }` with its intrinsic size.
  Until then the tile shows the name as type. UNESCO's emblem needs UNESCO's
  written authorisation — without it, leave UNESCO as type.
- **Link:** set `url` to the published collaboration (the reel or film). The
  tile then links to it, and the structured data states the relationship as a
  `CreativeWork` created by Atilla about that partner.
- The name always stays on the page as text, logo or not: search engines and
  AI answer engines read text, not the pixels of a wordmark.
- **Coordinates:** every partner carries `coords` (capital or headquarters).
  The card prints them and turns its compass needle to the bearing from
  `BASE` (Berlin), computed by `bearing()` — never typed in by hand.

## 🧭 Brand mark
The logo is the **compass**: a four-point north star whose north ray breaks
out of its ring, each ray half ink, half gold, alternating clockwise. The
wordmark is `ATILLA BARBAROSSA` in Cormorant Garamond 400, tracked 0.26em,
and carries no tagline.

- On the site the mark is `src/components/BrandMark.tsx` (inline SVG, dark
  halves in `currentColor`, gold halves in `--accent-gold`). The share card
  imports its geometry from there, so the two cannot drift apart.
- `src/app/icon.svg`, `apple-icon.png` and `favicon.ico` are the app icons;
  Next links them by convention.
- `public/brand/` holds the exported artwork: the mark, stacked and
  horizontal lockups, each in colour, reverse (for dark grounds), black and
  white. The wordmark in them is outlined, so they render without the font.
  Outside the site header (print, social, decks, video), use these files;
  never retype the wordmark in another font.
- `watermark-frame.svg` (a viewfinder with an "A" peak and a gold sun) is for
  **video watermarks only**. Everywhere else the compass stands alone.

## 🔎 SEO & GEO
Search engines and AI answer engines read the server HTML, so everything a
visitor should be found for is in it, in the page's language. Setup steps,
the social profile playbook and next steps: `docs/seo-geo.md` (Turkish).

- **Facts have one source.** Follower counts and demographics live in
  `audience` (`src/lib/site.ts`), brands in `brands.ts`, partners in
  `partners.ts`, packages in `packages.ts`. The Stats section, the FAQ, the
  structured data, the page descriptions and `/llms.txt` all read them. Change
  a figure there, never in a sentence: translations carry `{tokens}`
  (`src/i18n/format.ts`), filled by `siteFacts()` in `src/lib/faq.ts`.
- **Structured data states only what the page shows** (`src/lib/structuredData.ts`,
  rendered by `JsonLd`). The Person is `name: "Atilla Barbarossa"`,
  `alternateName: "Atilla Akgül"`, one `@id` everywhere. A new social profile
  goes into `socialProfiles` and so into `sameAs`.
- **A new page in three languages** gets its paths in `locales.ts`, metadata
  through `localizedMetadata()`, an entry in `sitemap.ts`, a line in
  `/llms.txt`, and a page file in each of `(de)`, `(en)`, `(tr)`. A page that
  should not be found says `robots: { index: false }` and is *not* blocked in
  `robots.ts` (a blocked page's noindex is never read).
- **One h1 per page.** The small gold eyebrow above a section heading is a
  `<p>`, not an `<h3>`; headings go h2 → h3 without skipping. Words split
  across lines inside a heading keep a `{" "}` between them.
- **Titles** come from `translations.ts` (`meta_home_title`, `pkg_meta_title`);
  the layout template adds "| Atilla Barbarossa".

## 🔐 Environment
`.env.example` documents the variables. Without `RESEND_API_KEY`,
`CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` the contact endpoint answers 503
and the form shows the direct mail address — it must never report a send it
did not perform.

---

## 🚦 Rules this project has paid for

### Nothing loads from a third party at runtime
The audience is German-speaking; a stock photo pulled from an external image
host on every page view hands the visitor's IP to a third country before any
consent exists, and that is the same class of defect as embedding Google
Fonts. Three Pexels posters were removed for exactly this reason. Fonts come
from `next/font`, which self-hosts them at build time. Videos, icons and
images ship from `public/`. Keep it that way — and keep
`src/app/datenschutz/page.tsx` honest if it ever changes.
The one exception is the hoster's own storage: the Instagram films are
mirrored into Vercel Blob (below), never embedded from Instagram.

### Instagram films on the home page
`LatestReels` shows the newest Instagram videos. The cron
`/api/cron/instagram-reels` (every third day, `src/lib/reels/sync.ts`) copies
each one, byte for byte, into Vercel Blob (`reels/<id>.mp4`, `.jpg`,
`manifest.json`) and revalidates the `reels` tag. The home page reads the
manifest (ISR). A caption tagged `#ad`, `#anzeige`, `#werbung`, `#sponsored`,
`#reklam` or `#işbirliği` keeps a video off the site. A video with
copyrighted Instagram music has no `media_url` and cannot be mirrored; the
cron reports it as `withoutFile`. Needs a Blob store connected to the project
(`BLOB_READ_WRITE_TOKEN`); without one the section is absent.
Blob transfer is metered per byte downloaded (Hobby: 10 GB a month, then the
store is blocked for 30 days), so video loads only when a card is opened:
no hover previews, no autoplay in the rail.

### The contact endpoint never fakes success
It previously waited 1.5 s and answered "Message securely delivered." while
sending nothing, so every inquiry was lost. A response of 200 from
`/api/contact` means a mail provider accepted the message. Misconfiguration
returns 503, delivery failure returns 502, and the form surfaces both.

### Mobile data is the budget
Visitors arrive from Instagram on a phone. The hero backdrop is a live WebGL
scene (`HeroHorizon.tsx`), not a clip: a few kilobytes of shader, rendered
below screen resolution, stopped when off screen, and a single still frame
under `usePrefersCalm()`. Keep it dependency-free; a 3D library would cost
more than the scene. Project clips carry `preload="none"` and a self-hosted
poster. Anything new and heavy loads on visibility, and `usePrefersCalm()`
decides whether it autoplays at all. The intro (`Preloader.tsx`) plays once
per visitor, ever (localStorage), for about 1.4 s, and never under reduced
motion — a first impression, not a toll on every return.
The hero's opening (mattes, focus letters, cascade) waits for the intro to
leave (`useIntroDone`, marked by the Preloader); scrolling away drives the
WebGL camera's climb (`u_climb`). Nothing holds the scroll: the hero stays
one screen tall.

### Stacking order comes from the scale
`--z-float` through `--z-preloader` live in `globals.css`. Raw literals
(999, 1002, 9999, 99997, 99998, 99999, 999999) once competed with each other,
and the lightbox ended up above the bespoke cursor — which, with
`cursor: none` on the body, left the visitor with no pointer at all. A new
fixed layer takes a token, or adds one.

### Interactive means a real control
`<button>`, `<a>` or a genuine form field — never a `<div>` with `onClick`.
The project cards, the language switcher and the intro skip were all
unreachable without a mouse. Every overlay closes with Escape and returns
focus to whatever opened it. `:focus-visible` styling is not decoration.

### Three languages, no halves
Every new string gets a key in all three blocks of `src/i18n/translations.ts`.
Where a sentence has to carry a link, the translation owns its position with a
`{link}` token — word order differs across DE, EN and TR.

## 📋 Rules for Claude
1. **Next.js 16 & React 19:**
   - Mark client-side interactive components with `'use client';` at the top.
   - Respect React 19 hooks and Next.js 16 conventions.
2. **Styling:**
   - Create or update `.module.css` for any component changes.
   - Never inject Tailwind classes.
   - Maintain the refined, editorial luxury aesthetic (delicate borders, ample whitespace, subtle gold accents, smooth typography).
3. **Animations:**
   - Use `framer-motion` with soft luxury easing (e.g. `[0.16, 1, 0.3, 1]`).
   - Avoid aggressive or jarring transitions.
4. **i18n:**
   - Always update `src/i18n/translations.ts` whenever introducing or changing text.
