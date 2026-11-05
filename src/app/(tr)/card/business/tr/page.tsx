import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";
import { walletOptions } from "@/lib/wallet/ready";

/**
 * /card/business in Turkish. The same card as /card, opening on its business face (audience
 * figures, media kit, management): the address to send hotels, brands and
 * tourism boards.
 */
export const metadata = cardMetadata("TR", "business");

export default function BusinessCardPage() {
  return <CardPage codes={cardCodes()} wallet={walletOptions()} initialMode="business" />;
}
