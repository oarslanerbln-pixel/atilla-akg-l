"use client";

import React, { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";

export function Providers({ children, lang }: { children: ReactNode; lang: Language }) {
  return (
    <LanguageProvider initialLang={lang}>
      {children}
    </LanguageProvider>
  );
}
