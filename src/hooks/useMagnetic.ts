"use client";

import { useEffect, useRef } from "react";
import { useSpring } from "framer-motion";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

/**
 * A button that leans toward the pointer, a few pixels at most, and settles
 * back when it leaves. Damped just past critical, so it glides and never
 * wobbles. Only for a real mouse: touch has no hover to lean toward, and a
 * visitor who asked for less motion gets a still button.
 */
export function useMagnetic<T extends HTMLElement>(strength = 8) {
  const ref = useRef<T>(null);
  const calm = usePrefersCalm();
  const spring = { stiffness: 150, damping: 20, mass: 0.6 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    const el = ref.current;
    if (!el || calm) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      x.set(dx * strength);
      y.set(dy * strength * 0.6);
    };
    const leave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [calm, strength, x, y]);

  return { ref, style: { x, y } };
}
