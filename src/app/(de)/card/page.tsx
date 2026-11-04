import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/metadata";
import { appleWalletConfigured, googleWalletConfigured } from "@/lib/wallet/config";

/**
 * The digital business card in German: what the Wallet pass's QR code opens
 * and where the card is handed out. English and Turkish live at /card/en and
 * /card/tr. See components/card/CardPage.tsx and docs/wallet-setup.md.
 */
export const metadata = cardMetadata("DE");

export default function Card() {
  return <CardPage apple={appleWalletConfigured()} google={googleWalletConfigured()} />;
}
