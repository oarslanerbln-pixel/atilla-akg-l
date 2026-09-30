import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, packagesCard } from "./share";

/** The German card; the English and Turkish ones live in en/ and tr/. See share.tsx. */
export const alt = cardAlt("DE");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return packagesCard("DE");
}
