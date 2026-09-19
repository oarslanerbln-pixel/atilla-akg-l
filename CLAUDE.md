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
  - `--bg-ink: #140f0a` (Statement dark cards, marquee, contrast footer)
- **Text & Typography:**
  - `--text-primary: #181512` (Obsidian charcoal)
  - `--text-secondary: #5a524a` (Warm graphite)
  - `--text-on-ink: #fcfbf9` (Light text on ink surfaces)
  - Headings: `var(--font-playfair)` (Serif)
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
- Translation store: `src/i18n/translations.ts`.
- **Rule:** Every user-facing text MUST be added to all 3 languages (`DE`, `EN`, `TR`) in `translations.ts` and consumed via `t('key_name')`. Never hardcode plain strings into components!

---

## 📁 Directory Structure
```
src/
├── app/
│   ├── globals.css          # Design tokens, z-index scale, base styles, reset
│   ├── layout.tsx           # Root layout, self-hosted fonts, SEO metadata
│   ├── page.tsx             # Single page landing orchestrator
│   ├── opengraph-image.tsx  # Share card, generated at build time by next/og
│   ├── Providers.tsx        # Context providers wrapper (LanguageProvider)
│   ├── api/contact/route.ts # Contact form delivery (Resend)
│   ├── impressum/           # § 5 DDG imprint
│   └── datenschutz/         # Privacy notice
├── components/              # Modular UI components with *.module.css pairs
│   ├── Preloader.tsx
│   ├── CustomCursor.tsx
│   ├── Navbar.tsx
│   ├── LiveClock.tsx
│   ├── Hero.tsx
│   ├── Brands.tsx
│   ├── Stats.tsx
│   ├── FeaturedWork.tsx
│   ├── Services.tsx
│   ├── CaseStudy.tsx
│   ├── EditorialQuote.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   └── LegalPage.tsx        # Shell shared by the two legal routes
├── context/
│   └── LanguageContext.tsx  # Language state & provider
├── hooks/
│   ├── useSoundDesign.ts    # Shared AudioContext for the click sound
│   ├── useScrollLock.ts     # Body scroll lock, counted across overlays
│   └── usePrefersCalm.ts    # prefers-reduced-motion / -data / Save-Data
└── i18n/
    └── translations.ts      # All translations for DE, EN, TR
```

---

## ⚙️ Development & Scripts
- `npm run dev` - Start local development server (localhost:3000)
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks
- `npx tsc --noEmit` - Type check only

Run `tsc --noEmit`, `next build` and `eslint` before every push; all three are
expected to pass with zero output.

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

### The contact endpoint never fakes success
It previously waited 1.5 s and answered "Message securely delivered." while
sending nothing, so every inquiry was lost. A response of 200 from
`/api/contact` means a mail provider accepted the message. Misconfiguration
returns 503, delivery failure returns 502, and the form surfaces both.

### Mobile data is the budget
Visitors arrive from Instagram on a phone. Only the visible hero clip plays;
the second one carries `preload="none"`. Still frames come from the clip
itself via the `#t=0.1` fragment rather than a separate poster asset. Anything
new and heavy loads on visibility, and `usePrefersCalm()` decides whether it
autoplays at all.

### Stacking order comes from the scale
`--z-nav-panel` through `--z-preloader` live in `globals.css`. Raw literals
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
