"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "../i18n/translations";

interface LanguageContextType {
  activeLang: Language;
  setActiveLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const HTML_LANG: Record<Language, string> = { DE: "de", EN: "en", TR: "tr" };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [activeLang, setActiveLang] = useState<Language>("DE");

  // Keep <html lang> in sync with the active language — screen readers need
  // it to pronounce content correctly, and CSS `hyphens: auto` needs it to
  // pick the right hyphenation dictionary for long German compound words.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[activeLang];
  }, [activeLang]);

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
