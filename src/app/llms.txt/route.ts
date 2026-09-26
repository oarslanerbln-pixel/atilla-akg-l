import { partners } from "@/lib/partners";
import { contact, siteUrl, socialProfiles } from "@/lib/site";
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
 * partner list, the contact details, the English translations — so it cannot
 * claim anything the site does not, and it updates with them.
 */
export const dynamic = "force-static";

export function GET() {
  const en = translations.EN;

  const lines = [
    "# Atilla Barbarossa",
    "",
    "> Creative director and filmmaker working between Berlin and Istanbul. Visual storytelling for luxury hospitality, travel destinations, executive aviation and high-end lifestyle, for a German-speaking (DACH) audience. Also known as Atilla Akgül.",
    "",
    "## Tourism boards and institutions worked with",
    ...partners.map(
      (partner) =>
        `- ${partner.name} (${en[partner.region]})${partner.url ? `: ${partner.url}` : ""}`,
    ),
    "",
    "## Services",
    `- ${en.service_1_title}`,
    `- ${en.service_2_title}`,
    `- ${en.service_3_title}`,
    `- ${en.service_4_title}`,
    "",
    "## Contact",
    `- Email: ${contact.email}`,
    `- Management: ${contact.management}`,
    `- Website: ${siteUrl}`,
    ...Object.values(socialProfiles).map((url) => `- ${url}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
