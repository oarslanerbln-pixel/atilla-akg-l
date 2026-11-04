import CardPage from "@/components/card/CardPage";
import { cardMetadata } from "@/components/card/share";
import { cardCodes } from "@/lib/card";

/** /card in Turkish. */
export const metadata = cardMetadata("TR");

export default function CardTurkish() {
  return <CardPage codes={cardCodes()} />;
}
