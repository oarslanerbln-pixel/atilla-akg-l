import PackagesPage from "@/components/packages/PackagesPage";
import { packagesMetadata } from "../share";

/** /social-media in Turkish. The `?lang=tr` links are rewritten here (next.config.ts). */
export const metadata = packagesMetadata("TR");

export default function SocialMediaTurkish() {
  return <PackagesPage lang="TR" />;
}
