"use client";

import Image from "next/image";
import { m, type Transition, type Variants } from "framer-motion";
import { Play } from "lucide-react";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import styles from "./PunkteMockups.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A4 pages rendered from the product's own HTML (kurs-v2/tasarim), 1:1.414. */
const A4 = { width: 620, height: 877 } as const;

/**
 * The free Punkte-Check as an object: the cover in front, two real inside
 * pages fanned out behind it ("Die 10 Punkte-Fallen", tip 1 with its bars).
 * The pages arrive stacked and fan out; a mouse over them opens the fan a
 * little further. Everything sits in a box of fixed proportions, so it
 * scales as one piece on any screen.
 */
export function CheckStack({ coverAlt }: { coverAlt: string }) {
  const calm = usePrefersCalm();
  const at = (delay: number, duration = 1.2): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };

  const back = (side: -1 | 1, delay: number): Variants => ({
    stack: { rotate: 0, x: "0%", y: "0%" },
    rest: { rotate: side * 10, x: `${side * 26}%`, y: "4%", transition: at(delay) },
    open: { rotate: side * 13, x: `${side * 31}%`, y: "2%", transition: at(0, 0.7) },
  });
  const front: Variants = {
    stack: { rotate: 0, y: "2%" },
    rest: { rotate: -1.5, y: "0%", transition: at(0.2) },
    open: { rotate: -2.5, y: "-2%", transition: at(0, 0.7) },
  };

  return (
    <m.div
      className={styles.stack}
      initial={calm ? "rest" : "stack"}
      animate="rest"
      whileHover={calm ? undefined : "open"}
    >
      <span className={styles.halo} aria-hidden="true" />

      <m.div className={`${styles.sheet} ${styles.sheetBack}`} variants={back(-1, 0.45)} aria-hidden="true">
        <Image src="/punkte/check-seite-2.webp" alt="" {...A4} sizes="(max-width: 640px) 40vw, 260px" />
      </m.div>
      <m.div className={`${styles.sheet} ${styles.sheetBack}`} variants={back(1, 0.55)} aria-hidden="true">
        <Image src="/punkte/check-seite-3.webp" alt="" {...A4} sizes="(max-width: 640px) 40vw, 260px" />
      </m.div>
      <m.div className={`${styles.sheet} ${styles.sheetFront}`} variants={front}>
        <Image
          src="/punkte/check-cover.webp"
          alt={coverAlt}
          width={820}
          height={1159}
          priority
          sizes="(max-width: 640px) 48vw, 300px"
        />
      </m.div>

      <span className={styles.tag}>
        <strong>0 €</strong>
        <span>11 Seiten · PDF</span>
      </span>
      <span className={`${styles.coin} ${styles.coin1}`} aria-hidden="true">
        P
      </span>
      <span className={`${styles.coin} ${styles.coin2}`} aria-hidden="true">
        P
      </span>
      <span className={`${styles.coin} ${styles.coin3}`} aria-hidden="true">
        P
      </span>
    </m.div>
  );
}

/**
 * Das Punkte-System as a bundle, from parts that exist today: the Payback-Weg
 * on a tablet, the Amex-Weg and the Starthilfe as pages behind it, the
 * Punkte-Rechner on a phone and one of the animation films. Each piece
 * arrives on its own once the bundle scrolls into view; the phone then
 * floats gently. Decorative: the section's text says what is in it.
 */
export function SystemBundle({ caption }: { caption: string }) {
  const calm = usePrefersCalm();
  const at = (delay: number, duration = 1.1): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };

  const piece = (from: { x?: string; y?: string; rotate?: number }, to: { rotate?: number }, delay: number) => ({
    initial: calm ? { opacity: 1, x: 0, y: 0, rotate: to.rotate ?? 0 } : { opacity: 0, x: from.x ?? 0, y: from.y ?? 0, rotate: from.rotate ?? 0 },
    whileInView: { opacity: 1, x: 0, y: 0, rotate: to.rotate ?? 0 },
    viewport: { once: true, margin: "0px 0px -120px 0px" },
    transition: at(delay),
  });

  return (
    <figure className={styles.bundleFigure}>
      <div className={styles.bundle} aria-hidden="true">
        <span className={styles.bundleGlow} />

        <m.div className={`${styles.page} ${styles.pageLeft}`} {...piece({ x: "30%", rotate: 0 }, { rotate: -9 }, 0.1)}>
          <Image src="/punkte/weg-amex.webp" alt="" {...A4} sizes="(max-width: 640px) 34vw, 250px" />
        </m.div>
        <m.div className={`${styles.page} ${styles.pageRight}`} {...piece({ x: "-30%", rotate: 0 }, { rotate: 8 }, 0.18)}>
          <Image src="/punkte/einrichten.webp" alt="" {...A4} sizes="(max-width: 640px) 34vw, 250px" />
        </m.div>

        <m.div className={styles.tablet} {...piece({ y: "8%" }, {}, 0)}>
          <div className={styles.tabletScreen}>
            <Image src="/punkte/weg-payback.webp" alt="" width={900} height={1273} sizes="(max-width: 640px) 46vw, 340px" />
          </div>
        </m.div>

        <m.div className={styles.film} {...piece({ x: "-20%", y: "10%" }, { rotate: -3 }, 0.35)}>
          <Image src="/punkte/gleiche-meilen-poster.webp" alt="" width={1280} height={720} sizes="(max-width: 640px) 36vw, 260px" />
          <span className={styles.filmPlay}>
            <Play size={16} fill="currentColor" />
          </span>
          <span className={styles.filmLabel}>60 Sek.</span>
        </m.div>

        <m.div className={styles.phoneWrap} {...piece({ x: "20%", y: "12%" }, { rotate: 4 }, 0.45)}>
          <div className={styles.phone}>
            <div className={styles.phoneScreen}>
              <span className={styles.phoneBar}>Punkte-Rechner</span>
              <Image src="/punkte/rechner.webp" alt="" width={600} height={1200} sizes="(max-width: 640px) 26vw, 180px" />
            </div>
          </div>
        </m.div>
      </div>
      <figcaption className={styles.bundleCaption}>{caption}</figcaption>
    </figure>
  );
}
