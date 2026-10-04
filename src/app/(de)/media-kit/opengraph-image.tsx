import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, mediaKitCard } from "@/components/mediakit/share";

/** The German card; the English and Turkish ones live in (en)/media-kit/en and (tr)/media-kit/tr. See components/mediakit/share.tsx. */
export const alt = cardAlt("DE");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return mediaKitCard("DE");
}
