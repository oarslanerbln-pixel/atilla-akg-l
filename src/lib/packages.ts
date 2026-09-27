import type { TranslationKeys } from "@/i18n/translations";

/**
 * The monthly social media packages shown on /social-media.
 *
 * Deliberately without prices: the page is sent to prospects by hand, and the
 * investment is quoted after a call, once the brief is known. Each plate lists
 * everything it includes rather than "everything in X, plus", so a prospect
 * who only reads one plate still sees the whole offer.
 *
 * Names stay in English in every language; they work as labels, not words.
 */
export type PackageId = "essential" | "signature" | "prestige";

export interface Package {
  id: PackageId;
  name: string;
  videos: number;
  tagline: TranslationKeys;
  features: TranslationKeys[];
  /** The plate set in ink and marked "most chosen". */
  featured?: boolean;
}

export const packages: Package[] = [
  {
    id: "essential",
    name: "Essential",
    videos: 5,
    tagline: "pkg_tagline_essential",
    features: [
      "pkg_f_strategy",
      "pkg_f_shoot_1",
      "pkg_f_edit",
      "pkg_f_captions",
      "pkg_f_plan",
      "pkg_f_report",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    videos: 10,
    tagline: "pkg_tagline_signature",
    featured: true,
    features: [
      "pkg_f_strategy",
      "pkg_f_shoot_2",
      "pkg_f_edit",
      "pkg_f_drone",
      "pkg_f_captions",
      "pkg_f_plan",
      "pkg_f_community",
      "pkg_f_report",
    ],
  },
  {
    id: "prestige",
    name: "Prestige",
    videos: 20,
    tagline: "pkg_tagline_prestige",
    features: [
      "pkg_f_campaign",
      "pkg_f_shoot_4",
      "pkg_f_edit",
      "pkg_f_drone",
      "pkg_f_captions",
      "pkg_f_plan",
      "pkg_f_community",
      "pkg_f_raw",
      "pkg_f_priority",
      "pkg_f_report",
    ],
  },
];
