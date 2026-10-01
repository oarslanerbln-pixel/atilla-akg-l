import { translations, type Language, type TranslationKeys } from "@/i18n/translations";
import { fill } from "@/i18n/format";
import { contact, siteUrl, socialProfiles } from "@/lib/site";
import { partners } from "@/lib/partners";
import { brands } from "@/lib/brands";
import { packages } from "@/lib/packages";
import { roadmap } from "@/lib/roadmap";
import { faq, plainAnswer, siteFacts } from "@/lib/faq";
import { HTML_LANG, LANGUAGES, pagePath } from "@/lib/locales";

/**
 * Structured data (schema.org, JSON-LD) for search engines and answer
 * engines.
 *
 * Everything here restates what the page already says out loud — names,
 * figures, services, the FAQ — read from the same lists and translations the
 * page renders, so the markup cannot claim anything the visitor does not see.
 * Nodes that appear on more than one page carry an @id, which is how the
 * pieces join into one graph: the WebSite is published by the Person, the
 * home page is a ProfilePage about that Person, the social media service is
 * provided by them.
 *
 * Deliberately left out: follower counts as `interactionStatistic` (schema.org
 * means followers on this site, not on Instagram; the figures are stated in
 * the FAQ instead), the street address (the imprint carries it; the city is
 * enough to place the work), and VideoObject for the clips (their publication
 * dates are not recorded anywhere to state them truthfully).
 */

const absolute = (path: string) => new URL(path, siteUrl).href;

const ids = {
  website: `${siteUrl}/#website`,
  person: `${siteUrl}/#person`,
  services: `${siteUrl}/#services`,
  partners: `${siteUrl}/#partners`,
  brands: `${siteUrl}/#brands`,
};

const ref = (id: string) => ({ "@id": id });

const SEGMENTS = [
  { key: "hotels", audience: "hero_aud_hotels" },
  { key: "dmo", audience: "hero_aud_destinations" },
  { key: "brands", audience: "hero_aud_brands" },
] as const;

const socialMediaServiceId = (lang: Language) => `${absolute(pagePath("socialMedia", lang))}#service`;

/**
 * The nodes every page carries: the site, the person it is about, what they
 * offer and whom they have worked with. In the page's language where there is
 * text to translate.
 */
export function siteGraph(lang: Language) {
  const t = translations[lang];
  const key = (k: string) => t[k as TranslationKeys];

  // Destinations the work covers, in English, from the partner list, so a new
  // partner updates this without a second edit. UNESCO is international, not
  // a place, so it is not a destination.
  const destinations = partners
    .filter((partner) => partner.region !== "partners_region_intl")
    .map((partner) => translations.EN[partner.region]);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: absolute("/"),
        name: "Atilla Barbarossa",
        inLanguage: LANGUAGES.map((l) => HTML_LANG[l]),
        publisher: ref(ids.person),
        about: ref(ids.person),
      },
      {
        "@type": "Person",
        "@id": ids.person,
        // The name the work is published under everywhere; the legal name,
        // as the imprint gives it, is the alternate.
        name: "Atilla Barbarossa",
        alternateName: "Atilla Akgül",
        givenName: "Atilla",
        familyName: "Akgül",
        jobTitle: "Creative Director & Filmmaker",
        description: t.seo_person_description,
        url: absolute("/"),
        image: {
          "@type": "ImageObject",
          url: absolute("/roadmap/atilla.webp"),
          width: 720,
          height: 720,
        },
        email: `mailto:${contact.email}`,
        telephone: contact.phone,
        address: { "@type": "PostalAddress", addressLocality: "Berlin", addressCountry: "DE" },
        knowsLanguage: LANGUAGES.map((l) => HTML_LANG[l]),
        knowsAbout: [
          "Travel filmmaking",
          "Hotel marketing",
          "Destination marketing",
          "Luxury hospitality",
          "Social media video production",
          "Instagram Reels",
          "Drone cinematography",
          ...destinations,
        ],
        sameAs: Object.values(socialProfiles),
        hasOfferCatalog: ref(ids.services),
      },
      {
        "@type": "OfferCatalog",
        "@id": ids.services,
        name: t.services_title,
        itemListElement: [
          ...SEGMENTS.map((segment) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: key(`service_${segment.key}_title`),
              description: key(`service_${segment.key}_desc`),
              audience: { "@type": "BusinessAudience", audienceType: t[segment.audience] },
              provider: ref(ids.person),
            },
          })),
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": socialMediaServiceId(lang),
              name: t.pkg_meta_title,
              url: absolute(pagePath("socialMedia", lang)),
              provider: ref(ids.person),
            },
          },
        ],
      },
      {
        // Person has no "worked with". Once a partner has a link to the
        // published collaboration, that link becomes a CreativeWork created
        // by the Person about the partner — the relationship stated through
        // the thing that proves it.
        "@type": "ItemList",
        "@id": ids.partners,
        name: t.partners_title,
        itemListElement: partners.map((partner, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Organization",
            name: partner.name,
            ...(partner.url && {
              subjectOf: {
                "@type": "CreativeWork",
                url: partner.url,
                creator: ref(ids.person),
              },
            }),
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": ids.brands,
        name: t.brands_label,
        itemListElement: brands.map((brand, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@type": "Organization", name: brand.name },
        })),
      },
    ],
  };
}

