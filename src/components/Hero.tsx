"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { socialProfiles } from "@/lib/site";
import styles from "./Hero.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useIntroDone } from "@/hooks/useIntroDone";
import { useMagnetic } from "@/hooks/useMagnetic";
import HeroHorizon from "./HeroHorizon";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="15" x="2" y="4.5" rx="4" />
    <polygon points="10 8.5 15 12 10 15.5 10 8.5" fill="currentColor" stroke="none" />
  </svg>
);

const EASE = [0.16, 1, 0.3, 1] as const;
const SHUTTER = [0.76, 0, 0.24, 1] as const;

// The opening, in seconds from the moment the intro overlay is out of the way.
const T = {
  line: 0,
  shutter: 0.35,
  greeting: 0.5,
  letters: 0.65,
  stagger: 0.04,
  divider: 1.3,
  subtitle: 1.45,
  cta: 1.75,
  social: 2.0,
  scroll: 2.4,
};

/**
 * One word of the name, letter by letter, each pulled into focus: it starts
 * soft and a little low and sharpens into place, like a lens finding its
 * mark. The glyphs are drawn by CSS (`::before` from data-ch), so they add no
 * text to the page; the real, readable name is the layer underneath.
 */
function FocusWord({
  text,
  start,
  go,
  onDone,
  className,
}: {
  text: string;
  start: number;
  go: boolean;
  onDone?: () => void;
  className: string;
}) {
  const chars = Array.from(text);
  return (
    <span className={`${styles.word} ${className}`}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          className={styles.letter}
          data-ch={ch}
          initial={{ opacity: 0, y: "0.35em", filter: "blur(10px)" }}
          animate={go ? { opacity: 1, y: "0em", filter: "blur(0px)" } : undefined}
          transition={{ duration: 1, ease: EASE, delay: start + i * T.stagger }}
          onAnimationComplete={i === chars.length - 1 ? onDone : undefined}
        />
      ))}
    </span>
  );
}

/**
 * The hero opens like a film.
 *
 * A gold line draws across the centre — the horizon — and the black mattes
 * above and below it part to reveal the sea. The name sharpens into focus
 * letter by letter, then settles into its gold shimmer; the rest follows in
 * a short, ordered cascade. It starts only when the intro overlay leaves
 * (useIntroDone), so nobody watches it play underneath the overlay.
 *
 * Scrolling away lifts the camera like a drone climbing (HeroHorizon reads
 * the scroll) while the copy drifts up and fades. The hero stays one screen
 * tall: nothing holds the scroll, and the way to the work is never longer.
 * The two buttons lean toward a real mouse pointer.
 *
 * A visitor who asked for less motion gets the finished frame: no mattes, no
 * letters, no drift, no lean.
 */
