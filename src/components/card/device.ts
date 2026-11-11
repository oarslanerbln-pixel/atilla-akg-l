"use client";

import { useSyncExternalStore } from "react";

/**
 * What the card's pages need to know about the visitor's device: where a
 * Wallet pass can go, and whether they are inside Instagram's browser.
 * Shared by BusinessCard (/card) and ContactPage (/c).
 */

/** Which Wallet passes the server can sign (lib/wallet/ready.ts). */
export type WalletOptions = { apple: boolean; google: boolean };

export type Platform = "apple" | "android" | "other";

/** Where a pass can go: Apple Wallet on iPhone, iPad and Mac, Google Wallet on Android and elsewhere. */
export function readPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return "apple";
  return "other";
}
export const noSubscribe = () => () => {};

/**
 * Instagram's (and Facebook's) in-app browser. It opens the card from a bio or
 * story link, but it cannot save a contact file or add a Wallet pass, so there
 * those actions, and a quiet note, hand the page to the phone's own browser.
 */
export const readInApp = () => /Instagram|FBAN|FBAV|FB_IAB/.test(navigator.userAgent);

/**
 * An address the in-app browser hands to the phone's own browser: Safari by
 * its x-safari-https scheme (iOS 17 and later), the default browser by an
 * Android intent that falls back to the address itself.
 */
export function inBrowser(url: string, platform: Platform | null): string {
  const rest = url.replace(/^https?:\/\//, "");
  if (platform === "apple") return `x-safari-https://${rest}`;
  if (platform === "android") {
    return `intent://${rest}#Intent;scheme=https;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  }
  return url;
}

/** The platform, read on the client only: the server cannot know the device. */
export const usePlatform = () => useSyncExternalStore<Platform | null>(noSubscribe, readPlatform, () => null);

/** True inside Instagram's (or Facebook's) in-app browser. */
export const useInApp = () => useSyncExternalStore(noSubscribe, readInApp, () => false);

/**
 * The Wallet link for this device, or null where no pass can be added:
 * Apple's on Apple devices, Google's on Android and on other computers (it
 * saves to the Google account).
 */
export function walletPath(wallet: WalletOptions | undefined, platform: Platform | null, lang: string): string | null {
  if (!wallet || !platform) return null;
  const provider = platform === "apple" ? (wallet.apple ? "apple" : null) : wallet.google ? "google" : null;
  return provider ? `/wallet/${provider}?lang=${lang}` : null;
}