/** The home page: a profile of the Person, and the FAQ it answers. */
export function homeGraph(lang: Language) {
  const t = translations[lang];
  const url = absolute(pagePath("home", lang));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: t.meta_home_title,
        description: fill(t.meta_home_description, siteFacts(lang)),
        inLanguage: HTML_LANG[lang],
        isPartOf: ref(ids.website),
        mainEntity: ref(ids.person),
        about: ref(ids.person),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url: `${url}#faq`,
        inLanguage: HTML_LANG[lang],
        isPartOf: ref(ids.website),
        mainEntity: faq(lang).map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: plainAnswer(entry) },
        })),
      },
    ],
  };
}

/** /social-media: the monthly packages as a service with three offers. */
export function socialMediaGraph(lang: Language) {
  const t = translations[lang];
  const url = absolute(pagePath("socialMedia", lang));
  const description = fill(t.pkg_meta_description, siteFacts(lang));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": socialMediaServiceId(lang),
        name: t.pkg_meta_title,
        serviceType: t.pkg_eyebrow,
        description,
        url,
        provider: ref(ids.person),
        availableLanguage: LANGUAGES.map((l) => HTML_LANG[l]),
        audience: {
          "@type": "BusinessAudience",
          audienceType: [t.hero_aud_hotels, t.hero_aud_destinations, t.hero_aud_brands].join(", "),
        },
        // No prices, as on the page: the investment is quoted after a call.
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.pkg_packages_eyebrow,
          itemListElement: packages.map((pkg) => ({
            "@type": "Offer",
            name: pkg.name,
            description: t[pkg.tagline],
            itemOffered: {
              "@type": "Service",
              name: `${pkg.name} – ${pkg.videos} ${t.pkg_videos} ${t.pkg_per_month}`,
              description: pkg.features.map((feature) => t[feature]).join(", "),
            },
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: t.pkg_meta_title,
        description,
        inLanguage: HTML_LANG[lang],
        isPartOf: ref(ids.website),
        about: ref(socialMediaServiceId(lang)),
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Atilla Barbarossa", item: absolute(pagePath("home", lang)) },
            { "@type": "ListItem", position: 2, name: t.pkg_eyebrow, item: url },
          ],
        },
      },
    ],
  };
}

/**
 * /roadmap: the e-book, with the price its checkout charges, and the page's
 * own questions. German, like the page's address and the book itself.
 */
export function roadmapGraph(description: string) {
  const t = translations.DE;
  const url = absolute("/roadmap");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Book", "Product"],
        "@id": `${url}#ebook`,
        name: "The Travel Creator Roadmap",
        description,
        url,
        image: absolute("/roadmap/cover.webp"),
        author: ref(ids.person),
        inLanguage: "de",
        bookFormat: "https://schema.org/EBook",
        // What Merchant Center reads to list the book for free in Google's
        // shopping results (digital books may not run as Shopping ads, but
        // free listings take them): an id, a brand and who sells it.
        sku: roadmap.sku,
        brand: { "@type": "Brand", name: "Atilla Barbarossa" },
        offers: {
          "@type": "Offer",
          price: roadmap.price,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: ref(ids.person),
          // This page, not the Tentary checkout: a free listing has to land
          // on the verified domain, and the price shown here is the offer.
          url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Atilla Barbarossa", item: absolute(pagePath("home", "DE")) },
          { "@type": "ListItem", position: 2, name: t.footer_roadmap, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: "de",
        isPartOf: ref(ids.website),
        mainEntity: ([1, 2, 3, 4] as const).map((n) => ({
          "@type": "Question",
          name: t[`rm_faq_${n}_q`],
          acceptedAnswer: { "@type": "Answer", text: t[`rm_faq_${n}_a`] },
        })),
      },
    ],
  };
}
