"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { socialProfiles } from "@/lib/site";
import { HTML_LANG, LANGUAGES, LANGUAGE_NAMES, pagePath } from "@/lib/locales";
import { roadmapPath } from "@/lib/roadmap";
import styles from "./Footer.module.css";
import RevealText from "./RevealText";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Footer() {
  const { t, activeLang } = useLanguage();
  const { playClickSound } = useSoundDesign();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={styles.content}
        >
          <div className={styles.subtitleWrapper}>
            <span className={styles.subtitle}>{t('footer_subtitle')}</span>
          </div>
          
          {/* A call to action set large, not a heading: the hero's name is the
              page's one h1. A div, as RevealText renders block elements. */}
          <div className={styles.massiveTitle}>
            <a href="#contact" onClick={() => playClickSound()} data-cursor="TALK">
              <RevealText text={t('footer_massive')} delay={0.2} />
            </a>
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.socials}>
              <a
                href={socialProfiles.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="INSTAGRAM"
              >
                INSTAGRAM
              </a>
              <a
                href={socialProfiles.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="TIKTOK"
              >
                TIKTOK
              </a>
              <a
                href={socialProfiles.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic"
                onClick={() => playClickSound()}
                data-cursor="YOUTUBE"
              >
                YOUTUBE
              </a>
            </div>
            
            <div className={styles.copyright}>
              {t('footer_copyright')}
            </div>

            {/* Imprint and privacy notice are mandatory for a commercial site
                operated from Germany, and must be reachable from every page.
                The translation keys existed but nothing rendered them. */}
            <div className={styles.links}>
              <div className={styles.legalLinks}>
                <Link href={pagePath("socialMedia", activeLang)}>{t('footer_social_media')}</Link>
                <span aria-hidden="true">·</span>
                <Link href={roadmapPath(activeLang)}>{t('footer_roadmap')}</Link>
              </div>
              <div className={styles.legalLinks}>
                <Link href="/impressum">{t('footer_imprint')}</Link>
                <span aria-hidden="true">·</span>
                <Link href="/datenschutz">{t('footer_privacy')}</Link>
              </div>

              {/* Each language has its own address (see lib/locales.ts). The
                  switcher in the navbar changes the text in place; these are
                  the addresses themselves, as plain links a crawler follows
                  from one language to the next. */}
              <nav className={styles.langLinks} aria-label={t('pkg_lang_label')}>
                {LANGUAGES.map((lang) => (
                  <a
                    key={lang}
                    href={pagePath("home", lang)}
                    hrefLang={HTML_LANG[lang]}
                    lang={HTML_LANG[lang]}
                    aria-current={lang === activeLang ? "true" : undefined}
                  >
                    {LANGUAGE_NAMES[lang]}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
