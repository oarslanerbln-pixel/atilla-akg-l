/**
 * Which opening the home page plays, decided once, before first paint.
 *
 * The compass globe (three.js and GSAP, about 190 KB gzipped) plays on every
 * screen, phones included, unless the visitor asked for less motion or less
 * data, or is on a 3G-class connection: they get the sea at sunrise, a few
 * kilobytes of shader. An inline script in the root layout marks <html> with
 * `data-hero-globe` for a globe visitor before anything is drawn, so the
 * stylesheet and HomeHero read the same answer:
 *
 * - Both openings are server-rendered with their copy drawn; the stylesheet
 *   shows only the visitor's one (HomeHero.module.css), so the page's largest
 *   text is on screen at first paint whichever it is, and nothing is drawn
 *   and then replaced.
 * - Once hydrated, HomeHero removes the other one. The globe's three.js and
 *   GSAP load only for a globe visitor, and the sunrise's WebGL context opens
 *   only for a sunrise visitor.
 *
 * `prefersCalmNow()` (usePrefersCalm.ts) asks the same questions; the
 * connection check is the only one it does not share.
 */
export const HERO_GLOBE_ATTR = "data-hero-globe";

export const HERO_CHOICE_SCRIPT = `try{var c=navigator.connection||{},m=function(q){return matchMedia(q).matches};if(!c.saveData&&!/^(slow-2g|2g|3g)$/.test(c.effectiveType||"")&&!m("(prefers-reduced-motion: reduce)")&&!m("(prefers-reduced-data: reduce)"))document.documentElement.setAttribute(${JSON.stringify(HERO_GLOBE_ATTR)},"")}catch(e){}`;

/** The decision the inline script took. Without it (blocked script) the sunrise plays. */
export function heroWantsGlobe(): boolean {
  return document.documentElement.hasAttribute(HERO_GLOBE_ATTR);
}
