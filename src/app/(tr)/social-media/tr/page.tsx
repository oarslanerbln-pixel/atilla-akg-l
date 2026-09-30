import PackagesPage from "@/components/packages/PackagesPage";
import JsonLd from "@/components/JsonLd";
import { packagesMetadata } from "@/components/packages/share";
import { socialMediaGraph } from "@/lib/structuredData";

/** /social-media in Turkish. The `?lang=tr` links are rewritten here (next.config.ts). */
export const metadata = packagesMetadata("TR");

export default function SocialMediaTurkish() {
  return (
    <>
      <JsonLd data={socialMediaGraph("TR")} />
      <PackagesPage />
    </>
  );
}
