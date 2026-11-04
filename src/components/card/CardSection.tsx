"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { pagePath } from "@/lib/locales";
import ed from "@/components/editorial.module.css";
import BusinessCard, { type WalletOptions } from "./BusinessCard";
import type { CardCodes } from "./qr";
import styles from "./CardSection.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The business card in the portfolio, between the FAQ and Contact: the same
 * card as /card, turning, swaying and following the hand, with a link to its
 * own page (the one to keep on a phone's home screen). An interlude rather
 * than a chapter, so it carries no numeral. The floating WhatsApp button
 * steps aside while it is on screen (WhatsAppButton observes #card).
 */
export default function CardSection({ codes, wallet }: { codes: CardCodes; wallet: WalletOptions }) {
  const { t, activeLang } = useLanguage();
  const calm = usePrefersCalm();

  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: calm ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section id="card" className={`${ed.section} ${styles.section}`} aria-labelledby="card-title">
      <div className={`container ${styles.inner}`}>
        <motion.div className={`${ed.head} ${ed.centred} ${styles.head}`} {...reveal()}>
          <p className={ed.eyebrow}>{t("card_section_eyebrow")}</p>
          <h2 id="card-title" className={ed.title}>
            {t("card_section_title")}
          </h2>
          <p className={`${ed.lede} ${styles.lede}`}>{t("card_section_text")}</p>
        </motion.div>

        <BusinessCard codes={codes} wallet={wallet} />

        <motion.div {...reveal(0.2)}>
          <Link href={pagePath("card", activeLang)} className={styles.open}>
            {t("card_section_open")}
            <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
