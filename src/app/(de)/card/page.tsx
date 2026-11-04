import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";

/**
 * The digital business card, in German. English and Turkish live at
 * /card/en and /card/tr, under their own root layouts. The QR codes are
 * computed here, at build time, so the encoder never reaches the browser.
 * See components/card/CardPage.tsx.
 */
export const metadata = cardMetadata("DE");

export default function Card() {
  return <CardPage codes={cardCodes()} />;
}
