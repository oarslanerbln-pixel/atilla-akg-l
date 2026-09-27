"use client";

import { useSyncExternalStore } from "react";
import { isIntroDone, subscribeIntroDone } from "@/lib/intro";

/** True once the intro overlay is gone (or was never shown). */
export function useIntroDone(): boolean {
  return useSyncExternalStore(subscribeIntroDone, isIntroDone, () => false);
}
