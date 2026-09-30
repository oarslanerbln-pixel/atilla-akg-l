import { partners } from "@/lib/partners";
import { brands } from "@/lib/brands";
import { packages } from "@/lib/packages";
import { audience, contact, siteUrl, socialProfiles } from "@/lib/site";
import { faq, plainAnswer } from "@/lib/faq";
import { LANGUAGES, LANGUAGE_NAMES, pagePath } from "@/lib/locales";
import { translations } from "@/i18n/translations";

/**
 * /llms.txt — a plain-text summary for AI answer engines.
 *
 * An emerging convention rather than a standard: some crawlers read it, none
 * are obliged to. It costs one static file, and when an engine does read it,
 * it gets the facts in the order a person asking "who should film our
 * destination?" would want them, instead of reconstructing them from a page
 * built for animation.
 *
 * Every line is generated from the same sources the page renders — the
 * partner and brand lists, the audience figures, the packages, the FAQ, the
 * contact details, the English translations — so it cannot claim anything
 * the site does not, and it updates with them.
 */
export const dynamic = "force-static";

const absolute = (path: string) => new URL(path, siteUrl).href;

export function GET() {
  const en = translations.EN;
  const number = new Intl.NumberFormat("en");

  const lines = [
    "# Atilla Barbarossa",
    "",
    "> Travel filmmaker, creative director and travel content creator from Berlin, working between Berlin and Istanbul. Cinematic films for hotels and resorts, destinations and tourism boards, and travel and premium brands, published to an audience mainly in the German-speaking DACH region. Legal name: Atilla Akgül.",
    "",
    "## Pages",
    ...LANGUAGES.map(
      (lang) => `- [Portfolio (${LANGUAGE_NAMES[lang]})](${absolute(pagePath("home", lang))})`,
    ),
    ...LANGUAGES.map(
      (lang) =>
        `- [Monthly social media packages (${LANGUAGE_NAMES[lang]})](${absolute(pagePath("socialMedia", lang))})`,
    ),
    `- [The Travel Creator Roadmap, e-book (Deutsch)](${absolute("/roadmap")})`,
    "",
    "## Audience",
    `- Instagram: ${number.format(audience.followers.instagram)} followers (${socialProfiles.instagram})`,
    `- TikTok: ${number.format(audience.followers.tiktok)} followers (${socialProfiles.tiktok})`,
    `- YouTube: ${number.format(audience.followers.youtube)} subscribers (${socialProfiles.youtube})`,
    `- ${audience.dach}% from the DACH region (Germany, Austria, Switzerland), ${audience.age25to54}% aged 25–54, ${audience.female}% women`,
    `- ${number.format(audience.accountsReached)} accounts reached; average reach per reel ${number.format(audience.average.reels)}+, per story ${number.format(audience.average.story)}+, per post ${number.format(audience.average.post)}+`,
    "",
    "## Tourism boards and institutions worked with",
    ...partners.map(
      (partner) =>
        `- ${partner.name} (${en[partner.region]})${partner.url ? `: ${partner.url}` : ""}`,
    ),
    "",
    "## Brands worked with",
    ...brands.map((brand) => `- ${brand.name}`),
    "- Novotel Bosphorus Istanbul: reel campaign, 559,316 accounts reached",
    "",
    "## Services",
    ...(["hotels", "dmo", "brands"] as const).map(
      (segment) =>
        `- ${en[`service_${segment}_for`]}: ${en[`service_${segment}_title`]} (${[
          en[`service_${segment}_d1`],
          en[`service_${segment}_d2`],
          en[`service_${segment}_d3`],
        ].join(", ")})`,
    ),
    `- Monthly social media packages, prices on request: ${packages
      .map((pkg) => `${pkg.name} (${pkg.videos} videos a month)`)
      .join(", ")}. ${absolute(pagePath("socialMedia", "EN"))}`,
    "",
    "## E-book",
    `- The Travel Creator Roadmap (PDF, in German): pitch templates, a hotel strategy and turning trips into income. ${absolute("/roadmap")}`,
    "",
    "## FAQ",
    ...faq("EN").flatMap((entry) => [`### ${entry.question}`, plainAnswer(entry), ""]),
    "## Contact",
    `- Email: ${contact.email}`,
    `- Management: ${contact.management}`,
    `- Phone / WhatsApp: ${contact.phoneDisplay}`,
    `- Website: ${absolute("/")}`,
    ...Object.values(socialProfiles).map((url) => `- ${url}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
