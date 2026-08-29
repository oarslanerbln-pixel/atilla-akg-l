"use client";

import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/i18n/translations";

export default function Navbar() {
  const [time, setTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playClickSound();
    // Allow default anchor behavior to continue after playing sound
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <a href="#" className={styles.brand} onClick={handleLinkClick}>
          <span>ATILLA BARBAROSSA</span>
          <span className={styles.goldDot}>✦</span>
        </a>

        {/* Center Navigation Links */}
        <nav>
          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <a href="#about" onClick={handleLinkClick}>{t('nav_about')}</a>
            </li>
            <li className={styles.navItem}>
              <a href="#stats" onClick={handleLinkClick}>{t('nav_stats')}</a>
            </li>
            <li className={styles.navItem}>
              <a href="#services" onClick={handleLinkClick}>{t('nav_services')}</a>
            </li>
            <li className={styles.navItem}>
              <a href="#work" onClick={handleLinkClick}>{t('nav_work')}</a>
            </li>
            <li className={styles.navItem}>
              <a href="#contact" onClick={handleLinkClick}>{t('nav_contact')}</a>
            </li>
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
      </div>
    </header>
  );
}
