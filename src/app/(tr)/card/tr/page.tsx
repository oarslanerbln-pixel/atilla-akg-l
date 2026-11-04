import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/metadata";
import { appleWalletConfigured, googleWalletConfigured } from "@/lib/wallet/config";

/** /card in Turkish. */
export const metadata = cardMetadata("TR");

export default function CardTurkish() {
  return <CardPage apple={appleWalletConfigured()} google={googleWalletConfigured()} />;
}
