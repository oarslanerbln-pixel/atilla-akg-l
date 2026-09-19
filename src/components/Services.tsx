"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Compass, Video, PackageSearch, Copyright } from "lucide-react";
import styles from "./Services.module.css";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Services() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();

  const services: { icon: React.ReactNode; titleKey: TranslationKeys; descKey: TranslationKeys }[] = [
    {
      icon: <Compass className={styles.icon} />,
      titleKey: "service_1_title",
      descKey: "service_1_desc",
    },
    {
      icon: <Video className={styles.icon} />,
      titleKey: "service_2_title",
      descKey: "service_2_desc",
    },
    {
      icon: <PackageSearch className={styles.icon} />,
      titleKey: "service_3_title",
      descKey: "service_3_desc",
    },
    {
      icon: <Copyright className={styles.icon} />,
      titleKey: "service_4_title",
      descKey: "service_4_desc",
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
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants} className={styles.card}>
              <div className={styles.iconWrapper}>{service.icon}</div>
              <h4 className={styles.cardTitle}>{t(service.titleKey)}</h4>
              <p className={styles.cardDesc}>{t(service.descKey)}</p>
              
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
