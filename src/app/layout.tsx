import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { contact, siteUrl, socialProfiles } from "@/lib/site";

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

/**
 * Structured data for the person the site is about.
 *
 * A search engine could previously infer the name only from the headline. The
 * fields here are the ones the site already states out loud — nothing is
 * invented, and the postal address is left out until the imprint carries it.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Atilla Akgül",
  alternateName: "Atilla Barbarossa",
  jobTitle: "Creative Director & Filmmaker",
  description:
    "Global visual storyteller, creative director and premium filmmaker specializing in luxury hospitality, executive aviation, and high-end lifestyle.",
  url: siteUrl,
  email: `mailto:${contact.email}`,
  telephone: contact.phone,
  knowsLanguage: ["de", "en", "tr"],
  sameAs: Object.values(socialProfiles),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // The object is a literal defined above, not anything a visitor can
          // reach; JSON.stringify is what serialises it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
