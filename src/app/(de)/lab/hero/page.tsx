import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import HeroGlobe from "@/components/lab/globe/HeroGlobe";

/**
 * A rehearsal stage: the portfolio with a hero study in place of the live
 * one, for review before anything changes at /. Not linked, not in the
 * sitemap, never indexed; robots.ts leaves it open so the noindex is read.
 * three.js and GSAP load on this route only.
 */
export const metadata: Metadata = {
  title: "Hero Lab",
  robots: { index: false, follow: false },
};

export default function HeroLab() {
  return <HomePage lang="DE" hero={<HeroGlobe />} />;
}
