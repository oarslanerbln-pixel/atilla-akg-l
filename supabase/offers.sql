-- Partner (affiliate) offers. Run in the Supabase SQL Editor after every change; it is idempotent.
--
-- tracking_url: the network's link. {click_id} is replaced with our click id where the network
--   takes a sub id (FinanceAds &subid=, GetYourGuide &cmp=, Impact ?subId1=). Letters and digits only.
-- keywords: lower case. Triggers the offer in a comment, a story reply or a DM that asks for it: the
--   keyword alone or with request words ("Goldcard bitte"; requestedKeywords in src/lib/concierge/keywords.ts).
--   Offers win over the tour keywords, so keep them specific: "Gold" under a sunset is praise, "Goldcard" a request.
-- media_codes: limits the keywords to the comments under these posts or reels, by the code in their
--   link (instagram.com/reel/<code>/). Empty (the default): everywhere. Needs migration 20261027000000.
-- pitch: short and factual, in the programme's approved wording. No fees, interest or promises.
-- GetYourGuide activity: any activity URL + ?partner_id=RTQEAHP&cmp={click_id}; no short link needed.

-- The inactive sample row from the first seed.
delete from public.affiliate_offers where id = 'amex';

insert into public.affiliate_offers (id, network, name, pitch, tracking_url, keywords, active) values
  ('amex-gold',
   'financeads',
   '{"de": "American Express Gold Card", "en": "American Express Gold Card", "tr": "American Express Gold Card"}',
   '{"de": "Die American Express Gold Card mit Membership Rewards (für Wohnsitz in Deutschland) – alle Vorteile, Konditionen und den Antrag findest du direkt bei American Express.",
     "en": "The American Express Gold Card with Membership Rewards (for residents of Germany) – all benefits, terms and the application directly at American Express.",
     "tr": "Membership Rewards''lı American Express Gold Card (Almanya''da ikamet edenler için) – tüm avantajlar, koşullar ve başvuru doğrudan American Express''te."}',
   'https://financeads.net/tc.php?t=66144C140128910T&subid={click_id}',
   '{goldcard}',
   true),

  ('amex-platinum',
   'financeads',
   '{"de": "American Express Platinum Card", "en": "American Express Platinum Card", "tr": "American Express Platinum Card"}',
   '{"de": "Die American Express Platinum Card mit Membership Rewards (für Wohnsitz in Deutschland), mit Zugang zu Flughafen-Lounges weltweit. Alle Vorteile, Konditionen und den Antrag findest du direkt bei American Express.",
     "en": "The American Express Platinum Card with Membership Rewards (for residents of Germany), with access to airport lounges worldwide. All benefits, terms and the application directly at American Express.",
     "tr": "Membership Rewards''lı American Express Platinum Card (Almanya''da ikamet edenler için), dünya genelinde havalimanı lounge erişimiyle. Tüm avantajlar, koşullar ve başvuru doğrudan American Express''te."}',
   'https://financeads.net/tc.php?t=66144C140129719T&subid={click_id}',
   '{platinum,platin}',
   true),

  -- Paid per install through Adjust; the short link carries no sub id.
  ('gyg-app',
   'getyourguide',
   '{"de": "GetYourGuide App", "en": "the GetYourGuide app", "tr": "GetYourGuide uygulaması"}',
   '{"de": "Touren, Tickets und Aktivitäten weltweit – mit der GetYourGuide App buchst du unterwegs und hast deine Tickets direkt auf dem Handy.",
     "en": "Tours, tickets and activities worldwide – with the GetYourGuide app you book on the go and keep your tickets on your phone.",
     "tr": "Dünya genelinde turlar, biletler ve aktiviteler – GetYourGuide uygulamasıyla yolda rezervasyon yapar, biletlerinizi telefonunuzda taşırsınız."}',
   'https://gyg.me/atillabarbarossa-app',
   '{getyourguide}',
   true),

  ('gyg-berlin-gendarmenmarkt',
   'getyourguide',
   '{"de": "Berlin: Verborgenes rund um den Gendarmenmarkt", "en": "Berlin: hidden gems around Gendarmenmarkt", "tr": "Berlin: Gendarmenmarkt çevresinin gizli köşeleri"}',
   '{"de": "Geführter Rundgang: Verborgenes rund um den Gendarmenmarkt in Berlin. Termine, Preise und Buchung direkt bei GetYourGuide.",
     "en": "Guided walk through the hidden corners around Berlin''s Gendarmenmarkt. Dates, prices and booking directly on GetYourGuide.",
     "tr": "Berlin''de Gendarmenmarkt çevresinin gizli köşelerinde rehberli yürüyüş. Tarihler, fiyatlar ve rezervasyon doğrudan GetYourGuide''da."}',
   'https://www.getyourguide.de/berlin-l17/berlin-verborgenes-rund-um-den-gendarmenmarkt-gefuhrter-rundgang-t951089/?partner_id=RTQEAHP&cmp={click_id}',
   '{rundgang}',
   true),

  -- Deep link through Impact (u=): every destination from Germany, return, economy. No dates in the
  -- link, so it never goes stale: Skyscanner opens on the coming month. The bare rE1bJQ link was a
  -- saved search from BER, September to October 2026.
  ('skyscanner',
   'impact',
   '{"de": "Skyscanner", "en": "Skyscanner", "tr": "Skyscanner"}',
   '{"de": "Günstige Flüge zu allen Zielen – auf Skyscanner siehst du die aktuellen Preise für deine Reisedaten.",
     "en": "Cheap flights to every destination – Skyscanner shows the current prices for your travel dates.",
     "tr": "Tüm destinasyonlara uygun uçuşlar – Skyscanner''da seyahat tarihleriniz için güncel fiyatları görürsünüz."}',
   'https://skyscanner.pxf.io/rE1bJQ?subId1={click_id}&u=https%3A%2F%2Fwww.skyscanner.de%2Ftransport%2Ffluge-von%2Fde%2F%3Fadultsv2%3D1%26cabinclass%3Deconomy%26rtn%3D1',
   '{skyscanner}',
   true),

  -- Atilla's own e-book, not a partner's: network 'own' sends the "Werbung in eigener Sache" notice
  -- instead of the commission one (copy.ts, ownProductLink). The link goes to the site's page,
  -- which carries the price and both Tentary checkouts (src/lib/roadmap.ts), so a price change
  -- never has to be made here. "E-Book" splits into "e" and "book" (keywords.ts), and "book"
  -- would answer "Book please" meant for a tour: the keywords are ROADMAP and EBOOK.
  ('roadmap',
   'own',
   '{"de": "The Travel Creator Roadmap", "en": "The Travel Creator Roadmap", "tr": "The Travel Creator Roadmap"}',
   '{"de": "Das E-Book von Atilla Barbarossa: Pitch-Vorlagen, Hotel-Strategie und der Weg von kostenlosen Luxusnächten zu bezahlten Kooperationen.",
     "en": "Atilla Barbarossa''s e-book (in German): pitch templates, hotel strategy and the way from free luxury nights to paid collaborations.",
     "tr": "Atilla Barbarossa''nın e-kitabı (Almanca): pitch şablonları, otel stratejisi ve ücretsiz lüks gecelerden ücretli iş birliklerine giden yol."}',
   'https://atillabarbarossa.com/roadmap',
   '{roadmap,ebook}',
   true)

