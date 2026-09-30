import PackagesPage from "@/components/packages/PackagesPage";
import JsonLd from "@/components/JsonLd";
import { packagesMetadata } from "@/components/packages/share";
import { socialMediaGraph } from "@/lib/structuredData";

/**
 * The monthly social media packages, in German. Sent by hand to prospects
 * and, since the SEO pass, also meant to be found: indexed, in the sitemap,
 * linked from the portfolio's services and footer. `?lang=en` or `?lang=tr`
 * still opens the language a link was sent in, preview included (see
 * components/packages/share.tsx and next.config.ts).
 */
export const metadata = packagesMetadata("DE");

export default function SocialMedia() {
  return (
    <>
      <JsonLd data={socialMediaGraph("DE")} />
      <PackagesPage />
    </>
  );
}
