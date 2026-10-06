import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact, socialProfiles } from "@/lib/site";
import { languageAlternates } from "@/lib/locales";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von atillabarbarossa.com: welche Daten beim Besuch, im Kontaktformular und bei Instagram-Anfragen verarbeitet werden, und Ihre Rechte.",
  robots: { index: false, follow: true },
  alternates: languageAlternates("privacy", "DE"),
};

/**
 * Describes what this site actually does, nothing more: Vercel hosting
 * (functions in fra1, see vercel.json), one localStorage flag, self-hosted
 * assets, the contact form (Resend), plain mailto/tel/wa.me links, the
 * partner-link replies on Instagram (src/lib/concierge with CONCIERGE_AI off),
 * partner links (/go/<id>), the e-book checkout on Tentary (/roadmap) and
 * Atilla's social media profiles.
 *
 * This German text is binding; /datenschutz/en and /datenschutz/tr translate
 * it section by section, so every change here is made in all three files.
 * Move the region sentence if vercel.json changes. The AI concierge (Anthropic), its
 * WhatsApp side and Stripe deposits are not live; their sections must be
 * added here before those services are switched on for customers (the
 * Anthropic passage is in the git history of this file).
 */
export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung" page="privacy" lang="DE">
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
        aufnehmen. Ich verkaufe keine personenbezogenen Daten. Die Verbindung
        ist per TLS (HTTPS) verschlüsselt.
      </p>
      <p>
        Fragen Sie auf Instagram mit einem Stichwort nach einem Partnerlink,
        erhalten Sie ihn automatisch (Abschnitt 9). Alle anderen Nachrichten
        beantworte ich selbst. Klicks auf Partnerlinks werden
        gezählt, damit Provisionen zugeordnet werden können (Abschnitt 10).
        Für meine Profile auf Instagram, TikTok und YouTube gilt Abschnitt 12.
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Diese Website wird bei der Vercel Inc., 440 N Barranca Ave #4133,
        Covina, CA 91723, USA gehostet. Beim Aufruf der Seite verarbeitet Vercel
        technisch notwendige Verbindungsdaten in Server-Logfiles: IP-Adresse,
        Datum und Uhrzeit des Zugriffs, abgerufene Datei, übertragene
        Datenmenge, Referrer sowie Browser- und Betriebssystemkennung. Diese
        Daten werden nicht mit anderen Daten zusammengeführt. Die
        Protokolle dieser Website löscht Vercel nach spätestens einem Tag;
        zur Abwehr von Angriffen kann Vercel Verbindungsdaten nach seiner
        eigenen Datenschutzerklärung länger aufbewahren.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte
        Interesse liegt im sicheren und stabilen Betrieb der Website. Mit
        Vercel besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Die
        Übermittlung in die USA erfolgt auf Grundlage des
        Angemessenheitsbeschlusses zum EU-US Data Privacy Framework (Art. 45
        DSGVO), unter dem Vercel zertifiziert ist, ergänzend auf Grundlage der
        EU-Standard&shy;vertrags&shy;klauseln (Art. 46 Abs. 2 lit. c DSGVO).
      </p>
      <p>
        Die Seiten selbst liefert Vercel über ein weltweites Servernetz aus.
        Alles, was auf dem Server verarbeitet wird (Kontaktformular,
        automatische Antworten auf Instagram, Partnerlinks), läuft in einem
        Rechenzentrum in Frankfurt am Main.
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
        Server oder aus dem Speicher meines Hosters Vercel (Abschnitt 3)
        ausgeliefert. Es werden keine Google Fonts, keine CDN-Skripte,
        keine eingebetteten Karten oder Videos und keine externen Bilddienste
        geladen. Beim bloßen Betrachten der Seite wird Ihre IP-Adresse deshalb
        an keinen Dritten außer den Hoster übertragen.
      </p>
      <p>
        Die Filme im Abschnitt „Aktuelle Filme“ stammen von meinem
        Instagram-Konto. Mein Server lädt sie alle drei Tage von Instagram
        herunter und legt Kopien im Speicherdienst Vercel Blob ab. Ihr Browser
        lädt die Vorschaubilder über diese Website und die Videos von der
        Adresse public.blob.vercel-storage.com, beides bei Vercel. Instagram
        bzw. Meta erhält beim Ansehen keine Daten von Ihnen.
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
        jederzeit mit Wirkung für die Zukunft widerrufen; eine formlose
        Nachricht genügt.
      </p>
      <p>
        Für den Versand an mein E-Mail-Postfach wird der Dienst Resend (Plus
        Five Five, Inc., 2261 Market Street, San Francisco, CA 94114, USA) als
        Auftragsverarbeiter eingesetzt. Ein Auftragsverarbeitungsvertrag nach
        Art. 28 DSGVO liegt vor. Die Übermittlung in die USA erfolgt auf
        Grundlage des Angemessenheitsbeschlusses zum EU-US Data Privacy
        Framework, unter dem Resend zertifiziert ist, ergänzend auf Grundlage
        der EU-Standard&shy;vertrags&shy;klauseln.
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
        auszuschließen. Meta Platforms, Inc. ist unter dem EU-US Data Privacy
        Framework zertifiziert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO,
        soweit Ihre Anfrage auf einen Vertrag gerichtet ist, im Übrigen Art. 6
        Abs. 1 lit. f DSGVO. Die Nutzung ist freiwillig; Kontaktformular,
        E-Mail und Telefon stehen gleichwertig zur Verfügung.
      </p>

      <h2 id="instagram">9. Automatische Antworten auf Instagram</h2>
      <p>
        Unter einigen Beiträgen nenne ich ein Stichwort, etwa „GOLDCARD“.
        Fragen Sie in einem Kommentar, einer Story-Antwort oder einer
        Direktnachricht mit diesem Stichwort nach dem Angebot, erhalten Sie
        automatisch eine kurze Beschreibung und auf Wunsch den Link dazu
        (Abschnitt 10); unter einem Kommentar erscheint zusätzlich ein kurzer
        öffentlicher Hinweis auf die Nachricht. Alle anderen Kommentare und
        Nachrichten beantworte ich persönlich. Mein Server prüft sie nur auf
        das Stichwort und speichert sie nicht.
      </p>
      <p>
        Zu einer solchen Anfrage werden Ihre Instagram-Kennung (eine Nummer,
        die Instagram für mein Konto vergibt), gegebenenfalls Name und
        Benutzername, Ihr Kommentar oder Ihre Nachricht, die erkannte Sprache,
        meine Antwort und der Beitrag, unter dem Sie gefragt haben,
        gespeichert. Schreibt ein Konto in kurzer Zeit ungewöhnlich viele
        Nachrichten, pausiert die automatische Antwort, und ich erhalte einen
        Hinweis mit dem Namen des Kontos per WhatsApp. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt darin,
        Anfragen, die Sie mit dem Stichwort selbst auslösen, sofort und nur
        einmal zu beantworten und Missbrauch abzuwehren.
      </p>
      <p>Beteiligt sind:</p>
      <ul>
        <li>
          Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5,
          Irland, als Betreiberin von Instagram und WhatsApp. Für die
          Verarbeitung auf Instagram selbst gilt die Datenschutzrichtlinie von
          Meta; eine Übermittlung in die USA ist dabei nicht auszuschließen.
          Meta Platforms, Inc. ist unter dem EU-US Data Privacy Framework
          zertifiziert.
        </li>
        <li>
          Supabase, Inc. als Auftragsverarbeiter für die Datenbank, mit
          Serverstandort Frankfurt am Main. Name, Kennung, Kontaktangaben und
          Nachrichten werden dort nur verschlüsselt (AES-256) abgelegt; der
          Schlüssel liegt nicht bei Supabase. Soweit Supabase aus Drittländern
          auf die Systeme zugreift, geschieht dies auf Grundlage der
          EU-Standard&shy;vertrags&shy;klauseln.
        </li>
        <li>Vercel (siehe Abschnitt 3), über dessen Server die Nachrichten laufen.</li>
      </ul>
      <p>
        Mit Supabase besteht ein Auftragsverarbeitungsvertrag nach Art. 28
        DSGVO. Möchten Sie keine automatische Antwort, schreiben Sie ohne
        Stichwort; ich antworte Ihnen dann persönlich. Gleichwertig erreichen
        Sie mich per Kontaktformular, E-Mail oder Telefon.
      </p>

      <h2>10. Partnerlinks</h2>
      <p>
        Auf Instagram erhalten Sie auf Nachfrage Links zu Angeboten von
        Partnern, etwa Kreditkarten, Touren oder Flugsuchen. Sie sind als
        Werbung gekennzeichnet. Kommt über einen solchen Link ein Vertrag
        zustande, erhalte ich eine Provision; für Sie ändert sich nichts.
      </p>
      <p>
        Die Links führen zunächst über diese Website (
        <code>/go/…</code>). Dabei wird unter einer zufälligen Kennung gezählt,
        wie oft und wann der Link zuerst geöffnet wurde, und festgehalten, aus
        welcher Anfrage und über welchen Beitrag er stammt. Diese Kennung wird
        an das jeweilige Partnerprogramm (etwa financeAds, GetYourGuide oder
        Skyscanner) übergeben, damit Provisionen dem Beitrag zugeordnet werden
        können; Name oder Instagram-Kennung erhält das Partnerprogramm nicht.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte
        Interesse liegt in der Abrechnung der Provisionen. Nach der
        Weiterleitung gilt die Datenschutzerklärung des jeweiligen Anbieters,
        der dabei eigene Cookies setzen kann.
      </p>

      <h2>11. Kauf des E-Books (Tentary)</h2>
      <p>
        Die Travel Creator Roadmap und ihr kostenloser Auszug werden über die
        Plattform Tentary verkauft und ausgeliefert: Tentary GmbH,
        Frankenstraße 152, 90461 Nürnberg. Die Links auf <code>/roadmap</code>{" "}
        führen direkt zum Checkout von Tentary; diese Website selbst erhebt
        dabei keine Daten. Im Checkout geben Sie Name, E-Mail-Adresse,
        Rechnungsland und Zahlungsdaten an; Tentary und die dort eingebundenen
        Zahlungsdienstleister verarbeiten sie, um die Zahlung abzuwickeln und
        Ihnen das PDF zuzusenden. Ich erhalte Name, E-Mail-Adresse und die
        Bestelldaten, um den Vertrag zu erfüllen und meinen steuerlichen
        Pflichten nachzukommen.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertrag) sowie lit. c
        (Aufbewahrungspflichten). Für den kostenlosen Auszug gilt dasselbe für
        Name und E-Mail-Adresse. Werbliche E-Mails erhalten Sie nur, wenn Sie
        im Checkout ausdrücklich einwilligen (Art. 6 Abs. 1 lit. a DSGVO); die
        Einwilligung können Sie jederzeit widerrufen. Im Übrigen gilt die
        Datenschutzerklärung von Tentary.
      </p>

      <h2 id="social-media">12. Meine Profile in sozialen Netzwerken</h2>
      <p>
        Ich zeige meine Arbeit auf eigenen Profilen bei{" "}
        <a href={socialProfiles.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        ,{" "}
        <a href={socialProfiles.tiktok} target="_blank" rel="noopener noreferrer">
          TikTok
        </a>{" "}
        und{" "}
        <a href={socialProfiles.youtube} target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
        . Diese Erklärung gilt auch für diese Profile. Besuchen Sie eines
        davon, verarbeitet der jeweilige Anbieter Ihre Daten nach seinen
        eigenen Bedingungen, auch für Werbung und Analysen und unabhängig
        davon, ob Sie dort ein Konto haben; darauf habe ich keinen Einfluss.
        Ich selbst sehe nur, was Sie dort mit mir teilen (Kommentare,
        Erwähnungen, Nachrichten), und zusammengefasste Statistiken zur
        Reichweite meiner Beiträge, die keinen Rückschluss auf einzelne
        Personen zulassen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO;
        das berechtigte Interesse liegt darin, meine Arbeit zu zeigen und mit
        Publikum, Interessenten und Kunden zu kommunizieren.
      </p>
      <ul>
        <li>
          <strong>Instagram:</strong> Meta Platforms Ireland Limited, Merrion
          Road, Dublin 4, D04 X2K5, Irland. Für die Statistiken
          („Insights“), die Meta mir zu meinem Profil bereitstellt, sind Meta
          und ich gemeinsam verantwortlich (Art. 26 DSGVO). Meta hat in einer{" "}
          <a
            href="https://www.facebook.com/legal/terms/page_controller_addendum"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vereinbarung
          </a>{" "}
          die primäre Verantwortung dafür übernommen, auch für die Erfüllung
          Ihrer Rechte. Meta Platforms, Inc. ist unter dem EU-US Data Privacy
          Framework zertifiziert.{" "}
          <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer">
            Datenschutzrichtlinie
          </a>
        </li>
        <li>
          <strong>TikTok:</strong> TikTok Technology Limited, 10 Earlsfort
          Terrace, Dublin, D02 T380, Irland. Soweit TikTok mir Statistiken
          bereitstellt (TikTok Analytics), sind wir dafür gemeinsam
          verantwortlich; die Einzelheiten regelt TikTok in einer{" "}
          <a
            href="https://www.tiktok.com/legal/page/global/tiktok-analytics-joint-controller-addendum/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vereinbarung
          </a>
          . TikTok übermittelt Daten auch in Länder außerhalb der EU, für die
          kein Angemessenheitsbeschluss besteht.{" "}
          <a
            href="https://www.tiktok.com/legal/page/eea/privacy-policy/de"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzrichtlinie
          </a>
        </li>
        <li>
          <strong>YouTube:</strong> Google Ireland Limited, Gordon House,
          Barrow Street, Dublin 4, Irland. Google verarbeitet die Daten in
          eigener Verantwortung; Google LLC ist unter dem EU-US Data Privacy
          Framework zertifiziert.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Datenschutzerklärung
          </a>
        </li>
      </ul>
      <p>
        Ihre Rechte (Abschnitt 15) können Sie mir gegenüber und gegenüber dem
        jeweiligen Anbieter geltend machen. Am schnellsten wirkt das beim
        Anbieter selbst, denn nur er hat Zugriff auf die Daten seiner Nutzer;
        Anfragen, die bei mir eingehen, leite ich an ihn weiter.
      </p>

      <h2>13. Speicherdauer</h2>
      <p>
        Anfragen und die zugehörige Korrespondenz werden gelöscht, sobald sie
        abschließend bearbeitet sind und keine gesetzlichen
        Aufbewahrungspflichten entgegenstehen. Kommt ein Vertrag zustande,
        gelten die handels- und steuerrechtlichen Aufbewahrungsfristen (in der
        Regel sechs bis zehn Jahre, § 257 HGB, § 147 AO).
      </p>
      <p>
        Gespeicherte Anfragen von Instagram (Abschnitt 9) werden 24 Monate
        nach der letzten Nachricht automatisch gelöscht, zusammen mit den
        zugehörigen Angaben. Die Zuordnung eines Partnerlinks zur Anfrage
        entfällt mit dieser; übrig bleibt nur die anonyme Zahl der Klicks.
      </p>

      <h2>14. Pflicht zur Bereitstellung, keine automatisierte Entscheidung</h2>
      <p>
        Sie sind weder gesetzlich noch vertraglich verpflichtet,
        personenbezogene Daten bereitzustellen; ohne Angaben kann ich eine
        Anfrage jedoch nicht beantworten. Eine automatisierte
        Entscheidungsfindung einschließlich Profiling nach Art. 22 DSGVO findet
        nicht statt. Die automatische Antwort auf Instagram sendet nur den
        Link, nach dem Sie gefragt haben.
      </p>

      <h2 id="rights">15. Ihre Rechte</h2>
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
        widersprechen. Ich verarbeite die Daten dann nicht mehr, es sei denn,
        ich kann zwingende schutzwürdige Gründe nachweisen, die Ihre
        Interessen überwiegen, oder die Verarbeitung dient der Geltendmachung,
        Ausübung oder Verteidigung von Rechtsansprüchen.
      </p>
      <p>
        Für die Ausübung Ihrer Rechte genügt eine formlose Nachricht an{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>. Ich antworte
        innerhalb eines Monats (Art. 12 Abs. 3 DSGVO).
      </p>

      <h2>16. Beschwerderecht</h2>
      <p>
        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
        beschweren, insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts,
        Ihres Arbeitsplatzes oder des mutmaßlichen Verstoßes (Art. 77 DSGVO).
        Zuständig für mich ist:
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

      <h2>17. Stand und Sprachfassungen</h2>
      <p>
        Stand: Oktober 2026. Diese Erklärung beschreibt den technischen Stand
        dieser Website und wird angepasst, sobald sich eingesetzte Dienste
        ändern. Sie liegt auch auf Englisch und Türkisch vor; maßgeblich ist
        die deutsche Fassung.
      </p>
    </LegalPage>
  );
}
