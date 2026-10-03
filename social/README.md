# Social images

Reel covers and stories in the brand's look, rendered offline with `next/og`
(the same renderer as the share card) and `sharp`. Nothing here ships with the
site.

```bash
npm run social -- social/briefs/amex-reel.json
```

The PNGs land in `social/out/` (gitignored). A cover brief renders every
template plus `<name>-overview.png`, a side-by-side sheet with the profile
grid's crop marked by dashed lines.

## Photos

Put the photo in `social/assets/` (gitignored: it holds people's faces). Use a
full-resolution frame exported from the video, not a screenshot: a cover is
1080×1920 and a small source turns soft when it is scaled up.

- `focus`: the point to keep in view (Atilla's face), as fractions of the
  photo's width and height. Each template places it where its layout wants it.
- `zoom`: extra zoom on top of filling the frame.
- `blur`: `[x, y, width, height]` boxes, as fractions of the photo, blurred as
  soft ellipses. Every recognisable bystander in partner content gets one:
  an advert needs the consent of everyone shown in it (KUG § 22). Check the
  result in the overview sheet before posting.

## Briefs

`kind: "cover"` (`templates/covers.tsx`): `eyebrow`, `title`, `accent` (the
second title line in gold), `subtitle`, `tags`, `photo`, optionally
`templates` to render only some of `editorial`, `passepartout`, `split`, `card`.

`kind: "flights"` (`templates/flights.tsx`): a story with up to four
destinations and prices, cheapest first. The prices are typed in from the
partner's page, with the date they were read in `asOf`: no partner offers us a
price feed, and reading their pages by script is not allowed. `keyword` must be
one of the partner offer's keywords in `supabase/offers.sql`; the story asks
people to reply with it and the concierge answers with the tracked link.

`kind: "rates"` (`templates/rates.tsx`): a 1080×1350 rate card for shoot and
edit, sent by hand in DMs, one per market. `currency` (`EUR` or `CHF`; Swiss
cards group digits as 1’190), `title`, `accent` (the market), three `offers`
(`name`, `includes`, `price`, one `featured`), up to two `proof` reels with
their views on `asOf`, and `terms` (travel). The audience figures come from
`src/lib/site.ts`. Rate briefs go in `social/briefs/private/`, which git
ignores: the repo is public and the site quotes no prices.

## Rules

- Partner content carries the ad label: the eyebrow starts with "Anzeige"
  (EN "Ad", TR "Reklam").
- Say only what the partner has approved. No fees, interest rates or bonus
  figures unless they come from the partner's current material.
- Readable content stays inside the profile grid's 3:4 crop (y 240–1680). In
  stories Instagram's bars cover roughly the top and bottom 250 px.
- The wordmark comes from `public/brand/` (outlined), never retyped.
