import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Atilla BARBAROSSA",
  robots: { index: false, follow: true },
};

/**
 * Describes what this site actually does, nothing more: Vercel hosting, one
 * localStorage flag, self-hosted assets, the contact form (Resend), plain
 * mailto/tel/wa.me links. The Instagram/WhatsApp concierge and Stripe
 * deposits under src/lib/concierge are not live; their sections must be
 * added here before those services are switched on.
 */
export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
      </p>
      <p>
        Atilla Akgül
        <br />
        Neuendorfer Straße 54
        <br />
        13585 Berlin
        <br />
        Telefon: <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>
        <br />
        E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
      <p>
        Ein Datenschutzbeauftragter ist nicht bestellt, da die gesetzlichen
        Voraussetzungen dafür nicht vorliegen.
      </p>

      <h2>2. Überblick</h2>
      <p>
        Diese Website verzichtet bewusst auf Tracking: keine Cookies, keine
        Analyse-Werkzeuge, keine Werbe-Pixel, keine eingebetteten Inhalte
        Dritter. Personenbezogene Daten werden nur verarbeitet, soweit dies für
        die Auslieferung der Seite technisch nötig ist oder Sie selbst Kontakt
        aufnehmen. Die Verbindung ist per TLS (HTTPS) verschlüsselt.
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Diese Website wird bei der Vercel Inc., 440 N Barranca Ave #4133,
        Covina, CA 91723, USA gehostet. Beim Aufruf der Seite verarbeitet Vercel
        technisch notwendige Verbindungsdaten in Server-Logfiles: IP-Adresse,
        Datum und Uhrzeit des Zugriffs, abgerufene Datei, übertragene
        Datenmenge, Referrer sowie Browser- und Betriebssystemkennung. Diese
        Daten werden nicht mit anderen Daten zusammengeführt und nach kurzer
        Zeit automatisch gelöscht.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte
        Interesse liegt im sicheren und stabilen Betrieb der Website. Mit
        Vercel besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Die
        Übermittlung in die USA erfolgt auf Grundlage des
        Angemessenheitsbeschlusses zum EU-US Data Privacy Framework, unter dem
        Vercel zertifiziert ist, ergänzend auf Grundlage der
        EU-Standard&shy;vertrags&shy;klauseln.
      </p>

      <h2>4. Speicherung im Browser</h2>
      <p>
        Es werden keine Cookies gesetzt. Nach dem ersten Besuch legt die Seite
        lediglich einen technischen Eintrag im lokalen Speicher Ihres Browsers
        ab (<code>atilla_preloader_seen</code>), damit das Intro bei späteren
        Besuchen übersprungen wird. Der Eintrag enthält keine
        personenbezogenen Daten, wird nicht an mich oder Dritte übertragen und
        lässt sich jederzeit über die Browsereinstellungen löschen.
        Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG, da der Eintrag
        ausschließlich der Bereitstellung der von Ihnen aufgerufenen Seite
        dient.
      </p>

      <h2>5. Keine externen Ressourcen</h2>
      <p>
        Schriften, Videos, Bilder und Symbole werden ausschließlich vom eigenen
        Server ausgeliefert. Es werden keine Google Fonts, keine CDN-Skripte,
        keine eingebetteten Karten oder Videos und keine externen Bilddienste
        geladen. Beim bloßen Betrachten der Seite wird Ihre IP-Adresse deshalb
        an keinen Dritten außer den Hoster übertragen.
      </p>
      <p>
        Die Links zu Instagram, TikTok und YouTube sind einfache Verweise. Erst
        wenn Sie einen davon anklicken, stellt Ihr Browser eine Verbindung zum
        jeweiligen Anbieter her; ab diesem Zeitpunkt gilt dessen
        Datenschutzerklärung.
      </p>

      <h2>6. Kontaktformular</h2>
      <p>
        Wenn Sie das Kontaktformular nutzen, werden Name, E-Mail-Adresse und
        Nachricht verarbeitet, um Ihre Anfrage zu beantworten. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung über das
        Bestätigungsfeld) sowie Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage
        auf einen Vertragsschluss gerichtet ist. Die Einwilligung können Sie
        jederzeit mit Wirkung für die Zukunft widerrufen.
      </p>
      <p>
        Für den Versand wird der Dienst Resend (Plus Five Five, Inc., 2261
        Market Street, San Francisco, CA 94114, USA) als Auftragsverarbeiter
        eingesetzt. Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO liegt
        vor; die Übermittlung in die USA erfolgt auf Grundlage der
        EU-Standard&shy;vertrags&shy;klauseln.
      </p>
      <p>
        Zur Abwehr automatisierter Massenzusendungen wird die Anzahl der
        Absendungen je IP-Adresse kurzzeitig im Arbeitsspeicher begrenzt. Diese
        Angabe wird nicht dauerhaft gespeichert und nicht ausgewertet.
      </p>

      <h2>7. Kontakt per E-Mail oder Telefon</h2>
      <p>
        Schreiben Sie mir eine E-Mail oder rufen Sie mich an, verarbeite ich
        die dabei mitgeteilten Daten (etwa Name, E-Mail-Adresse, Telefonnummer
        und Inhalt der Anfrage) ausschließlich zur Bearbeitung Ihres Anliegens.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage auf
        einen Vertrag gerichtet ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an der Beantwortung von Anfragen).
      </p>

      <h2>8. Kontakt über WhatsApp</h2>
      <p>
        Die Seite enthält Links, über die Sie mich per WhatsApp erreichen
        können. Auf der Seite selbst wird dafür nichts von WhatsApp geladen;
        erst wenn Sie einen Link antippen, öffnet sich WhatsApp mit einer
        vorformulierten Nachricht, die Sie vor dem Absenden ändern oder
        verwerfen können.
      </p>
      <p>
        Schreiben Sie mir über WhatsApp, verarbeitet der Anbieter WhatsApp
        Ireland Limited (Merrion Road, Dublin 4, D04 X2K5, Irland), ein
        Unternehmen der Meta-Gruppe, Ihre Telefonnummer, Ihren Profilnamen und
        die Nachricht; eine Übermittlung in die USA ist dabei nicht
        auszuschließen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit
        Ihre Anfrage auf einen Vertrag gerichtet ist, im Übrigen Art. 6 Abs. 1
        lit. f DSGVO. Die Nutzung ist freiwillig; Kontaktformular, E-Mail und
        Telefon stehen gleichwertig zur Verfügung.
      </p>

      <h2>9. Speicherdauer</h2>
      <p>
        Anfragen und die zugehörige Korrespondenz werden gelöscht, sobald sie
        abschließend bearbeitet sind und keine gesetzlichen
        Aufbewahrungspflichten entgegenstehen. Kommt ein Vertrag zustande,
        gelten die handels- und steuerrechtlichen Aufbewahrungsfristen (in der
        Regel sechs bis zehn Jahre, § 257 HGB, § 147 AO).
      </p>

      <h2>10. Pflicht zur Bereitstellung, keine automatisierte Entscheidung</h2>
      <p>
        Sie sind weder gesetzlich noch vertraglich verpflichtet,
        personenbezogene Daten bereitzustellen; ohne Angaben kann ich eine
        Anfrage jedoch nicht beantworten. Eine automatisierte
        Entscheidungsfindung einschließlich Profiling nach Art. 22 DSGVO findet
        nicht statt.
      </p>

      <h2>11. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht auf</p>
      <ul>
        <li>Auskunft über die zu Ihrer Person verarbeiteten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
        <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
      </ul>
      <p>
        <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Soweit eine
        Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, können Sie ihr aus
        Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit
        widersprechen.
      </p>
      <p>
        Für die Ausübung Ihrer Rechte genügt eine formlose Nachricht an{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>12. Beschwerderecht</h2>
      <p>
        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
        beschweren. Zuständig für mich ist:
      </p>
      <p>
        Berliner Beauftragte für Datenschutz und Informationsfreiheit
        <br />
        Alt-Moabit 59–61, 10555 Berlin
        <br />
        <a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer">
          www.datenschutz-berlin.de
        </a>
      </p>

      <h2>13. Stand</h2>
      <p>
        Stand: September 2026. Diese Erklärung beschreibt den technischen Stand
        dieser Website und wird angepasst, sobald sich eingesetzte Dienste
        ändern.
      </p>
    </LegalPage>
  );
}
