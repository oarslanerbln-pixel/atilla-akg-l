"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";
import { useLanguage } from "@/context/LanguageContext";
import { HTML_LANG } from "@/lib/locales";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatNumber?: boolean; // Thousands separators in the page's language: 559.316 / 559,316
}

const noopSubscribe = () => () => {};

/**
 * A figure that counts up when it scrolls into view.
 *
 * The server HTML carries the real value, never the starting zero: search
 * engines, answer engines, link previews and visitors whose scripts are
 * blocked all read "306 K", not "0 K". Only once the page is running in a
 * browser does the counter drop to its start value — below the fold, where
 * nobody sees it — and count up on arrival. A visitor who asked for less
 * motion simply gets the real value.
 */
export default function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatNumber = false,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const calm = usePrefersCalm();
  // False while rendering on the server and during hydration, true afterwards,
  // so the hydrated markup matches the server's.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [animatedValue, setAnimatedValue] = useState(from);
  const animate = isClient && !calm;

  useEffect(() => {
    if (!isInView || !animate) return;
    let startTimestamp: number | null = null;
    let frame = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Luxury ease-out curve (cubic-bezier 0.16, 1, 0.3, 1 approximation)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(progress < 1 ? from + (to - from) * easeProgress : to);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, animate, from, to, duration]);

  const displayValue = animate ? animatedValue : to;

  // Separators follow the page's language: "1,5" and "559.316" in German and
  // Turkish read as "1.5" and "559,316" in English.
  const { activeLang } = useLanguage();
  const number = useMemo(
    () =>
      new Intl.NumberFormat(HTML_LANG[activeLang], {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: formatNumber,
      }),
    [activeLang, decimals, formatNumber],
  );

  return (
    <span ref={ref} className={className}>
      {`${prefix}${number.format(displayValue)}${suffix}`}
    </span>
  );
}
