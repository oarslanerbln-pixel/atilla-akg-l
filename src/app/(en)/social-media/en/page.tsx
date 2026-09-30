import PackagesPage from "@/components/packages/PackagesPage";
import JsonLd from "@/components/JsonLd";
import { packagesMetadata } from "@/components/packages/share";
import { socialMediaGraph } from "@/lib/structuredData";

/** /social-media in English. The `?lang=en` links are rewritten here (next.config.ts). */
export const metadata = packagesMetadata("EN");

export default function SocialMediaEnglish() {
  return (
    <>
      <JsonLd data={socialMediaGraph("EN")} />
      <PackagesPage />
    </>
  );
}
