import type { Metadata } from "next";
import { Inter, Inter_Tight, Playfair_Display } from "next/font/google";
import "./globals.css";
import { contact, siteUrl, socialProfiles } from "@/lib/site";
import { partners } from "@/lib/partners";
import { translations } from "@/i18n/translations";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Section headings. Only the one weight they use: a static 300 is a fraction
// of the variable file, and nothing else on the page asks for this family.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: "300",
  variable: "--font-inter-tight",
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

const personId = `${siteUrl}/#person`;

// Destinations the work covers, in English, taken from the partner list so a
// new partner updates this without a second edit. UNESCO is international,
// not a place, so it is not a destination.
const destinations = partners
  .filter((partner) => partner.region !== "partners_region_intl")
  .map((partner) => translations.EN[partner.region]);

/**
 * Structured data for the person the site is about and the organisations
 * they have worked with.
 *
 * A search engine could previously infer the name only from the headline. The
 * fields here are the ones the site already states out loud — nothing is
 * invented, and the postal address is left out until the imprint carries it.
 *
 * The two nodes share one @graph and are joined by @id, which is how
 * schema.org expresses "these are about each other" without claiming a
 * relationship it has no property for: Person has no "worked with". Once a
 * partner has a link to the published collaboration, that link becomes a
 * CreativeWork whose creator is the Person and whose subject is the partner —
 * the relationship stated through the thing that proves it.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: "Atilla Akgül",
      alternateName: "Atilla Barbarossa",
      jobTitle: "Creative Director & Filmmaker",
      description:
        "Global visual storyteller, creative director and premium filmmaker specializing in luxury hospitality, executive aviation, and high-end lifestyle.",
      url: siteUrl,
      email: `mailto:${contact.email}`,
      telephone: contact.phone,
      knowsLanguage: ["de", "en", "tr"],
      knowsAbout: ["Travel filmmaking", "Destination marketing", "Luxury hospitality", ...destinations],
      sameAs: Object.values(socialProfiles),
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#partners`,
      name: "Tourism boards and institutions Atilla Barbarossa has worked with",
      itemListElement: partners.map((partner, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Organization",
          name: partner.name,
          ...(partner.url && {
            subjectOf: {
              "@type": "CreativeWork",
              url: partner.url,
              creator: { "@id": personId },
            },
          }),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${interTight.variable} ${playfair.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // The object is a literal defined above, not anything a visitor can
          // reach; JSON.stringify is what serialises it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
