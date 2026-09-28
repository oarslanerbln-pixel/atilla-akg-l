import type { Metadata } from "next";
import RoadmapPage from "@/components/roadmap/RoadmapPage";

const title = "The Travel Creator Roadmap | Atilla BARBAROSSA";
const description =
  "Das E-Book von Atilla Barbarossa: Pitch-Vorlagen, Hotel-Strategie und der Weg von kostenlosen Luxusnächten zu bezahlten Kooperationen.";

/**
 * Unlike /social-media this page is meant to be found: it is linked from the
 * footer and listed in the sitemap. `?lang=en` or `?lang=tr` opens it in the
 * visitor's language (see RoadmapPage).
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title,
    description,
    url: "/roadmap",
    type: "website",
    images: [{ url: "/roadmap/cover.webp", width: 960, height: 1500, alt: "The Travel Creator Roadmap" }],
  },
};

export default function Roadmap() {
  return <RoadmapPage />;
}
