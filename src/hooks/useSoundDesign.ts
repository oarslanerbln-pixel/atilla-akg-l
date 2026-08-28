"use client";

import { useCallback } from "react";

export function useSoundDesign() {
  const playClickSound = useCallback(() => {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
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
      
    } catch (error) {
      // Silently fail if audio is not supported or blocked by browser policy
      console.warn("Audio playback failed", error);
    }
  }, []);

  return { playClickSound };
}
