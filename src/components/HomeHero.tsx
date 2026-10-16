"use client";

import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import Hero from "./Hero";
import { useIntroDone } from "@/hooks/useIntroDone";
import { heroWantsGlobe } from "@/lib/heroChoice";

/** How long, once the intro has gone, the paper may stay blank waiting for the globe. */
const PATIENCE_MS = 1000;

/**
 * Read from <html>, where an inline script put it before first paint
 * (src/lib/heroChoice.ts), and kept for the page load: a preference changed
 * later never swaps one opening for the other in front of the visitor.
 * HeroGlobe answers a later calm preference with a still frame of its own.
 */
let choice: boolean | undefined;
const wantsGlobe = () => (choice ??= heroWantsGlobe());
const unchanging = () => () => {};
const onServer = () => false;

/**
 * Two openings. The compass globe on every screen, phones included: three.js
 * and GSAP, about 190 KB gzipped, loaded after the page is interactive. For
 * anyone who asked for less motion or less data, or is on a 3G-class
 * connection, the sea at sunrise: a few kilobytes of shader.
 *
 * The server renders the sunrise for everyone. For a globe visitor it is
 * blank paper before its opening plays, and so is the globe's, so the globe
 * takes its place unseen: the sunrise holds its first frame while the globe's
 * code arrives. If that takes too long, or fails, the sunrise opens after all
 * and stays.
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
