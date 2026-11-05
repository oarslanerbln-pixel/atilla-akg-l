import { cardStory } from "@/components/card/share";
import type { CardMode } from "@/components/card/qr";
import type { Language } from "@/i18n/translations";
import { HTML_LANG, LANGUAGES } from "@/lib/locales";

/**
 * /card-story/<de|en|tr>-<personal|business>.png — the card as an Instagram
 * story, for the card's "Instagram Story" button. Drawn once at build time,
 * six files in all; any other name is a 404.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const MODES: CardMode[] = ["personal", "business"];
const variant = (lang: Language, mode: CardMode) => `${HTML_LANG[lang]}-${mode}.png`;

export function generateStaticParams() {
  return LANGUAGES.flatMap((lang) => MODES.map((mode) => ({ variant: variant(lang, mode) })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant: name } = await params;
  for (const lang of LANGUAGES) {
    for (const mode of MODES) {
      if (variant(lang, mode) === name) {
        const image = await cardStory(lang, mode);
        image.headers.set("Cache-Control", "public, max-age=86400");
        return image;
      }
    }
  }
  return new Response("Not found", { status: 404 });
}
