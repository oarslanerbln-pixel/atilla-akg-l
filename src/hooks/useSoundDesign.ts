"use client";

import { useCallback } from "react";

type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * One AudioContext for the whole page.
 *
 * Each click used to construct a fresh AudioContext and never close it.
 * Browsers cap how many a document may hold open — six in Chrome — so the
 * "premium" click fell silent after the sixth interaction and every context
 * before it stayed resident. A single shared context, resumed on demand,
 * costs nothing and keeps working.
 */
let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedContext) return sharedContext;

  const Constructor = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
  if (!Constructor) return null;

  sharedContext = new Constructor();
  return sharedContext;
}

export function useSoundDesign() {
  const playClickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Autoplay policy starts the context suspended until a gesture; every
      // call site here is inside one.
      if (ctx.state === "suspended") void ctx.resume();

      // Master volume
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      // Very short, low frequency "thud" for premium feel
      const osc = ctx.createOscillator();
      osc.type = "sine";

      // Start at 150Hz and rapidly drop to 40Hz (Creates the "tok" bass click)
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

      // Volume envelope (immediate attack, rapid decay)
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gainNode);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);

      // Release the per-click nodes once the tail has finished.
      osc.onended = () => {
        osc.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // Silently fail if audio is not supported or blocked by browser policy.
    }
  }, []);

  return { playClickSound };
}
