"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { usePrefersCalm } from "@/hooks/usePrefersCalm";

/**
 * A muted clip that plays only while it is on screen.
 *
 * The poster was a stock photo fetched from images.pexels.com on every page
 * view — a third-party request handing the visitor's IP to a US host before
 * any consent, and stock imagery standing in for the work it illustrated.
 * Asking the browser to paint the clip's own first frame replaced it, but that
 * only ever worked by request. It is now a self-hosted still cut from the
 * clip, so a frame needs nothing from the video until it scrolls into view:
 * `preload="none"` means a visitor who never reaches it downloads
 * not one frame of it.
 */
export default function InViewVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { margin: "-100px" });
  const calm = usePrefersCalm();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Someone who asked for less motion did not ask for clips looping behind
    // the copy, and someone saving data did not ask for megabytes of them.
    if (calm) {
      video.pause();
      return;
    }

    if (isInView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, calm]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      preload="none"
      loop
      muted
      playsInline
      className={className}
    />
  );
}
