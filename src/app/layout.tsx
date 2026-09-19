import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/**
 * Absolute URLs in the metadata resolve against this. It was pinned to the
 * custom domain, so every preview link from a Vercel preview or the
 * *.vercel.app deployment pointed at a host that may not be serving this
 * build yet. Vercel supplies the deployment host; the custom domain stays the
 * production default.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://atillabarbarossa.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://atillabarbarossa.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Atilla BARBAROSSA | Visual Storytelling & Creative Direction",
  description: "Global visual storyteller, creative director and premium filmmaker specializing in luxury hospitality, executive aviation, and high-end lifestyle.",
  keywords: ["Atilla Barbarossa", "Visual Storytelling", "Creative Director", "Luxury Filmmaker", "Content Creator", "DACH region"],
  openGraph: {
    title: "Atilla BARBAROSSA | Visual Storytelling",
    description: "Global visual storyteller and premium filmmaker.",
    url: siteUrl,
    siteName: "Atilla Barbarossa Portfolio",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atilla BARBAROSSA | Visual Storytelling",
    description: "Global visual storyteller and premium filmmaker.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "./Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
