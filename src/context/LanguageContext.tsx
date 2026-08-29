"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "../i18n/translations";

interface LanguageContextType {
  activeLang: Language;
  setActiveLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [activeLang, setActiveLang] = useState<Language>("DE");

  const t = (key: TranslationKeys): string => {
    return translations[activeLang][key] || translations["DE"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ activeLang, setActiveLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
