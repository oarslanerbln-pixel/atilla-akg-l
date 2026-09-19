import type { Metadata } from "next";
import LegalPage, { Todo } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum | Atilla BARBAROSSA",
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Atilla Akgül
        <br />
        <Todo>Straße und Hausnummer</Todo>
        <br />
        <Todo>PLZ und Ort</Todo>
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+4917672725165">+49 176 72 72 5165</a>
        <br />
        E-Mail: <a href="mailto:a@barbarossafilms.de">a@barbarossafilms.de</a>
        <br />
        Management: <a href="mailto:lisaweber@barbarossafilms.de">lisaweber@barbarossafilms.de</a>
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>
        Gemäß § 27 a Umsatzsteuergesetz: <Todo>USt-IdNr. oder Steuernummer</Todo>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Atilla Akgül
        <br />
        <Todo>Anschrift wie oben</Todo>
      </p>

      <h2>Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit:{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        . Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungs&shy;verfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Sämtliche auf dieser Website gezeigten Film- und Bildaufnahmen sind
        eigene Produktionen und urheberrechtlich geschützt. Eine Verwendung
        außerhalb der Grenzen des Urheberrechts bedarf der vorherigen
        schriftlichen Zustimmung.
      </p>
    </LegalPage>
  );
}
