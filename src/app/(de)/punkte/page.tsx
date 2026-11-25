import type { Metadata } from "next";
import PunktePage from "@/components/punkte/PunktePage";
import { SITE_NAME } from "@/lib/metadata";

const title = `Punkte-Check: gratis PDF zu Punkten & Meilen | ${SITE_NAME}`;
const description =
  "Kostenloses PDF: die 10 Stellen, an denen du im Alltag Payback-Punkte und Meilen verschenkst, und wie du sie dir zurückholst. Jede Zahl mit Quelle.";

/**
 * Das Punkte-System and its free Punkte-Check. German only, as the product is
 * (see src/lib/punkte.ts). Linked from the menu and listed in the sitemap.
 */
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/punkte" },
  openGraph: {
    title,
    description,
    url: "/punkte",
    siteName: SITE_NAME,
    locale: "de_DE",
    type: "website",
    images: [{ url: "/punkte/og.jpg", width: 1200, height: 630, alt: "Punkte-Check von Atilla Barbarossa" }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function Punkte() {
  return <PunktePage />;
}
