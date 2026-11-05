import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";
import { walletOptions } from "@/lib/wallet/ready";

/** /card in English. */
export const metadata = cardMetadata("EN");

export default function CardEnglish() {
  return <CardPage codes={cardCodes()} wallet={walletOptions()} />;
}
