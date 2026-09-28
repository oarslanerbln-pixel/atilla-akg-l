"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { BedDouble, MapPinned, Sparkles } from "lucide-react";
import styles from "./Services.module.css";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Services() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();

  // One card per kind of client, each in their own terms: the problem they
  // bring (one line, no alarmism), what the films do about it, and what they
  // actually receive. Generic capability lists spoke to nobody in particular.
  const segments: {
    icon: React.ReactNode;
    forKey: TranslationKeys;
    titleKey: TranslationKeys;
    painKey: TranslationKeys;
    descKey: TranslationKeys;
    deliverables: TranslationKeys[];
  }[] = [
    {
      icon: <BedDouble className={styles.icon} />,
      forKey: "service_hotels_for",
      titleKey: "service_hotels_title",
      painKey: "service_hotels_pain",
      descKey: "service_hotels_desc",
      deliverables: ["service_hotels_d1", "service_hotels_d2", "service_hotels_d3"],
    },
    {
      icon: <MapPinned className={styles.icon} />,
      forKey: "service_dmo_for",
      titleKey: "service_dmo_title",
      painKey: "service_dmo_pain",
      descKey: "service_dmo_desc",
      deliverables: ["service_dmo_d1", "service_dmo_d2", "service_dmo_d3"],
    },
    {
      icon: <Sparkles className={styles.icon} />,
      forKey: "service_brands_for",
      titleKey: "service_brands_title",
      painKey: "service_brands_pain",
      descKey: "service_brands_desc",
      deliverables: ["service_brands_d1", "service_brands_d2", "service_brands_d3"],
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="services" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.header}
        >
          <h3 className={styles.subtitle}>{t('services_subtitle')}</h3>
          <h2 className={styles.title}>{t('services_title')}</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.grid}
        >
          {segments.map((segment) => (
            <motion.div key={segment.forKey} variants={itemVariants} className={styles.card}>
              <div className={styles.iconWrapper}>{segment.icon}</div>
              <p className={styles.forLabel}>{t(segment.forKey)}</p>
              <h4 className={styles.cardTitle}>{t(segment.titleKey)}</h4>
              <p className={styles.pain}>{t(segment.painKey)}</p>
              <p className={styles.cardDesc}>{t(segment.descKey)}</p>
              <ul className={styles.deliverables}>
                {segment.deliverables.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>

              <a
                href="#contact"
                className={styles.squareButton}
                onClick={() => playClickSound()}
                data-cursor="INQUIRE"
              >
                {t('services_btn')}
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className={styles.disclaimerWrapper}
        >
          <p className={styles.disclaimer}>
            {t('services_disclaimer')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
