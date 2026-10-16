"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type Transition } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { socialProfiles } from "@/lib/site";
import { fill } from "@/i18n/format";
import styles from "./Hero.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useIntroDone } from "@/hooks/useIntroDone";
import { useMagnetic } from "@/hooks/useMagnetic";
import HeroHorizon from "./HeroHorizon";
import { InstagramIcon, TikTokIcon, YoutubeIcon } from "./SocialIcons";

const EASE = [0.16, 1, 0.3, 1] as const;
const SHUTTER = [0.76, 0, 0.24, 1] as const;

// The opening, in seconds from the moment the intro overlay is out of the way.
const T = {
  line: 0,
  shutter: 0.35,
  greeting: 0.5,
  name: 0.65,
  divider: 1.3,
  subtitle: 1.45,
  value: 1.65,
  cta: 1.85,
  social: 2.1,
  scroll: 2.5,
};

/**
 * The hero opens like a film.
 *
 * A gold line draws across the centre — the horizon — and the paper mattes
 * above and below it part like curtains on a bright morning, revealing the
 * sea at sunrise. The name sharpens into focus like a lens finding its mark,
 * set in the same light Inter Tight as every heading on the page; the rest
 * follows in a short, ordered cascade. It starts only when the intro overlay
 * leaves (useIntroDone), so nobody watches it play underneath the overlay.
 *
 * Scrolling away lifts the camera like a drone climbing (HeroHorizon reads
 * the scroll) while the copy drifts up and fades. The hero stays one screen
 * tall: nothing holds the scroll, and the way to the work is never longer.
 * The two buttons lean toward a real mouse pointer.
 *
 * A visitor who asked for less motion gets the finished frame: no mattes, no
 * letters, no drift, no lean.
 *
 * `hold` keeps it at that first frame, paper and nothing else, while HomeHero
 * finds out whether the globe takes its place.
 */
export default function Hero({ hold = false }: { hold?: boolean }) {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const calm = usePrefersCalm();
  const go = useIntroDone() && !hold;

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
    <section className={styles.hero} ref={heroRef}>
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
          {/* A greeting, not a heading: the name below is the page's one h1,
              and nothing should outrank it in the outline. */}
          <motion.p
            className={styles.greeting}
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={go ? { opacity: 1, letterSpacing: "0.32em" } : undefined}
            transition={at(T.greeting, 1.2)}
          >
            {t('hero_welcome')}
          </motion.p>

          {/* The page's largest text, so the moment it is first drawn is the
              Largest Contentful Paint. It used to wait for the script and the
              intro, hidden: 4.6 s on a throttled phone. On phones and tablets
              it is drawn from the first frame, soft and a little low, and the
              opening pulls it into focus. At a desk it stays paper until the
              opening starts (`.open`), so the globe can still take the
              sunrise's place unseen (HomeHero). */}
          <h1 className={`${styles.name} ${go ? styles.open : ""}`}>
            <motion.span
              className={styles.nameShine}
              initial={{ filter: "blur(12px)", y: "0.12em" }}
              animate={go ? { filter: "blur(0px)", y: "0em" } : undefined}
              transition={at(T.name, 1.3)}
            >
              {/* The space keeps the words apart where the line break is
                  ignored, as it is when a crawler extracts the text. */}
              <span className={styles.firstName}>Atilla</span>{" "}
              <br />
              <span className={styles.lastName}>Barbarossa</span>
            </motion.span>
          </h1>

          <motion.div
            className={styles.divider}
            initial={{ scaleX: 0 }}
            animate={go ? { scaleX: 1 } : undefined}
            transition={at(T.divider, 1)}
          />

          <div className={styles.subtitle}>
            <motion.span {...rise(T.subtitle)}>{t('hero_aud_hotels')}</motion.span>
            <motion.span className={styles.separator} aria-hidden="true" {...rise(T.subtitle + 0.06)} />
            <motion.span {...rise(T.subtitle + 0.12)}>{t('hero_aud_destinations')}</motion.span>
            <motion.span className={styles.separator} aria-hidden="true" {...rise(T.subtitle + 0.18)} />
            <motion.span {...rise(T.subtitle + 0.24)}>{t('hero_aud_brands')}</motion.span>
          </div>

          {/* What the work is and what it gives a client, in one sentence and
              only with figures the Stats section already shows. */}
          <motion.p className={styles.value} {...rise(T.value)}>
            {t('hero_value')}
          </motion.p>

          {/* Entrance on the wrapper, the magnetic lean on the link itself, so
              the two transforms never fight. The enquiry leads: a hotel or
              tourism board arriving here has come to ask, not to browse. */}
          <div className={styles.ctaGroup}>
            <motion.div className={styles.ctaSlot} {...rise(T.cta)}>
              <motion.a
                ref={primaryRef}
                style={primaryLean}
                href="#contact"
                className={styles.primaryBtn}
                onClick={() => playClickSound()}
                data-cursor="CONTACT"
              >
                {t('hero_cta_contact')}
              </motion.a>
            </motion.div>
            <motion.div className={styles.ctaSlot} {...rise(T.cta + 0.1)}>
              <motion.a
                ref={secondaryRef}
                style={secondaryLean}
                href="#work"
                className={styles.secondaryBtn}
                onClick={() => playClickSound()}
                data-cursor="PORTFOLIO"
              >
                {t('hero_cta_projects')}
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
              aria-label={fill(t("social_profile"), { platform: "Instagram" })}
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
              aria-label={fill(t("social_profile"), { platform: "TikTok" })}
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
              aria-label={fill(t("social_profile"), { platform: "YouTube" })}
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
