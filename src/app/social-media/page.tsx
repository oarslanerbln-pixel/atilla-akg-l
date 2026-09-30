import type { Metadata } from "next";
import PackagesPage from "@/components/packages/PackagesPage";

const title = "Social Media Partnership | Atilla BARBAROSSA";
const description =
  "Monthly video production and social media management — Essential, Signature and Prestige packages by Atilla Barbarossa.";

/**
 * A page for sending, not for finding: it is shared by hand with prospects,
 * so search engines are asked to leave it out and nothing on the site links
 * to it. The link opens in German; `?lang=en` or `?lang=tr` opens it in the
 * prospect's language (see PackagesPage).
 *
 * The preview picture is ./opengraph-image.tsx. `twitter` is set here as well,
 * or the card would carry the home page's title under this page's picture.
 */
export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: "/social-media",
    siteName: "Atilla Barbarossa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function SocialMedia() {
  return <PackagesPage />;
}
