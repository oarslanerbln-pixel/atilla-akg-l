"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./Brands.module.css";

const brands = [
  "UNESCO",
  "RIXOS HOTELS",
  "KAZAKH TOURISM",
  "ACCOR LIVE LIMITLESS",
  "GILLETTE",
  "BER FLUGHAFEN",
];

export default function Brands() {
  const renderMarquee = (layerClass: string) => (
    <div className={styles.marquee}>
      <div className={`${styles.track} ${layerClass}`}>
        {brands.map((brand, index) => (
          <div key={`t1-${index}`} className={styles.brandItem}>
            <span className={styles.brandName}>{brand}</span>
            <span className={styles.separator}>✦</span>
          </div>
        ))}
      </div>
      
      {/* Duplicate track for seamless infinite scroll */}
      <div className={`${styles.track} ${layerClass}`} aria-hidden="true">
        {brands.map((brand, index) => (
          <div key={`t2-${index}`} className={styles.brandItem}>
            <span className={styles.brandName}>{brand}</span>
            <span className={styles.separator}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className={styles.section}>
      <div className={styles.edgeMask}>
        {/* Base Layer: Silver text */}
        {renderMarquee(styles.silver)}
        
        {/* Top Layer: Gold text, masked to only show in the exact center */}
        <div className={styles.goldOverlay}>
          {renderMarquee(styles.gold)}
        </div>
      </div>
    </section>
  );
}
