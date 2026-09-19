"use client";

import { useSyncExternalStore } from "react";

/**
 * True when the visitor has signalled they want less motion or less data.
 *
 * Read through useSyncExternalStore rather than an effect: matchMedia *is* an
 * external store, so this gives the right answer on the very first client
 * render instead of after a second one, and it keeps up if the preference
 * changes while the page is open.
 */
const QUERIES = ["(prefers-reduced-motion: reduce)", "(prefers-reduced-data: reduce)"];

function subscribe(onChange: () => void): () => void {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

function getSnapshot(): boolean {
  const saveData =
    // Not in the DOM type definitions, and absent in Safari and Firefox.
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return saveData || QUERIES.some((q) => window.matchMedia(q).matches);
}

// The server cannot know the preference; assume the full experience and let
// the first client render correct it.
function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersCalm(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
