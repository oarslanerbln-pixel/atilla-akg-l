import PackagesPage from "@/components/packages/PackagesPage";
import { packagesMetadata } from "./share";

/**
 * A page for sending, not for finding: it is shared by hand with prospects,
 * so search engines are asked to leave it out and nothing on the site links
 * to it. The link opens in German; `?lang=en` or `?lang=tr` opens it in the
 * prospect's language, preview included (see share.tsx, en/ and tr/).
 */
export const metadata = packagesMetadata("DE");

export default function SocialMedia() {
  return <PackagesPage />;
}
