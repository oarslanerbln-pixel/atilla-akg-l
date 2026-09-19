"use client";

import Link from "next/link";
import React, { useId, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import styles from "./Contact.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKeys } from "@/i18n/translations";

const DIRECT_MAIL = "a@barbarossafilms.de";

/**
 * The endpoint answers with a stable machine-readable code rather than prose,
 * so the visitor reads the reason in their own language — and, when the mail
 * channel itself is down, gets the direct address instead of a dead end.
 */
const ERROR_MESSAGES: Record<string, TranslationKeys> = {
  rate_limited: "contact_error_rate",
  invalid_email: "contact_error_invalid",
  missing_fields: "contact_error_invalid",
  consent_required: "contact_error_consent",
  not_configured: "contact_error_unavailable",
};

export default function Contact() {
  const { t } = useLanguage();
  const fieldId = useId();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  // Honeypot. A real visitor never sees the field, so anything typed into it
  // came from a bot filling every input it could find.
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<TranslationKeys>("contact_error");
  const { playClickSound } = useSoundDesign();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound(); // Premium interaction sound
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, company, consent }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setConsent(false);
        // Reset after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        const body = await response.json().catch(() => null);
        const code = typeof body?.error === "string" ? body.error : "";
        setErrorKey(ERROR_MESSAGES[code] ?? "contact_error_generic");
        setStatus("error");
      }
    } catch {
      setErrorKey("contact_error_generic");
      setStatus("error");
    }
  };

  const isBusy = status === "loading" || status === "success";

  // The consent sentence carries the privacy link inline, and DE/EN/TR put it
  // in different places — so the translation owns the position via {link}.
  const [consentBefore, consentAfter] = t('contact_consent').split("{link}");

  return (
    <section id="contact" className={styles.section}>
      <div className={`container ${styles.container}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={styles.grid}
        >
          {/* Left Column: Philosophy & Process */}
          <div className={styles.infoCol}>
            <motion.div variants={itemVariants}>
              <h3 className={styles.subtitle}>{t('contact_subtitle')}</h3>
              <h2 className={styles.title}>{t('contact_title')}</h2>
              <div className={styles.divider}></div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.paragraphs}>
              <p>{t('contact_p1')}</p>
              <p>{t('contact_p2')}</p>
              <p>{t('contact_p3')}</p>
              <p className={styles.closing}>
                {t('contact_closing')}
                <br />
                <strong>Atilla BARBAROSSA</strong>
              </p>
            </motion.div>
          </div>

          {/* Right Column: Contact Info & Form */}
          <div className={styles.contactCol}>
            <motion.div variants={itemVariants}>
              <h3 className={styles.subtitle}>{t('contact_form_subtitle')}</h3>
              <h2 className={styles.title}>{t('contact_form_title')}</h2>
              <div className={styles.divider}></div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.contactLinks}>
              <a
                href="mailto:a@barbarossafilms.de"
                className={styles.contactLink}
                onClick={() => playClickSound()}
                data-cursor="EMAIL"
              >
                <div className={styles.iconBox}>
                  <Mail className={styles.icon} />
                </div>
                <span>a@barbarossafilms.de</span>
              </a>
              <a
                href="mailto:lisaweber@barbarossafilms.de"
                className={styles.contactLink}
                onClick={() => playClickSound()}
                data-cursor="MANAGEMENT"
              >
                <div className={styles.iconBox}>
                  <Mail className={styles.icon} />
                </div>
                <span>lisaweber@barbarossafilms.de</span>
              </a>
              <a
                href="tel:+4917672725165"
                className={styles.contactLink}
                onClick={() => playClickSound()}
                data-cursor="CALL"
              >
                <div className={styles.iconBox}>
                  <Phone className={styles.icon} />
                </div>
                <span>+49 1767 27 25 165</span>
              </a>
            </motion.div>

            <motion.form variants={itemVariants} className={styles.form} onSubmit={handleSubmit} noValidate={false}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={`${fieldId}-name`}>
                  {t('contact_name')}
                </label>
                <input
                  id={`${fieldId}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isBusy}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={`${fieldId}-email`}>
                  {t('contact_email')}
                </label>
                <input
                  id={`${fieldId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isBusy}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={`${fieldId}-message`}>
                  {t('contact_message')}
                </label>
                <textarea
                  id={`${fieldId}-message`}
                  name="message"
                  className={styles.textarea}
                  rows={4}
                  maxLength={5000}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isBusy}
                />
              </div>

              {/* Honeypot — off-screen rather than display:none, which bots skip. */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor={`${fieldId}-company`}>Company</label>
                <input
                  id={`${fieldId}-company`}
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className={styles.consentRow}>
                <input
                  id={`${fieldId}-consent`}
                  name="consent"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  disabled={isBusy}
                />
                <label className={styles.consentLabel} htmlFor={`${fieldId}-consent`}>
                  {consentBefore}
                  <Link href="/datenschutz" className={styles.consentLink}>
                    {t('contact_privacy_link')}
                  </Link>
                  {consentAfter}
                </label>
              </div>

              <button
                type="submit"
                className={`${styles.submitButton} ${status === "success" ? styles.success : ""}`}
                disabled={isBusy}
                data-cursor="SUBMIT"
              >
                {status === "loading" ? (
                  <span className={styles.buttonInner}>
                    <Loader2 className={styles.spinIcon} size={18} /> {t('contact_sending')}
                  </span>
                ) : status === "success" ? (
                  <span className={styles.buttonInner}>
                    <CheckCircle size={18} /> {t('contact_success')}
                  </span>
                ) : (
                  t('contact_send')
                )}
              </button>

              {/* Announced to screen readers without stealing focus. */}
              <p className={styles.statusMessage} role="status" aria-live="polite">
                {status === "error" && (
                  <span className={styles.errorText}>
                    {t(errorKey)}
                    {errorKey === "contact_error_unavailable" && (
                      <>
                        {" "}
                        <a href={`mailto:${DIRECT_MAIL}`} className={styles.consentLink}>
                          {DIRECT_MAIL}
                        </a>
                      </>
                    )}
                  </span>
                )}
                {status === "success" && (
                  <span className={styles.successText}>{t('contact_success_detail')}</span>
                )}
              </p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
