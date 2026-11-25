/**
 * /punkte — Das Punkte-System and its free lead magnet, the Punkte-Check.
 *
 * Tentary sells and delivers both; this site only links to them. Every figure
 * the page shows is one the Punkte-Check PDF states with its source
 * (Stand 24.11.2026). Change a figure there first, then here — the page must
 * never claim more than the PDF can prove.
 *
 * German only, on purpose: the product, its sources and the programmes it
 * explains (Payback, Miles & More, Amex Germany) are German. An English or
 * Turkish page would sell a PDF its reader cannot use. The menu label is in
 * all three languages (`nav_punkte`); the page itself is `lang="de"`.
 */
export const punkte = {
  /** The free Punkte-Check on Tentary (0 €, digital download). */
  check: "https://atillabarbarossa.mytentary.com/p/9MUtso",
  /**
   * The paid Punkte-System. Not on sale yet: while this is null the page shows
   * "Kauf-Link folgt" and sends visitors to the free check and to Instagram.
   * Set the Tentary checkout URL here when it goes live (and its price below).
   */
  checkout: null as string | null,
  /** Final price in euro as the checkout charges it; null until it is set. */
  price: null as number | null,
  /** The date the PDF's sources were read. */
  asOf: "24.11.2026",
} as const;

export const punkteCopy = {
  adLabel: "Werbung · eigenes Produkt",

  heroEyebrow: "Gratis-PDF · Punkte-Check",
  heroTitle1: "Du sammelst Punkte.",
  heroTitle2: "Und verschenkst sie trotzdem.",
  heroLead:
    "Der kostenlose Punkte-Check zeigt dir die 10 Stellen, an denen im Alltag Punkte und Meilen verloren gehen. Und wie du sie dir zurückholst. In 5 Minuten gelesen.",
  heroCta: "Punkte-Check gratis holen",
  heroSecondary: "Was drinsteht",
  heroFacts: "11 Seiten · PDF · 0 € · Stand 24.11.2026",
  heroTrust: ["Jede Zahl mit Quelle", "Keine Affiliate-Links", "Kein Abo"],
  coverAlt: "Titelseite des Punkte-Check: eine Geldbörse, aus der Punkte zu einem Flugzeug fliegen",

  trapsEyebrow: "Was drinsteht",
  trapsTitle: "Die 10 Punkte-Fallen",
  trapsIntro: "Hak später ab, was du schon richtig machst. Die meisten Tipps kosten dich keine 5 Minuten.",
  traps: [
    "Coupons nicht aktiviert",
    "Im Haushalt getrennt gesammelt",
    "Alte Payback-Landkarte",
    "DeutschlandCard-Punkte vergessen",
    "Payback-Punkte verfallen still",
    "Zu früh in Meilen umgewandelt",
    "Kreditkartenzinsen bezahlt",
    "Kartenpunkte in Hotelpunkte getauscht",
    "Prämienflug mit hoher Zuzahlung",
    "Kartenvorteile nie aktiviert",
  ],
  trapsBonus: "Dazu: ein Mini-Rechner für deine Einlösung und eine 10-Minuten-Checkliste zum Abhaken.",

  proofEyebrow: "Drei Beispiele aus dem Check",
  proofTitle: "Kleine Fehler, große Unterschiede",
  proofNote: "Bonusprogramme ändern ihre Regeln oft. Alle Quellen mit Abrufdatum stehen im PDF.",

  videoEyebrow: "So erkläre ich im Punkte-System",
  videoTitle: "Gleiche Meilen. Ganz anderer Preis.",
  videoIntro:
    "Ein Trick, eine Minute, mit Quellen. So sehen die kurzen Animationsvideos im Punkte-System aus.",
  videoPlay: "Video abspielen (60 Sekunden, mit Ton)",
  videoCaption: "Beispiel aus dem Modul Prämienflüge · Rechenbeispiel mit angenommenen Zahlen · Quellen im Video",

  stepsEyebrow: "So bekommst du ihn",
  stepsTitle: "In drei Schritten zum Check",
  steps: [
    {
      title: "Gratis holen",
      text: "Über Tentary, meinen Shop für digitale Produkte. 0 €, kein Abo.",
    },
    {
      title: "5 Minuten lesen",
      text: "10 Tipps mit Grafiken und Rechenbeispielen. Ohne Fachchinesisch.",
    },
    {
      title: "Checkliste abhaken",
      text: "10 Minuten, und du weißt, wo deine Punkte bisher liegen bleiben.",
    },
  ],
  stepsNote: "Werbe-E-Mails bekommst du nur, wenn du das separat ankreuzt und bestätigst.",

  systemBadge: "Bald · Early Access",
  systemEyebrow: "Das Punkte-System",
  systemTitle: "Vom Punktesammeln zur Prämie. Schritt für Schritt.",
  systemIntro:
    "Der Check zeigt dir, wo du Punkte verlierst. Das Punkte-System zeigt dir Schritt für Schritt, wie du sie für Flüge und Hotelnächte einsetzt.",
  systemPreview:
    "Vorschau aus dem Punkte-System: Payback-Weg, Amex-Weg, Starthilfe, Punkte-Rechner und ein Animationsvideo. Weitere Wege sind in Arbeit.",
  waysTitle: "5 Wege: wähl, was zu dir passt",
  ways: [
    { title: "Payback", text: "Punkte aus dem Wocheneinkauf: Coupons, Partner, Umwandlung zur richtigen Zeit." },
    { title: "Amex", text: "Membership Rewards übertragen: zu welchen Airlines, wann, und wann besser nicht." },
    { title: "Türkei-Flüge", text: "Miles&Smiles für Flüge nach Istanbul und in die Türkei, und wann sich Meilen lohnen." },
    { title: "Hotels", text: "Hotelprogramme, Status und Direktbuchung, ohne Punkte unter Wert zu tauschen." },
    { title: "Vielflieger", text: "Allianzen, Status und Prämienflüge mit niedriger Zuzahlung." },
  ],
  featuresTitle: "Dazu im Paket",
  features: [
    { title: "Einrichten in 30 Minuten", text: "Alle Konten anlegen und verbinden, mit Screenshots." },
    { title: "Punkte-Rechner", text: "Trag deine Ausgaben ein und sieh, wann du am Ziel bist." },
    { title: "Echte Buchungen", text: "Meine eigenen Prämienflüge, mit Meilen, Zuzahlung und Wert pro Meile." },
    { title: "Animationsvideos", text: "Die wichtigsten Tricks in 60 Sekunden erklärt." },
    { title: "12 Monate Updates", text: "Programme ändern sich ständig. Du bekommst die neuen Regeln." },
  ],
  systemSoonLabel: "Kauf-Link folgt zum Start",
  systemSoonText: "Preis und Starttermin nenne ich, sobald alles fertig ist. Auf Instagram sage ich zuerst Bescheid.",
  systemBuy: "Punkte-System kaufen",
  systemFollow: "Auf Instagram folgen",
  systemMeanwhile: "Bis dahin: Gratis-Check holen",

  authorEyebrow: "Von wem das kommt",
  authorText:
    "Ich bin Travel Creator aus Berlin und zeige auf Instagram Reisen, Hotels und Flüge. Im Punkte-Check steht, was ich selbst nutze, mit einer Quelle für jede Zahl.",
  statFollowers: "Follower auf Instagram",
  statDach: "Publikum aus DACH",

  faqEyebrow: "Fragen",
  faqTitle: "Kurz beantwortet",
  faq: [
    {
      q: "Was kostet der Punkte-Check?",
      a: "Nichts. 0 €, kein Abo. Du holst ihn über Tentary, meinen Shop für digitale Produkte. Werbe-E-Mails bekommst du nur, wenn du das separat ankreuzt und bestätigst.",
    },
    {
      q: "Brauche ich dafür eine Kreditkarte?",
      a: "Nein. Viele Tipps drehen sich um Payback und funktionieren ohne Kreditkarte. Zu Kreditkarten steht auch drin, was dich Teilzahlungszinsen kosten können.",
    },
    {
      q: "Ist das Finanzberatung?",
      a: "Nein. Ich erkläre die Regeln der Bonusprogramme zum angegebenen Stand. Programme ändern ihre Regeln oft: Prüf vor jeder Entscheidung die aktuellen Bedingungen.",
    },
    {
      q: "Verdienst du an Empfehlungen?",
      a: "Ich arbeite mit American Express zusammen (bezahlte Partnerschaft). Im Punkte-Check gibt es keine Affiliate-Links. Kein Bonusprogramm hat ihn beauftragt oder geprüft.",
    },
    {
      q: "Wann startet das Punkte-System?",
      a: "Bald. Einen festen Termin nenne ich erst, wenn alles fertig ist. Auf Instagram (@atillabarbarossa) sage ich zuerst Bescheid.",
    },
  ],

  finalTitle: "Fang mit dem Check an.",
  finalText: "5 Minuten lesen, 10 Minuten abhaken. Kostenlos.",

  transparency:
    "Transparenz: Ich arbeite mit American Express zusammen (bezahlte Partnerschaft). Keine Affiliate-Links. Keine Finanz- oder Anlageberatung. Bonusprogramme ändern ihre Regeln oft; prüf vor jeder Entscheidung die aktuellen Bedingungen. Alle genannten Marken gehören ihren Inhabern.",

  barLabel: "Punkte-Check · 0 €",
  barButton: "Gratis holen",
  newTab: "öffnet Tentary in neuem Tab",
} as const;

