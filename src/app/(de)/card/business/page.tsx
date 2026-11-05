import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";
import { walletOptions } from "@/lib/wallet/ready";

/**
 * The German business card; English and Turkish in (en)/card/business/en and (tr)/card/business/tr. The same card as /card, opening on its business face (audience
 * figures, media kit, management): the address to send hotels, brands and
 * tourism boards.
 */
export const metadata = cardMetadata("DE", "business");

export default function BusinessCardPage() {
  return <CardPage codes={cardCodes()} wallet={walletOptions()} initialMode="business" />;
}
