import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/metadata";
import { appleWalletConfigured, googleWalletConfigured } from "@/lib/wallet/config";

/** /card in English. */
export const metadata = cardMetadata("EN");

export default function CardEnglish() {
  return <CardPage apple={appleWalletConfigured()} google={googleWalletConfigured()} />;
}
