"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, Volume2, VolumeX } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import ed from "./editorial.module.css";
import styles from "./CaseStudy.module.css";
import type { TranslationKeys } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import type { Reel } from "@/lib/reels/manifest";

const EASE = [0.16, 1, 0.3, 1] as const;

// The reel's own insights, as Instagram reported them.
const METRICS: { value: number; grouped?: boolean; label: TranslationKeys }[] = [
  { value: 559316, grouped: true, label: "stats_reach_accounts" },
  { value: 9655, grouped: true, label: "case_metric_likes" },
  { value: 174, label: "case_metric_comments" },
  { value: 55, label: "case_metric_shares" },
  { value: 12228, grouped: true, label: "case_metric_saves" },
];

/**
 * One reel told as a case page: brand and format beside the heading, the reel
 * standing upright beside the caption it went out with and what followed,
 * then its insights between hairlines.
 *
 * The film is the Novotel reel itself, mirrored into Vercel Blob by the reels
 * cron (CASE_REEL in lib/reels/manifest.ts). Until the cron has copied it,
 * the frame links to the reel on Instagram instead of playing another clip.
 */
export default function CaseStudy({ film, permalink }: { film: Pick<Reel, "videoUrl" | "posterUrl"> | null; permalink: string }) {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const calm = usePrefersCalm();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const at = (delay: number, duration: number) => (calm ? { duration: 0 } : { duration, ease: EASE, delay });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: at(delay, 0.9),
  });

  // isPlaying follows the element's own play/pause events, so a play() the
  // browser refuses leaves the button saying "play" rather than lying.
  const handlePlayPause = () => {
    playClickSound();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  };

  const handleToggleMute = () => {
    playClickSound();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="case-study" className={`${ed.section} ${ed.chapter} ${ed.horizon}`} aria-labelledby="case-title">
      <div className="container">
        <motion.div className={ed.headSplit} {...reveal()}>
          <div>
            <p className={ed.eyebrow}>{t("case_title")}</p>
            <h2 id="case-title" className={ed.title}>
              {t("case_subtitle")}
            </h2>
          </div>
          <dl className={styles.meta}>
            <div>
              <dt>{t("case_meta_brand")}</dt>
              <dd>{t("case_meta_brand_val")}</dd>
            </div>
            <div>
              <dt>{t("case_meta_type")}</dt>
              <dd>{t("case_meta_type_val")}</dd>
            </div>
          </dl>
        </motion.div>

        <div className={styles.feature}>
          {/* Footage opens like a curtain rising. */}
          <motion.div
            className={styles.film}
            data-cursor={film ? (isPlaying ? "PAUSE" : "PLAY") : undefined}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={at(0, 1.4)}
          >
            {film ? (
              <>
                {/* Nothing of the video is fetched until the visitor presses play. */}
                <video
                  ref={videoRef}
                  src={film.videoUrl}
                  poster={film.posterUrl}
                  preload="none"
                  className={styles.video}
                  loop
                  playsInline
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  type="button"
                  className={`${styles.playTrigger} ${ed.playHost}`}
                  data-playing={isPlaying || undefined}
                  onClick={handlePlayPause}
                  aria-label={t(isPlaying ? "video_pause" : "video_play")}
                >
                  {!isPlaying && (
                    <span className={ed.play}>
                      <span className={ed.playIcon} aria-hidden="true">
                        <Play size={18} strokeWidth={1.25} />
                      </span>
                      <span className={ed.playLabel} aria-hidden="true">
                        {t("video_play")}
                      </span>
                    </span>
                  )}
                </button>
                {isPlaying && (
                  <button
                    type="button"
                    className={styles.soundControl}
                    onClick={handleToggleMute}
                    aria-label={t(isMuted ? "video_unmute" : "video_mute")}
                  >
                    {isMuted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
                  </button>
                )}
              </>
            ) : (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.playTrigger} ${styles.external} ${ed.playHost}`}
              >
                <span className={ed.play}>
                  <span className={ed.playIcon} aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={1.25} />
                  </span>
                  <span className={ed.playLabel}>{t("case_watch_instagram")}</span>
                </span>
              </a>
            )}
          </motion.div>

          <div className={styles.story}>
            <motion.figure className={styles.caption} {...reveal()}>
              <figcaption className={ed.kicker}>{t("case_caption_label")}</figcaption>
              <blockquote className={styles.captionText}>
                <p>{t("case_caption_text")}</p>
              </blockquote>
            </motion.figure>
            <motion.div className={styles.desc} {...reveal(0.15)}>
              <p>{t("case_desc1")}</p>
              <p>{t("case_desc2")}</p>
            </motion.div>
          </div>
        </div>

        <motion.ul className={styles.figures} {...reveal()}>
          {METRICS.map((metric) => (
            <li key={metric.label} className={styles.figure}>
              <span className={`${ed.figureValue} ${styles.value}`}>
                <AnimatedCounter to={metric.value} formatNumber={metric.grouped} />
              </span>
              <span className={ed.figureLabel}>{t(metric.label)}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