on conflict (id) do update set
  network = excluded.network,
  name = excluded.name,
  pitch = excluded.pitch,
  tracking_url = excluded.tracking_url,
  keywords = excluded.keywords,
  active = excluded.active;

-- Offers that answer only under particular reels. The Priority Pass reel of 28 Sep 2026 asks for
-- "LOUNGE" in the comments; elsewhere "Lounge" means a hotel's or an airport's, so the word is
-- limited to that reel. Same card and link as amex-platinum, counted separately.
insert into public.affiliate_offers (id, network, name, pitch, tracking_url, keywords, media_codes, active) values
  ('amex-platinum-lounge',
   'financeads',
   '{"de": "American Express Platinum Card", "en": "American Express Platinum Card", "tr": "American Express Platinum Card"}',
   '{"de": "Die American Express Platinum Card mit Membership Rewards (für Wohnsitz in Deutschland), mit Zugang zu Flughafen-Lounges weltweit. Alle Vorteile, Konditionen und den Antrag findest du direkt bei American Express.",
     "en": "The American Express Platinum Card with Membership Rewards (for residents of Germany), with access to airport lounges worldwide. All benefits, terms and the application directly at American Express.",
     "tr": "Membership Rewards''lı American Express Platinum Card (Almanya''da ikamet edenler için), dünya genelinde havalimanı lounge erişimiyle. Tüm avantajlar, koşullar ve başvuru doğrudan American Express''te."}',
   'https://financeads.net/tc.php?t=66144C140129719T&subid={click_id}',
   '{lounge}',
   '{Dd1hMBzt3q7}',
   true)

on conflict (id) do update set
  network = excluded.network,
  name = excluded.name,
  pitch = excluded.pitch,
  tracking_url = excluded.tracking_url,
  keywords = excluded.keywords,
  media_codes = excluded.media_codes,
  active = excluded.active;
