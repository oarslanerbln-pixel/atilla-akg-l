-- SAMPLE DATA. Replace tours, prices and guide numbers with Atilla's real ones before going live.

insert into public.tours
  (id, name, summary, region, duration_hours, price_per_person_eur, child_price_eur, deposit_percent,
   includes, excludes, meeting_point, meeting_point_url)
values
(
  'istanbul-bosphorus-golden-hour',
  '{"de": "Bosporus zur goldenen Stunde", "en": "Bosphorus Golden Hour", "tr": "Altın Saatte Boğaz"}',
  '{"de": "Private Bootsfahrt bei Sonnenuntergang zwischen Europa und Asien, mit Stopp in Kuzguncuk und türkischem Meze-Dinner.",
    "en": "Private sunset cruise between Europe and Asia, with a stroll through Kuzguncuk and a Turkish meze dinner.",
    "tr": "Avrupa ile Asya arasında gün batımında özel tekne turu, Kuzguncuk yürüyüşü ve meze akşam yemeği."}',
  'Istanbul', 4, 145, 95, 30,
  '["Private boat", "Local guide", "Meze dinner", "Hotel pick-up (European side)"]',
  '["Alcoholic drinks", "Tips"]',
  'Kabataş Pier', 'https://maps.google.com/?q=Kabatas+Iskelesi'
),
(
  'cappadocia-sunrise-valleys',
  '{"de": "Kappadokien: Sonnenaufgang & Täler", "en": "Cappadocia Sunrise & Valleys", "tr": "Kapadokya: Gün Doğumu ve Vadiler"}',
  '{"de": "Balloon-Watching bei Sonnenaufgang, Wanderung durch das Rosental, unterirdische Stadt und Mittagessen bei einer Familie in Ürgüp.",
    "en": "Sunrise balloon watching, a hike through Rose Valley, an underground city and lunch with a local family in Ürgüp.",
    "tr": "Gün doğumunda balon izleme, Güllüdere yürüyüşü, yeraltı şehri ve Ürgüp''te bir aile sofrasında öğle yemeği."}',
  'Cappadocia', 8, 190, 120, 30,
  '["Local guide", "Transfers", "Lunch", "Entrance fees"]',
  '["Balloon flight", "Tips"]',
  'Hotel pick-up in Göreme or Ürgüp', null
),
(
  'ephesus-private-heritage',
  '{"de": "Ephesos privat", "en": "Ephesus Private Heritage", "tr": "Özel Efes Turu"}',
  '{"de": "Ephesos vor den Tagesgruppen, Terrassenhäuser, Haus der Maria und Weinprobe in Şirince.",
    "en": "Ephesus ahead of the day crowds, the Terrace Houses, the House of Virgin Mary and a wine tasting in Şirince.",
    "tr": "Kalabalıktan önce Efes, Yamaç Evler, Meryem Ana Evi ve Şirince''de şarap tadımı."}',
  'Izmir / Selçuk', 7, 175, 110, 30,
  '["Licensed local guide", "Entrance fees", "Wine tasting", "Transfers from Kuşadası or Selçuk"]',
  '["Lunch", "Tips"]',
  'Hotel pick-up in Kuşadası or Selçuk', null
);

insert into public.guides (name, whatsapp, languages, regions) values
  ('Sample Guide Istanbul', '900000000001', '{de,en,tr}', '{Istanbul}'),
  ('Sample Guide Cappadocia', '900000000002', '{en,tr}', '{Cappadocia}');

-- One departure per tour per day for the next 90 days.
insert into public.departures (tour_id, starts_at, capacity, guide_id)
select t.id,
       ((current_date + g)::timestamp + t.start_time) at time zone 'Europe/Istanbul',
       t.capacity,
       (select id from public.guides where t.region = any (regions) limit 1)
from (values
  ('istanbul-bosphorus-golden-hour', time '17:00', 10, 'Istanbul'),
  ('cappadocia-sunrise-valleys',     time '05:30', 8,  'Cappadocia'),
  ('ephesus-private-heritage',       time '08:00', 8,  'Izmir / Selçuk')
) as t (id, start_time, capacity, region)
cross join generate_series(1, 90) as g;
