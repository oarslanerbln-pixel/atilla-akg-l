"use client";

import { useSyncExternalStore } from "react";
import Hero from "./Hero";
import HeroEbookNote from "./HeroEbookNote";
import HeroGlobe from "./globe/HeroGlobe";
import { heroWantsGlobe } from "@/lib/heroChoice";
import styles from "./HomeHero.module.css";

/**
 * Read from <html>, where an inline script put it before first paint
 * (src/lib/heroChoice.ts), and kept for the page load: a preference changed
 * later never swaps one opening for the other in front of the visitor.
 * HeroGlobe answers a later calm preference with a still frame of its own.
 */
let choice: boolean | undefined;
const wantsGlobe = () => (choice ??= heroWantsGlobe());
const unchanging = () => () => {};
/** The server, and the client render that hydrates its markup, draw both. */
const undecided = () => null;

/**
 * Two openings. The compass globe on every screen, phones included. For
 * anyone who asked for less motion or less data, or is on a 3G-class
 * connection, the sea at sunrise: a few kilobytes of shader.
 *
 * Both are in the server's markup with their copy already drawn, so the
 * page's largest text never waits for a script: the inline script marks
 * <html> before first paint and the stylesheet shows only the visitor's
 * opening. Once hydrated, the other one is removed, which leaves one h1. The
 * globe's weight (three.js and GSAP, about 190 KB gzipped) loads only after
 * that, and only for a globe visitor; without WebGL the globe's copy stands
 * on its own.
 *
 * The id lives on this wrapper rather than on either section, so whatever
 * looks for #home (the WhatsApp button) keeps the same element.
 */
export default function HomeHero() {
  const globe = useSyncExternalStore<boolean | null>(unchanging, wantsGlobe, undecided);
  return (
    <div id="home" className={styles.home}>
      {globe !== false && (
        <div className={styles.globe}>
          <HeroGlobe />
        </div>
      )}
      {globe !== true && (
        <div className={styles.sunrise}>
          <Hero />
        </div>
      )}
      <HeroEbookNote />
    </div>
  );
}
