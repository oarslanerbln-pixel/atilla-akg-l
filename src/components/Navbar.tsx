"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Navbar.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";

const NAV_ITEMS = [
  { href: "#about", key: "nav_about" },
  { href: "#stats", key: "nav_stats" },
  { href: "#work", key: "nav_work" },
  { href: "#services", key: "nav_services" },
  { href: "#contact", key: "nav_contact" },
] as const;

export default function Navbar() {
  const [time, setTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeLang, setActiveLang, t } = useLanguage();
  const languages: Language[] = ["DE", "EN", "TR"];
  const { playClickSound } = useSoundDesign();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("de-DE", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close the mobile menu automatically if the viewport grows back into
  // desktop range, and lock page scroll while it's open.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playClickSound();
    setMenuOpen(false);
    // Allow default anchor behavior to continue after playing sound
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${menuOpen ? styles.menuOpen : ""}`}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <a href="#" className={styles.brand} onClick={handleLinkClick}>
          <span>ATILLA BARBAROSSA</span>
          <span className={styles.goldDot}>✦</span>
        </a>

        {/* Center Navigation Links */}
        <nav>
          <ul className={styles.navLinks}>
            {NAV_ITEMS.map((item) => (
              <li className={styles.navItem} key={item.href}>
                <a href={item.href} onClick={handleLinkClick}>{t(item.key)}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Live Status & Clock */}
        <div className={styles.statusWrapper}>
          <div
            className={styles.langDropdownWrapper}
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <div className={styles.langSelected}>
              {activeLang}
              <svg className={`${styles.chevron} ${langOpen ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>

            {langOpen && (
              <div className={styles.langMenu}>
                {languages.filter(l => l !== activeLang).map(lang => (
                  <div
                    key={lang}
                    className={styles.langOption}
                    onClick={() => {
                      setActiveLang(lang);
                      setLangOpen(false);
                      playClickSound();
                    }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>

          {time && (
            <div className={styles.liveClock}>
              <span>BERLIN / ISTANBUL</span>
              <span className={styles.timeDigits}>{time}</span>
            </div>
          )}
          <div className={styles.statusBadge}>
            <span className={styles.pulseDot}></span>
            <span>{t('nav_status')}</span>
          </div>
        </div>

        {/* Mobile / tablet menu trigger */}
        <button
          type="button"
          className={styles.hamburger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => {
            playClickSound();
            setMenuOpen((open) => !open);
          }}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </div>

      {/* Full-screen mobile / tablet menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className={styles.mobileMenuLinks}>
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={styles.mobileMenuLink}
                  onClick={handleLinkClick}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  {t(item.key)}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className={styles.mobileMenuFooter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * NAV_ITEMS.length, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.mobileLangRow}>
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    className={`${styles.mobileLangOption} ${lang === activeLang ? styles.mobileLangOptionActive : ""}`}
                    onClick={() => {
                      setActiveLang(lang);
                      playClickSound();
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className={styles.mobileStatusRow}>
                <span className={styles.pulseDot}></span>
                <span>{t('nav_status')}</span>
                {time && <span className={styles.mobileTime}>{time} · BERLIN / ISTANBUL</span>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