export default function Hero() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const calm = usePrefersCalm();
  const go = useIntroDone();
  const [lettersDone, setLettersDone] = useState(false);
  const showShine = calm || lettersDone;

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);

  const { ref: primaryRef, style: primaryLean } = useMagnetic<HTMLAnchorElement>(8);
  const { ref: secondaryRef, style: secondaryLean } = useMagnetic<HTMLAnchorElement>(8);

  const at = (delay: number, duration = 0.9): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: go ? { opacity: 1, y: 0 } : undefined,
    transition: at(delay),
  });

  return (
    <section className={styles.hero} id="home" ref={heroRef}>
      {/* Live 3D backdrop; its reasoning lives in HeroHorizon.tsx. */}
      <div className={styles.backdrop}>
        <HeroHorizon />
        <div className={styles.overlay}></div>
      </div>

      {/* The opening: horizon line, then the mattes part. */}
      {!calm && (
        <div className={styles.shutter} aria-hidden="true">
          <motion.div
            className={`${styles.matte} ${styles.matteTop}`}
            initial={{ scaleY: 1 }}
            animate={go ? { scaleY: 0 } : undefined}
            transition={{ duration: 1.3, ease: SHUTTER, delay: T.shutter }}
          />
          <motion.div
            className={`${styles.matte} ${styles.matteBottom}`}
            initial={{ scaleY: 1 }}
            animate={go ? { scaleY: 0 } : undefined}
            transition={{ duration: 1.3, ease: SHUTTER, delay: T.shutter }}
          />
          <motion.div
            className={styles.horizonLine}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={go ? { scaleX: 1, opacity: 0 } : undefined}
            transition={{
              scaleX: { duration: 0.6, ease: EASE, delay: T.line },
              opacity: { duration: 0.6, ease: "easeOut", delay: T.shutter + 0.5 },
            }}
          />
        </div>
      )}

      {/* Content drifts up and fades as the hero scrolls away. */}
      <motion.div
        className={styles.content}
        style={calm ? undefined : { y: contentY, opacity: contentOpacity, scale: contentScale }}
      >
        <div className={styles.textContent}>
          <motion.h2
            className={styles.greeting}
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={go ? { opacity: 1, letterSpacing: "0.32em" } : undefined}
            transition={at(T.greeting, 1.2)}
          >
            {t('hero_welcome')}
          </motion.h2>

          <h1 className={styles.name}>
            {/* The readable name, and the one that shimmers once the letters
                have landed. It sets the layout; the letters sit over it. */}
            <motion.span
              className={styles.nameShine}
              initial={{ opacity: 0 }}
              animate={{ opacity: showShine ? 1 : 0 }}
              transition={calm ? { duration: 0 } : { duration: 1, ease: "easeInOut" }}
            >
              <span className={styles.firstName}>Atilla</span>
              <br />
              <span className={styles.lastName}>BARBAROSSA</span>
            </motion.span>
            {!calm && (
              <motion.span
                className={styles.nameLetters}
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: lettersDone ? 0 : 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <FocusWord text="Atilla" start={T.letters} go={go} className={styles.firstName} />
                <br />
                <FocusWord
                  text="BARBAROSSA"
                  start={T.letters + 6 * T.stagger}
                  go={go}
                  className={styles.lastName}
                  onDone={() => setLettersDone(true)}
                />
              </motion.span>
            )}
          </h1>

          <motion.div
            className={styles.divider}
            initial={{ scaleX: 0 }}
            animate={go ? { scaleX: 1 } : undefined}
            transition={at(T.divider, 1)}
          />

          <div className={styles.subtitle}>
            <motion.span {...rise(T.subtitle)}>{t('hero_storytelling')}</motion.span>
            <motion.span className={styles.separator} aria-hidden="true" {...rise(T.subtitle + 0.06)} />
            <motion.span {...rise(T.subtitle + 0.12)}>{t('hero_excellence')}</motion.span>
            <motion.span className={styles.separator} aria-hidden="true" {...rise(T.subtitle + 0.18)} />
            <motion.span {...rise(T.subtitle + 0.24)}>{t('hero_direction')}</motion.span>
          </div>

          {/* Entrance on the wrapper, the magnetic lean on the link itself, so
              the two transforms never fight. */}
          <div className={styles.ctaGroup}>
            <motion.div className={styles.ctaSlot} {...rise(T.cta)}>
              <motion.a
                ref={primaryRef}
                style={primaryLean}
                href="#work"
                className={styles.primaryBtn}
                onClick={() => playClickSound()}
                data-cursor="PORTFOLIO"
              >
                {t('hero_cta_projects')}
              </motion.a>
            </motion.div>
            <motion.div className={styles.ctaSlot} {...rise(T.cta + 0.1)}>
              <motion.a
                ref={secondaryRef}
                style={secondaryLean}
                href="#contact"
                className={styles.secondaryBtn}
                onClick={() => playClickSound()}
                data-cursor="CONTACT"
              >
                {t('hero_cta_contact')}
              </motion.a>
            </motion.div>
          </div>

          {/* Social links: thin gold rings, see Hero.module.css */}
          <div className={styles.socialIcons}>
            <motion.a
              {...rise(T.social)}
              href={socialProfiles.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="INSTAGRAM"
              onClick={() => playClickSound()}
              aria-label="Instagram Profile"
            >
              <span className={styles.iconInner}>
                <InstagramIcon />
              </span>
            </motion.a>
            <motion.a
              {...rise(T.social + 0.08)}
              href={socialProfiles.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="TIKTOK"
              onClick={() => playClickSound()}
              aria-label="TikTok Profile"
            >
              <span className={styles.iconInner}>
                <TikTokIcon />
              </span>
            </motion.a>
            <motion.a
              {...rise(T.social + 0.16)}
              href={socialProfiles.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCapsule}
              data-cursor="YOUTUBE"
              onClick={() => playClickSound()}
              aria-label="YouTube Channel"
            >
              <span className={styles.iconInner}>
                <YoutubeIcon />
              </span>
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : undefined}
        transition={at(T.scroll, 1)}
        className={styles.scrollIndicator}
      >
        <span className={styles.scrollText}>{t('hero_scroll')}</span>
        <motion.div
          animate={calm ? undefined : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className={styles.scrollIcon} />
        </motion.div>
      </motion.div>
    </section>
  );
}
