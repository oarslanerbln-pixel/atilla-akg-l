import { CARD_CONTENT_TYPE, CARD_SIZE, cardAlt, packagesCard } from "@/components/packages/share";

/** The Turkish card. See components/packages/share.tsx. */
export const alt = cardAlt("TR");
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default function OpenGraphImage() {
  return packagesCard("TR");
}
