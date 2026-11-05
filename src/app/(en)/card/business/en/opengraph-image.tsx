import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, cardPreview } from "@/components/card/share";

/** The business card's link preview. See components/card/share.tsx. */
export const alt = cardAlt("EN", "business");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return cardPreview("EN", "business");
}
