import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";
import { walletOptions } from "@/lib/wallet/ready";

/** /card in Turkish. */
export const metadata = cardMetadata("TR");

export default function CardTurkish() {
  return <CardPage codes={cardCodes()} wallet={walletOptions()} />;
}
