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
 */
let lockCount = 0;
let restoreTo = "";

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) {
      restoreTo = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = restoreTo;
    };
  }, [locked]);
}
