"use client";

import { useEffect, useState } from "react";
import { contact } from "@/lib/site";
import { WhatsAppIcon } from "./SocialIcons";
import { useLanguage } from "@/context/LanguageContext";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import styles from "./WhatsAppButton.module.css";

/**
 * One tap from anywhere on the page to a WhatsApp message.
 *
 * Visitors arrive from Instagram on a phone, where the contact form sits a
 * long scroll away and typing into it is the slowest way to ask a question.
 * The button only shows where it helps: it stays out of the hero, which has
 * its own calls to action, and steps aside once the business card or the
 * Contact section is on screen, where every channel is already laid out. It stays away below it
 * too: over the footer it covered the language and legal links.
 *
 * A bare icon asked visitors to guess what it does; the short label says it
 * is the way to enquire, on phones too. No reply time is promised.
 *
 * It is a plain outbound link: no WhatsApp script or widget is loaded, so
 * nothing leaves the visitor's browser until they choose to tap it. The
 * privacy policy says what happens after that.
 */
export default function WhatsAppButton() {
  const { t } = useLanguage();
  const { playClickSound } = useSoundDesign();
  const [heroVisible, setHeroVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const contactSection = document.getElementById("contact");
    const cardSection = document.getElementById("card");
    const footer = document.querySelector("footer");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      // Hidden until most of the hero has scrolled away.
      const o = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
        rootMargin: "0px 0px -40% 0px",
      });
      o.observe(hero);
      observers.push(o);
    }
    if (contactSection) {
      const o = new IntersectionObserver(([entry]) => setContactVisible(entry.isIntersecting), {
        threshold: 0.15,
      });
      o.observe(contactSection);
      observers.push(o);
    }
    // The business card has its own WhatsApp link and buttons under it.
    if (cardSection) {
      const o = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting), {
        threshold: 0.15,
      });
      o.observe(cardSection);
      observers.push(o);
    }
    // The footer follows the contact section directly, so between the two
    // there is no point below the form where the button could come back.
    if (footer) {
      const o = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
      o.observe(footer);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const shown = !heroVisible && !contactVisible && !cardVisible && !footerVisible;
  const href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t("whatsapp_message"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.button} ${shown ? styles.shown : ""}`}
      aria-label={`${t("whatsapp_cta")} – WhatsApp`}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      data-cursor="WHATSAPP"
      onClick={() => playClickSound()}
    >
      <WhatsAppIcon className={styles.icon} />
      <span className={styles.label}>{t("whatsapp_cta")}</span>
    </a>
  );
}
