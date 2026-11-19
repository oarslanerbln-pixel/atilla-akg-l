"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type Transition } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import BrandWordmark from "@/components/BrandWordmark";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { LANGUAGES, pagePath } from "@/lib/locales";
import { games, type Game } from "@/lib/games";
import type { Language, TranslationKeys } from "@/i18n/translations";
import styles from "./GamesPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const gameKey = (game: Game, part: string) => `games_${game.textKey}_${part}` as TranslationKeys;

/**
 * /games — Barbarossa Games. A short page: the name, one line on what the
 * games are, and a card per game with its cover, a few sentences, the
 * languages and devices it runs on, its download size, and "Play".
 *
 * "Play" opens the game in a new tab (it is a full-screen Unity WebGL build
 * under public/games/, nothing of the site around it). The cover loads with
 * the page; the game's ~35 MB only when the visitor presses Play.
 */
export default function GamesPage() {
  const { t, activeLang, setActiveLang } = useLanguage();
  const calm = usePrefersCalm();

  const at = (delay: number, duration = 1): Transition =>
    calm ? { duration: 0 } : { duration, ease: EASE, delay };
  // Starts soft and low, never hidden: the copy is readable at first paint,
  // even before the script runs (the site's rule for entrances).
  const rise = (delay: number) => ({
    initial: { opacity: 0.35, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: at(delay),
  });

  // In place, like the other switchers; the address follows the language.
  const chooseLang = (choice: Language) => {
    setActiveLang(choice);
    window.history.replaceState(null, "", pagePath("games", choice));
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <Link href={pagePath("home", activeLang)} className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <BrandWordmark className={styles.wordmark} />
          </Link>
          <div className={styles.topbarEnd}>
            <Link href={pagePath("home", activeLang)} className={styles.homeLink}>
              {t("pkg_home")}
            </Link>
            <div className={styles.langs} role="group" aria-label={t("pkg_lang_label")}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={styles.lang}
                  aria-pressed={activeLang === lang}
                  onClick={() => chooseLang(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <section className={`container ${styles.head}`}>
          <m.p className={styles.eyebrow} {...rise(0.05)}>
            {t("games_eyebrow")}
          </m.p>
          <m.h1 className={styles.title} {...rise(0.15)}>
            {t("games_title")}
          </m.h1>
          <m.p className={styles.intro} {...rise(0.25)}>
            {t("games_intro")}
          </m.p>
        </section>

        <section className={`container ${styles.list}`} aria-label={t("games_title")}>
          {games.map((game) => (
            <m.article key={game.id} className={styles.card} {...rise(0.35)}>
              <div className={styles.cover}>
                <Image
                  src={game.cover.src}
                  alt={t("games_image_alt")}
                  width={game.cover.width}
                  height={game.cover.height}
                  sizes="(max-width: 900px) 100vw, 680px"
                  priority
                  className={styles.coverImage}
                />
                <span className={styles.badge}>{t(gameKey(game, "badge"))}</span>
              </div>

              <div className={styles.body}>
                <p className={styles.place}>{t(gameKey(game, "place"))}</p>
                <h2 className={styles.name}>{game.title}</h2>
                <p className={styles.text}>{t(gameKey(game, "text"))}</p>
                <p className={styles.facts}>{t(gameKey(game, "facts"))}</p>

                <a
                  href={game.href}
                  target="_blank"
                  rel="noopener"
                  className={styles.play}
                  aria-label={`${t("games_play")}: ${game.title} (${t("games_new_tab")})`}
                >
                  <span>{t("games_play")}</span>
                  <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </a>
                <p className={styles.size}>{t(gameKey(game, "size"))}</p>
              </div>
            </m.article>
          ))}
        </section>
      </main>

      {/* Imprint and privacy notice must be reachable from every page. */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>{t("footer_copyright")}</span>
          <nav className={styles.legal} aria-label={t("footer_imprint")}>
            <Link href="/impressum">{t("footer_imprint")}</Link>
            <span aria-hidden="true">·</span>
            <Link href={pagePath("privacy", activeLang)}>{t("footer_privacy")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
