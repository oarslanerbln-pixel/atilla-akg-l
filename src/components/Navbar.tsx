"use client";

import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Navbar() {
  const [time, setTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
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
              <a href="#about" onClick={handleLinkClick}>ÜBER MICH</a>
            </li>
            <li className={styles.navItem}>
              <a href="#stats" onClick={handleLinkClick}>ZAHLEN</a>
            </li>
            <li className={styles.navItem}>
              <a href="#services" onClick={handleLinkClick}>LEISTUNGEN</a>
            </li>
            <li className={styles.navItem}>
              <a href="#work" onClick={handleLinkClick}>PROJEKTE</a>
            </li>
            <li className={styles.navItem}>
              <a href="#contact" onClick={handleLinkClick}>KONTAKT</a>
            </li>
          </ul>
        </nav>

        {/* Live Status & Clock */}
        <div className={styles.statusWrapper}>
          <div className={styles.langSwitcher}>
            <span className={styles.langActive}>DE</span>
            <span className={styles.langSep}>|</span>
            <span className={styles.langItem}>EN</span>
            <span className={styles.langSep}>|</span>
            <span className={styles.langItem}>TR</span>
          </div>

          {time && (
            <div className={styles.liveClock}>
              <span>BERLIN / ISTANBUL</span>
              <span className={styles.timeDigits}>{time}</span>
            </div>
          )}
          <div className={styles.statusBadge}>
            <span className={styles.pulseDot}></span>
            <span>AVAILABLE WORLDWIDE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
