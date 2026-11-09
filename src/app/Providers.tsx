"use client";

import React, { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";

// reducedMotion="user": under prefers-reduced-motion every framer-motion
// entrance keeps its fade but drops the slide, scale and parallax.
//
// LazyMotion: components use the slim `m.div`, not `motion.div`, and take
// their animation code from here once. `domAnimation` covers animate, exit,
// variants and the hover, tap, focus and in-view gestures; it has no drag
// and no layout animation (those need `domMax`). `strict` makes a stray
// `motion.div` throw in development instead of quietly shipping the full
// bundle again.
export function Providers({ children, lang }: { children: ReactNode; lang: Language }) {
  return (
    <LanguageProvider initialLang={lang}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </LanguageProvider>
  );
}
