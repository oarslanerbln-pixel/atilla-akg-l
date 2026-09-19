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
│   ├── globals.css          # Design tokens, base styles, reset, utility classes
│   ├── layout.tsx           # Root layout, Google Fonts (Inter & Playfair), SEO metadata
│   ├── page.tsx             # Single page landing orchestrator
│   └── Providers.tsx        # Context providers wrapper (LanguageProvider)
├── components/              # Modular UI components with *.module.css pairs
│   ├── Preloader.tsx
│   ├── CustomCursor.tsx
│   ├── FilmGrain.tsx
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Brands.tsx
│   ├── Stats.tsx
│   ├── FeaturedWork.tsx
│   ├── Services.tsx
│   ├── CaseStudy.tsx
│   ├── EditorialQuote.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── context/
│   └── LanguageContext.tsx  # Language state & provider
├── hooks/                   # Custom hooks
└── i18n/
    └── translations.ts      # All translations for DE, EN, TR
```

---

## ⚙️ Development & Scripts
- `npm run dev` - Start local development server (localhost:3000)
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks

---

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
