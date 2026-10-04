import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, mediaKitCard } from "@/components/mediakit/share";

/** The English card. See components/mediakit/share.tsx. */
export const alt = cardAlt("EN");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return mediaKitCard("EN");
}
