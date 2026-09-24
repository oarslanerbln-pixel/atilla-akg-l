"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Navbar.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";
import { useScrollLock } from "@/hooks/useScrollLock";
import LiveClock from "./LiveClock";
import BrandMark from "./BrandMark";

const NAV_ITEMS = [
  { href: "#about", key: "nav_about" },
  { href: "#stats", key: "nav_stats" },
  { href: "#work", key: "nav_work" },
  { href: "#services", key: "nav_services" },
  { href: "#contact", key: "nav_contact" },
] as const;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeLang, setActiveLang, t } = useLanguage();
  const languages: Language[] = ["DE", "EN", "TR"];
  const { playClickSound } = useSoundDesign();
  const langWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  useScrollLock(menuOpen);

  // The desktop language menu opened on hover alone, so it was unreachable
  // without a pointer. It now toggles on click as well; these close it the way
  // any menu is expected to close.
  useEffect(() => {
    if (!langOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!langWrapperRef.current?.contains(event.target as Node)) setLangOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [langOpen]);

  // Default anchor behaviour continues after the sound; the handler only
  // closes the mobile sheet so the target section is not left behind it.
  const handleLinkClick = () => {
    playClickSound();
    setMenuOpen(false);
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${menuOpen ? styles.menuOpen : ""}`}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <a href="#" className={styles.brand} onClick={handleLinkClick}>
          <BrandMark className={styles.mark} />
          <span>ATILLA BARBAROSSA</span>
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
            ref={langWrapperRef}
            className={styles.langDropdownWrapper}
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              className={styles.langSelected}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              aria-label={`Sprache: ${activeLang}`}
              onClick={(event) => {
                // A mouse has already opened the menu on hover by the time it
                // clicks, so toggling here shut it again under the pointer —
                // clicking the trigger closed the menu it had just opened.
                // Keyboard activation arrives with detail 0 and toggles; a
                // pointer click only makes sure the menu is open.
                if (event.detail === 0) setLangOpen((open) => !open);
                else setLangOpen(true);
              }}
            >
              {activeLang}
              <svg className={`${styles.chevron} ${langOpen ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {langOpen && (
              <div className={styles.langMenu} role="menu">
                {languages.filter(l => l !== activeLang).map(lang => (
                  <button
                    type="button"
                    role="menuitem"
                    key={lang}
                    className={styles.langOption}
                    onClick={() => {
                      setActiveLang(lang);
                      setLangOpen(false);
                      playClickSound();
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.liveClock}>
            <span>BERLIN / ISTANBUL</span>
            <LiveClock className={styles.timeDigits} />
          </div>
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
                <span className={styles.mobileTime}>
                  <LiveClock /> · BERLIN / ISTANBUL
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
