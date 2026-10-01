"use client";

import { useEffect } from "react";

/**
 * Hold page scroll while an overlay is open.
 *
 * Three components used to write `document.body.style.overflow = "auto"` when
 * they closed. That is not the same as releasing the override: it pins an
 * explicit value on the body in place of whatever the stylesheet intended, and
 * whichever overlay closed first unlocked the page even if another was still
 * open. The count keeps the last one in charge, and the original inline value
 * is restored rather than guessed.
 *
 * The lock goes on <html>, not <body>: globals.css gives <html> an overflow of
 * its own, and once it has one the viewport scrolls by it and ignores the
 * body's. A body-only lock left the page scrolling behind every overlay.
 */
let lockCount = 0;
let restoreTo = "";

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const root = document.documentElement;
    if (lockCount === 0) {
      restoreTo = root.style.overflow;
      root.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) root.style.overflow = restoreTo;
    };
  }, [locked]);
}
