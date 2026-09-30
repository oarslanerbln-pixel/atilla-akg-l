import PackagesPage from "@/components/packages/PackagesPage";
import { packagesMetadata } from "../share";

/** /social-media in English. The `?lang=en` links are rewritten here (next.config.ts). */
export const metadata = packagesMetadata("EN");

export default function SocialMediaEnglish() {
  return <PackagesPage lang="EN" />;
}