/**
 * The three proof cards. Each figure is taken from the Punkte-Check with the
 * source it cites there; `max` scales the bars within one card.
 */
export const punkteProof = [
  {
    figure: "×10",
    title: "10fach-Coupon",
    text: "Punkte für 100 € Einkauf bei einem Payback-Partner.",
    unit: "Punkte",
    max: 500,
    rows: [
      { label: "ohne Coupon", value: 50, display: "50", tone: "muted" },
      { label: "mit 10fach-Coupon", value: 500, display: "500", tone: "strong" },
    ],
    source: "Quellen: PAYBACK-Teilnahmebedingungen, Monsterdealz (08/2026)",
  },
  {
    figure: "~1,4 ct",
    title: "Kartenpunkte",
    text: "Ungefährer Wert eines Amex-Punkts, je nachdem, wohin du ihn tauschst.",
    unit: "Cent",
    max: 1.4,
    rows: [
      { label: "in Hotelpunkten", value: 0.55, display: "0,4–0,7 ct", tone: "muted" },
      { label: "in Airline-Meilen", value: 1.4, display: "~1,4 ct", tone: "strong" },
    ],
    source: "Quelle: meilenoptimieren.com, Referenzwerte vom 30.08.2026",
  },
  {
    figure: "+500 €",
    title: "Zuzahlung",
    text: "Business Europa → Nordamerika mit Miles & More, einfache Strecke, gleiche Meilen.",
    unit: "Euro",
    max: 800,
    rows: [
      { label: "Partner-Airlines", value: 302, display: "72–302 €", tone: "strong" },
      { label: "Lufthansa Group", value: 800, display: "ca. 800 €+", tone: "muted" },
    ],
    source: "Quelle: meilenoptimieren.com, Vergleich vom 19.04.2026",
  },
] as const;
