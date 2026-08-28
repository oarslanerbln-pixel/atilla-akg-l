"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Compass, Video, PackageSearch, Copyright } from "lucide-react";
import styles from "./Services.module.css";

const services = [
  {
    icon: <Compass className={styles.icon} />,
    title: "Authentische Hotel- & Destinations-Features",
    description:
      "Organische Einbindung und fesselndes Storytelling direkt vor Ort, um die Einzigartigkeit der Location spürbar zu machen.",
  },
  {
    icon: <Video className={styles.icon} />,
    title: "Reichweitenstarke Kampagnen",
    description:
      "Dedizierte Kurzvideos (Reels, TikToks & YouTube Shorts) für maximale Sichtbarkeit und Performance in der kaufkräftigen DACH-Zielgruppe.",
  },
  {
    icon: <PackageSearch className={styles.icon} />,
    title: "Organische Produktintegrationen",
    description:
      "Natürliche und glaubhafte Einbindung von reiseaffinen Marken, Services oder Equipment in meinen Travel-Alltag.",
  },
  {
    icon: <Copyright className={styles.icon} />,
    title: "UGC & Content-Lizenzen",
    description:
      "Produktion von hochwertigem, nativem Bild- und Videomaterial zur uneingeschränkten Nutzung auf den unternehmenseigenen Kanälen.",
  },
];

export default function Services() {
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
          <h3 className={styles.subtitle}>Dienstleistungen</h3>
          <h2 className={styles.title}>Service Portfolio</h2>
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
              <h4 className={styles.cardTitle}>{service.title}</h4>
              <p className={styles.cardDesc}>{service.description}</p>
              
              {/* Added a sharp square button for the luxury aesthetic as requested */}
              <button className={styles.squareButton}>
                MEHR ERFAHREN
              </button>
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
            Sämtliche Leistungen, Paketpreise und Format-Kombinationen (z. B.
            Story-Sequenzen, begleitende YouTube-Vlogs oder exklusive TikTok-Serien)
            werden individuell auf die Ziele der jeweiligen Kampagne abgestimmt.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
