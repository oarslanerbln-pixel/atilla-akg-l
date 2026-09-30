import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import type { Language } from "@/i18n/translations";
import { INTRO_SEEN_SCRIPT } from "@/lib/intro";
import { HTML_LANG } from "@/lib/locales";
import { siteGraph } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import { Providers } from "./Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Every heading, figure and quote on the page. Three static weights: 300 for
// display sizes, 400 and 500 where the type is small enough that a hairline
// would break up.
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter-tight",
  display: "swap",
});

/**
 * The document every page is rendered into, in one language.
 *
 * There are three root layouts — (de), (en) and (tr) — so that each language
 * is served with its own `<html lang>` from the first byte; a single root
 * layout could only ever say "de", whatever the page below it was written in.
 * They share everything else through this component: fonts, the intro flag,
 * the site-wide structured data and the language context, started in the
 * layout's language so the server renders the text a crawler should read.
 */
export default function RootDocument({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the intro script below may add a data
    // attribute to <html> before React hydrates it.
    <html
      lang={HTML_LANG[lang]}
      className={`${inter.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Runs before first paint so a returning visitor never sees the
            intro overlay; see src/lib/intro.ts. A fixed string, no input. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
        <JsonLd data={siteGraph(lang)} />
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
