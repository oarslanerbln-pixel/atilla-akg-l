"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatNumber?: boolean; // Whether to format with thousand separators (e.g. 559.316)
}

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
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Luxury ease-out curve (cubic-bezier 0.16, 1, 0.3, 1 approximation)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(to);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  const formatted = () => {
    let numStr = displayValue.toFixed(decimals);
    if (formatNumber) {
      // German formatting (dots for thousands, comma for decimals)
      const parts = numStr.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      numStr = parts.join(",");
    }
    return `${prefix}${numStr}${suffix}`;
  };

  return (
    <span ref={ref} className={className}>
      {formatted()}
    </span>
  );
}
