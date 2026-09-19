"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import styles from "./LegalPage.module.css";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Shell for /impressum and /datenschutz.
 *
 * Both pages are German-only on purpose: they are statements by a
 * Germany-based operator under German law, and a translation of them would
 * not be the binding text. Only the navigation around them follows the
 * visitor's language.
 */
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/" className={styles.back}>
          ← {t("legal_back")}
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}

/** Operator detail the site owner still has to supply. */
export function Todo({ children }: { children: ReactNode }) {
  return <span className={styles.todo}>[ ERGÄNZEN: {children} ]</span>;
}
