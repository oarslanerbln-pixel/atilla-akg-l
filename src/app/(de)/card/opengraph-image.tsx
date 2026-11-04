import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, cardPreview } from "@/components/card/share";

/** The German card; the English and Turkish ones live in (en)/card/en and (tr)/card/tr. See components/card/share.tsx. */
export const alt = cardAlt("DE");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return cardPreview("DE");
}
