"use client";

import { RefObject, useEffect } from "react";

/**
 * Make a paused <video> actually show a frame.
 *
 * These clips carry no poster image: the still is the clip's own first frame,
 * which is what let the third-party stock photos go. The `#t=0.1` media
 * fragment asks the browser to start there and most will decode and paint it —
 * but that is a request, not a guarantee, and Safari in particular has
 * historically shown nothing until playback begins. Where it does not paint,
 * the card renders as an empty box.
 *
 * Seeking explicitly once metadata has arrived forces the decode. It is a
 * no-op wherever the fragment already worked, and the guard keeps it from
 * rewinding a clip that is already playing.
 */
export function usePosterFrame(ref: RefObject<HTMLVideoElement | null>, time = 0.1): void {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const seek = () => {
      if (video.currentTime >= time) return;
      try {
        video.currentTime = time;
      } catch {
        // Seeking before the browser is ready leaves the frame blank, which
        // is the state we were already in.
      }
    };

    // HAVE_METADATA or better: duration and dimensions are known, so the seek
    // is honoured immediately.
    if (video.readyState >= 1) seek();
    video.addEventListener("loadedmetadata", seek);
    return () => video.removeEventListener("loadedmetadata", seek);
  }, [ref, time]);
}
