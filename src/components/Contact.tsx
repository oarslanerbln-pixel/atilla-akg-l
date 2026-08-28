"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import styles from "./Contact.module.css";
import { useSoundDesign } from "@/hooks/useSoundDesign";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        // Reset after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

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
              <h3 className={styles.subtitle}>Philosophie</h3>
              <h2 className={styles.title}>Zusammenarbeit & Ablauf</h2>
              <div className={styles.divider}></div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.paragraphs}>
              <p>
                Authentizität trifft auf visuelle Qualität. Meine Community schätzt
                die ehrliche, ungefilterte Berichterstattung gepaart mit einem Auge
                für Ästhetik. Ich setze bewusst auf ein dynamisches Setup mit dem
                neuesten iPhone, um Content zu erschaffen, der sich nicht wie
                distanzierte Werbung anfühlt, sondern meine Zuschauer direkt mit
                auf die Reise nimmt – authentisch, nahbar und auf Augenhöhe.
              </p>
              <p>
                Jede Destination und jedes Hotel ist einzigartig. Deshalb arbeite
                ich nicht mit starren Standardpaketen, sondern entwickle
                maßgeschneiderte Content-Konzepte.
              </p>
              <p>
                Von der ersten Ideenfindung über die professionelle Umsetzung vor
                Ort bis hin zum detaillierten Reporting nach der Kampagne: Mein
                Management und ich garantieren eine absolut zuverlässige,
                transparente und partnerschaftliche Kommunikation.
              </p>
              <p className={styles.closing}>
                Ich freue mich darauf, bald mit Ihnen zusammenzuarbeiten!
                <br />
                <strong>Atilla BARBAROSSA</strong>
              </p>
            </motion.div>
          </div>

          {/* Right Column: Contact Info & Form */}
          <div className={styles.contactCol}>
            <motion.div variants={itemVariants}>
              <h3 className={styles.subtitle}>Kontakt</h3>
              <h2 className={styles.title}>Let's Connect</h2>
              <div className={styles.divider}></div>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.contactLinks}>
              <a href="mailto:a@barbarossafilms.de" className={styles.contactLink}>
                <div className={styles.iconBox}>
                  <Mail className={styles.icon} />
                </div>
                <span>a@barbarossafilms.de</span>
              </a>
              <a href="mailto:lisaweber@barbarossafilms.de" className={styles.contactLink}>
                <div className={styles.iconBox}>
                  <Mail className={styles.icon} />
                </div>
                <span>lisaweber@barbarossafilms.de</span>
              </a>
              <a href="tel:+4917672725165" className={styles.contactLink}>
                <div className={styles.iconBox}>
                  <Phone className={styles.icon} />
                </div>
                <span>+49 1767 27 25 165</span>
              </a>
            </motion.div>

            <motion.form variants={itemVariants} className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="NAME"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={status === "loading" || status === "success"}
              />
              <input
                type="email"
                placeholder="E-MAIL"
                className={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={status === "loading" || status === "success"}
              />
              <textarea
                placeholder="NACHRICHT"
                className={styles.textarea}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={status === "loading" || status === "success"}
              ></textarea>
              
              <button 
                type="submit" 
                className={`${styles.submitButton} ${status === "success" ? styles.success : ""}`}
                disabled={status === "loading" || status === "success"}
              >
                {status === "idle" && "ANFRAGE SENDEN"}
                {status === "loading" && (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Loader2 className={styles.spinIcon} size={18} /> SENDET...
                  </span>
                )}
                {status === "success" && (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <CheckCircle size={18} /> ERFOLGREICH GESENDET
                  </span>
                )}
                {status === "error" && "FEHLER - ERNEUT VERSUCHEN"}
              </button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
