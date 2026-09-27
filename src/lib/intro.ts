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

/**
 * "The intro is out of the way" — the moment the hero's opening choreography
 * may start. Without it the hero animated underneath the overlay on a first
 * visit and the visitor saw only its last frame. The Preloader marks it when
 * the overlay leaves, or at once when it is never shown (returning visitor,
 * reduced motion). A module-level flag is enough: there is one intro per page
 * load.
 */
let introDone = false;
const introListeners = new Set<() => void>();

export function markIntroDone(): void {
  if (introDone) return;
  introDone = true;
  introListeners.forEach((listener) => listener());
}

export function subscribeIntroDone(listener: () => void): () => void {
  introListeners.add(listener);
  return () => {
    introListeners.delete(listener);
  };
}

export function isIntroDone(): boolean {
  return introDone;
}
