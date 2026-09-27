import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum | Atilla BARBAROSSA",
  robots: { index: false, follow: true },
};

/**
 * Provider identification under § 5 DDG. Phone and e-mail come from
 * src/lib/site.ts so the imprint can never drift from the contact section.
 *
 * The EU online dispute resolution (ODR) platform was shut down on
 * 20 July 2025 (Regulation (EU) 2024/3228), so the former link to it and the
 * duty to show it are gone; only the § 36 VSBG statement remains.
 */
export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Atilla Akgül
        <br />
        Neuendorfer Straße 54
        <br />
        13585 Berlin
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>
        <br />
        E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <br />
        Management: <a href={`mailto:${contact.management}`}>{contact.management}</a>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Atilla Akgül
        <br />
        Neuendorfer Straße 54, 13585 Berlin
      </p>

      <h2>Verbraucher&shy;streitbeilegung</h2>
      <p>
        Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungs&shy;verfahren
        vor einer Verbraucher&shy;schlichtungsstelle teilzunehmen (§ 36 VSBG).
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch
        keine Gewähr übernehmen. Als Diensteanbieter bin ich gemäß § 7 Abs. 1
        DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
        verantwortlich. Nach §§ 8 bis 10 DDG bin ich jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt;
        eine Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
        konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender
        Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Diese Website enthält Links zu externen Websites Dritter (etwa Instagram,
        TikTok, YouTube und WhatsApp), auf deren Inhalte ich keinen Einfluss
        habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder
        Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
        Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft;
        rechtswidrige Inhalte waren nicht erkennbar. Eine permanente inhaltliche
        Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer
        Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
        Rechtsverletzungen werde ich derartige Links umgehend entfernen.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Sämtliche auf dieser Website gezeigten Film- und Bildaufnahmen, Texte
        und Gestaltungselemente sind eigene Werke und urheberrechtlich
        geschützt. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
        Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
        vorherigen schriftlichen Zustimmung. Genannte Marken und Namen von
        Kunden und Partnern sind Eigentum der jeweiligen Inhaber und werden
        ausschließlich als Referenz genannt.
      </p>
    </LegalPage>
  );
}
