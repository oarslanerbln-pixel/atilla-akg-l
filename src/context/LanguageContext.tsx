"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "../i18n/translations";
import { HTML_LANG } from "@/lib/locales";

interface LanguageContextType {
  activeLang: Language;
  setActiveLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * `initialLang` is the language of the address (/, /en, /tr), so the server
 * renders the page in it and a crawler reads the same text a visitor does.
 */
export function LanguageProvider({
  children,
  initialLang = "DE",
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  const [activeLang, setActiveLang] = useState<Language>(initialLang);

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
