/**
 * Commercial brands Atilla has worked with, as the brand band under the hero
 * credits them. Tourism boards and institutions live in partners.ts.
 *
 * One list for the band, the structured data and /llms.txt. Written in each
 * brand's own case; `lang` is the language the name is in, because CSS
 * uppercases by the page's language and under Turkish would set GİLLETTE and
 * RİXOS — words no brand spells that way. `segment` places the brand among
 * the media kit's references (hospitality or other brands). `website` is the
 * brand's official site, stated in the structured data and /llms.txt so the
 * name resolves to the right company.
 */
export const brands = [
  { name: "Rixos Hotels", lang: "en", segment: "hotels", website: "https://www.rixos.com" },
  { name: "Accor Live Limitless", lang: "en", segment: "hotels", website: "https://all.accor.com" },
  { name: "Gillette", lang: "en", segment: "brands", website: "https://gillette.com" },
  { name: "BER Flughafen", lang: "de", segment: "brands", website: "https://ber.berlin-airport.de" },
] as const;
