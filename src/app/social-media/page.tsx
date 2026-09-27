import type { Metadata } from "next";
import PackagesPage from "@/components/packages/PackagesPage";

const description =
  "Monthly video production and social media management — Essential, Signature and Prestige packages by Atilla Barbarossa.";

/**
 * A page for sending, not for finding: it is shared by hand with prospects,
 * so search engines are asked to leave it out and nothing on the site links
 * to it. The link opens in German; `?lang=en` or `?lang=tr` opens it in the
 * prospect's language (see PackagesPage).
 */
export const metadata: Metadata = {
  title: "Social Media Partnership | Atilla BARBAROSSA",
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title: "Social Media Partnership | Atilla BARBAROSSA",
    description,
    url: "/social-media",
    type: "website",
  },
};

export default function SocialMedia() {
  return <PackagesPage />;
}
