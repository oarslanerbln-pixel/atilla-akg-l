/**
 * Commercial brands Atilla has worked with, as the brand band under the hero
 * credits them. Tourism boards and institutions live in partners.ts.
 *
 * One list for the band, the structured data and /llms.txt. Written in each
 * brand's own case; `lang` is the language the name is in, because CSS
 * uppercases by the page's language and under Turkish would set GİLLETTE and
 * RİXOS — words no brand spells that way. `segment` places the brand among
 * the media kit's references (hospitality or other brands).
 */
export const brands = [
  { name: "Rixos Hotels", lang: "en", segment: "hotels" },
  { name: "Accor Live Limitless", lang: "en", segment: "hotels" },
  { name: "Gillette", lang: "en", segment: "brands" },
  { name: "BER Flughafen", lang: "de", segment: "brands" },
] as const;
