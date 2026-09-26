import type { Metadata } from "next";
import LegalPage, { Todo } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Atilla BARBAROSSA",
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>
        Atilla Akgül
        <br />
        <Todo>Straße, PLZ und Ort</Todo>
        <br />
        E-Mail: <a href="mailto:a@barbarossafilms.de">a@barbarossafilms.de</a>
      </p>

      <h2>2. Hosting</h2>
      <p>
        Diese Website wird bei der Vercel Inc., 340 S Lemon Ave #4133, Walnut,
        CA 91789, USA gehostet. Beim Aufruf der Seite verarbeitet Vercel
        technisch notwendige Verbindungsdaten in Server-Logfiles: IP-Adresse,
        Datum und Uhrzeit des Zugriffs, abgerufene Datei, übertragene
        Datenmenge, Referrer sowie Browser- und Betriebssystemkennung.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte
        Interesse liegt im sicheren und stabilen Betrieb der Website. Die
        Übermittlung in die USA erfolgt auf Grundlage der Standard&shy;vertrags&shy;klauseln
        sowie der Zertifizierung von Vercel unter dem EU-US Data Privacy
        Framework.
      </p>

      <h2>3. Keine Cookies, kein Tracking</h2>
      <p>
        Diese Website setzt keine Cookies, kein Analyse-Werkzeug und keine
        Marketing-Pixel ein. Es findet keine Profilbildung und keine
        Reichweitenmessung statt. Aus diesem Grund gibt es auch kein
        Cookie-Banner.
      </p>

      <h2>4. Keine externen Ressourcen</h2>
      <p>
        Schriften, Videos, Bilder und Symbole werden ausschließlich vom eigenen
        Server ausgeliefert. Es werden keine Google Fonts, keine CDN-Skripte,
        keine eingebetteten Karten und keine externen Bilddienste zur Laufzeit
        geladen. Beim bloßen Betrachten der Seite wird Ihre IP-Adresse deshalb
        an keinen Dritten außer den Hoster übertragen.
      </p>
      <p>
        Die Links zu Instagram, TikTok und YouTube sind einfache Verweise. Erst
        wenn Sie einen davon anklicken, stellt Ihr Browser eine Verbindung zum
        jeweiligen Anbieter her; ab diesem Zeitpunkt gilt dessen
        Datenschutzerklärung.
      </p>

      <h2>5. Kontaktformular</h2>
      <p>
        Wenn Sie das Kontaktformular nutzen, werden Name, E-Mail-Adresse und
        Nachricht verarbeitet, um Ihre Anfrage zu beantworten. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung über das
        Bestätigungsfeld) sowie Art. 6 Abs. 1 lit. b DSGVO, soweit die Anfrage
        auf einen Vertragsschluss gerichtet ist.
      </p>
      <p>
        Für den Versand wird der Dienst Resend (Plus Five Five, Inc., 2261
        Market Street, San Francisco, CA 94114, USA) als Auftragsverarbeiter
        eingesetzt. Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO liegt
        vor; die Übermittlung erfolgt auf Grundlage der
        Standard&shy;vertrags&shy;klauseln.
      </p>
      <p>
        Zur Abwehr automatisierter Massenzusendungen wird die Anzahl der
        Absendungen je IP-Adresse kurzzeitig im Arbeitsspeicher begrenzt. Diese
        Angabe wird nicht gespeichert und nicht ausgewertet.
      </p>
      <p>
        Ihre Anfrage wird gelöscht, sobald sie abschließend bearbeitet ist und
        keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
      </p>

      <h2>6. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht auf</p>
      <ul>
        <li>Auskunft über die zu Ihrer Person verarbeiteten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO),</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO),</li>
        <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
      </ul>
      <p>
        Für die Ausübung genügt eine formlose Nachricht an{" "}
        <a href="mailto:a@barbarossafilms.de">a@barbarossafilms.de</a>. Ihnen
        steht außerdem ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde
        zu, in der Regel bei der Behörde Ihres Wohnsitzes oder am Sitz des
        Verantwortlichen.
      </p>

      <h2>7. Stand</h2>
      <p>
        Diese Erklärung beschreibt den technischen Stand dieser Website. Bei
        Änderungen an eingesetzten Diensten wird sie angepasst.
      </p>
    </LegalPage>
  );
}
