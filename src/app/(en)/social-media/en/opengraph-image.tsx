import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, packagesCard } from "@/components/packages/share";

/** The English card. See components/packages/share.tsx. */
export const alt = cardAlt("EN");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return packagesCard("EN");
}
