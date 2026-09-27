/**
 * The intro plays once per visitor. The flag is read in two places that
 * must agree: the Preloader component, and an inline script in the root
 * layout that runs before first paint.
 *
 * The overlay is server-rendered so a first-time visitor never sees the page
 * flash before it — which also meant a returning visitor saw it until the
 * JavaScript arrived and removed it. The inline script marks <html> for them
 * before anything is drawn, and CSS keeps the overlay hidden.
 */
export const INTRO_SEEN_KEY = "atilla_preloader_seen";

export const INTRO_SEEN_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)})!==null)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;
