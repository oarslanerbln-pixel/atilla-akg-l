"use client";

import { useEffect, useRef } from "react";
import styles from "./Brands.module.css";
import { useLanguage } from "@/context/LanguageContext";

// Commercial brands only. Tourism boards and institutions (UNESCO, Visit
// Kazakhstan …) moved to the Partners section, where each gets the context a
// destination client reads them for — see src/lib/partners.ts.
// Written in their own case; the capitals come from CSS, so a screen reader
// says "Gillette", not G-I-L-L-E-T-T-E. Each carries the language it is
// named in: CSS uppercases by the page's language, and under Turkish that
// sets GİLLETTE and RİXOS — words no brand spells that way.
const brands = [
  { name: "Rixos Hotels", lang: "en" },
  { name: "Accor Live Limitless", lang: "en" },
  { name: "Gillette", lang: "en" },
  { name: "BER Flughafen", lang: "de" },
];

// Reading pace in pixels per second. Around 30 the eye can follow a name from
// edge to edge without chasing it; faster turns the band into a blur, slower
// makes it look stuck.
const SPEED = 30;

/**
 * The brand band under the hero.
 *
 * It used to shout: heavy capitals, a gold spotlight and a shimmering ribbon,
 * all moving at once right after the hero. Now it is quiet type — light,
 * widely spaced, in warm grey — gliding past at a reading pace, so it reads
 * as a credit line rather than an advert.
 *
 * The loop's duration is derived from the track's measured width, so the band
 * moves at the same speed on a phone and on a wide screen instead of racing
 * on the larger one. A mouse resting on it pauses it; a visitor who asked for
 * less motion gets the names standing still (see Brands.module.css).
 */
export default function Brands() {
  const { t } = useLanguage();
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = marquee?.firstElementChild as HTMLElement | null;
    if (!marquee || !track) return;
    const update = () => {
      marquee.style.setProperty("--duration", `${Math.round(track.offsetWidth / SPEED)}s`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const renderTrack = (copy: boolean) => (
    <ul className={styles.track} aria-hidden={copy || undefined}>
      {brands.map((brand) => (
        <li key={brand.name} className={styles.brandItem}>
          <span className={styles.brandName} lang={brand.lang}>
            {brand.name}
          </span>
          <span className={styles.separator} aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.section} aria-label={t("brands_label")}>
      <div className={styles.marquee} ref={marqueeRef}>
        {renderTrack(false)}
        {/* Second copy for a seamless loop. */}
        {renderTrack(true)}
      </div>
    </section>
  );
}
