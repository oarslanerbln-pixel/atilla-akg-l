"use client";

import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import Hero from "./Hero";
import { useIntroDone } from "@/hooks/useIntroDone";
import { prefersCalmNow } from "@/hooks/usePrefersCalm";

/** A wide screen driven by a mouse or trackpad: a desk, not a phone or a tablet. */
const DESK = "(min-width: 900px) and (hover: hover) and (pointer: fine)";
/** How long, once the intro has gone, the paper may stay blank waiting for the globe. */
const PATIENCE_MS = 1000;

/**
 * Taken at the first client render and kept for the page load: a window
 * resized or a preference changed later never swaps one opening for the
 * other in front of the visitor. HeroGlobe answers a later calm preference
 * with a still frame of its own.
 */
let choice: boolean | undefined;
const wantsGlobe = () => (choice ??= window.matchMedia(DESK).matches && !prefersCalmNow());
const unchanging = () => () => {};
const onServer = () => false;

/**
 * Two openings, one per audience. On a phone, a tablet, or for anyone who
 * asked for less motion or less data, the sea at sunrise: a few kilobytes of
 * shader. At a desk, the compass globe, whose three.js and GSAP (about
 * 190 KB gzipped) a phone never downloads.
 *
 * The server renders the sunrise for everyone. Before its opening plays it is
 * blank paper, and so is the globe's, so the globe takes its place unseen:
 * the sunrise holds its first frame while the globe's code arrives. If that
 * takes too long, or fails, the sunrise opens after all and stays.
 *
 * The id lives on this wrapper rather than on either section, so whatever
 * looks for #home (the WhatsApp button) keeps the same element through the
 * swap.
 */
export default function HomeHero() {
  const globe = useSyncExternalStore(unchanging, wantsGlobe, onServer);
  const introDone = useIntroDone();
  const [Globe, setGlobe] = useState<ComponentType | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!globe || gaveUp) return;
    let cancelled = false;
    import("./globe/HeroGlobe").then(
      ({ default: loaded }) => {
        if (!cancelled) setGlobe(() => loaded);
      },
      () => {
        if (!cancelled) setGaveUp(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [globe, gaveUp]);

  useEffect(() => {
    if (!globe || Globe || gaveUp || !introDone) return;
    const timer = setTimeout(() => setGaveUp(true), PATIENCE_MS);
    return () => clearTimeout(timer);
  }, [globe, Globe, gaveUp, introDone]);

  return <div id="home">{Globe ? <Globe /> : <Hero hold={globe && !gaveUp} />}</div>;
}
