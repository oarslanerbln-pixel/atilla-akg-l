import type { Metadata } from "next";
import RoadmapPage from "@/components/roadmap/RoadmapPage";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME } from "@/lib/metadata";
import { roadmapGraph } from "@/lib/structuredData";

const title = `The Travel Creator Roadmap | ${SITE_NAME}`;
const description =
  "Das E-Book von Atilla Barbarossa: Pitch-Vorlagen, Hotel-Strategie und der Weg von kostenlosen Luxusnächten zu bezahlten Kooperationen.";

/**
 * Unlike the legal pages this one is meant to be found: it is linked from the
 * footer and listed in the sitemap. `?lang=en` or `?lang=tr` opens it in the
 * visitor's language (see RoadmapPage); the address itself stays German, as
 * the book is.
 */
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title,
    description,
    url: "/roadmap",
    siteName: SITE_NAME,
    locale: "de_DE",
    type: "website",
    images: [{ url: "/roadmap/cover.webp", width: 960, height: 1500, alt: "The Travel Creator Roadmap" }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function Roadmap() {
  return (
    <>
      <JsonLd data={roadmapGraph(description)} />
      <RoadmapPage />
    </>
  );
}
