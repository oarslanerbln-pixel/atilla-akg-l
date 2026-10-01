"use client";

import React, { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";

// reducedMotion="user": under prefers-reduced-motion every framer-motion
// entrance keeps its fade but drops the slide, scale and parallax.
export function Providers({ children, lang }: { children: ReactNode; lang: Language }) {
  return (
    <LanguageProvider initialLang={lang}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageProvider>
  );
}
