import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, packagesCard } from "@/components/packages/share";

/** The German card; the English and Turkish ones live in (en)/social-media/en and (tr)/social-media/tr. See components/packages/share.tsx. */
export const alt = cardAlt("DE");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return packagesCard("DE");
}
