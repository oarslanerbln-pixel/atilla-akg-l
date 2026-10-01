# SEO & GEO Rehberi – atillabarbarossa.com ve sosyal medya

**Durum tarihi: 30 Eylül 2026.** SEO: Google/Bing'de bulunmak. GEO (Generative Engine
Optimization): ChatGPT, Perplexity, Google AI Overviews/AI Mode, Gemini ve Copilot gibi
yapay zekâ motorlarının Atilla'yı doğru tanıması, doğru anlatması ve siteyi kaynak göstermesi.
İkisinin temeli aynı: **her yerde aynı kimlik, aynı gerçekler, okunabilir metin.**

Koddaki kurallar `CLAUDE.md` → "SEO & GEO" bölümündedir. Bu dosya ekip içindir.

---

## 1. Sitede ne değişti?

| Önce | Şimdi | Neden önemli |
|---|---|---|
| İngilizce ve Türkçe metin yalnızca tarayıcıda, dil düğmesiyle görünüyordu; Google ve yapay zekâ motorları sadece Almancayı görüyordu. | Her dilin kendi adresi var: `/` (DE), `/en`, `/tr`. Sunucu sayfayı o dilde üretir, `<html lang>` doğru, sayfalar birbirini `hreflang` ile gösterir. | İngilizce arayan bir turizm kurumu `/en`'i, Türkçe arayan biri `/tr`'yi bulur. ChatGPT'nin kullandığı Bing, `lang` bilgisine bakar. |
| `/social-media` (paket sayfası) gizliydi: noindex, sitede linki yok. | Arama motorlarına açık, üç dilde (`/social-media`, `/social-media/en`, `/social-media/tr`), "Leistungen" bölümünden ve footer'dan link alıyor. Gönderilmiş `?lang=en/tr` linkleri aynen çalışıyor. Fiyat yine yok. | "Social Media Betreuung Hotel", "hotel social media management" gibi aramalarda bulunabilir. |
| Başlık ve açıklama İngilizce ve genel ("Visual Storytelling"), sayfa ise Almanca. | Her dilde, arama niyetine göre yazılmış başlık ve açıklama; rakamlar (306.000, %86) otomatik dolduruluyor. | Arama sonucunda tıklanma oranı ve doğru eşleşme. |
| Ana sayfada 3 tane `h1`, etiketler (ör. "SELECTED PORTFOLIO") başlık olarak işaretliydi. | Sayfa başına tek `h1` ("Atilla Barbarossa"), düzgün h2 → h3 sırası. | Motorlar sayfanın neyle ilgili olduğunu başlık yapısından okur. |
| Yapılandırılmış veri: kişi + partner listesi. | WebSite, Person (fotoğraf, Berlin, dil, uzmanlık, Instagram/TikTok/YouTube bağlantıları, hizmet kataloğu), ProfilePage, FAQPage, marka listesi, sosyal medya hizmeti + 3 paket, e-kitap (Book/Product, 49 €), breadcrumb. | Google Bilgi Grafiği ve yapay zekâ motorları "Atilla Barbarossa = bu kişi, bu işi yapıyor, bu profiller onun" bağlantısını kurar. |
| Yapay zekânın alıntılayabileceği tam cümle yoktu (rakamlar sayaçlarda, markalar kayan bantta). | Ana sayfada 3 dilde 8 soruluk **SSS bölümü** ("Atilla Barbarossa kimdir?", "Hangi markalarla çalıştı?", "Kitlesi kim?", "Ne kadar tutar?"…). | Yapay zekâ motorları tek başına anlamlı cümleleri alıntılar. Her cevap Atilla'nın adını içerir. |
| `/llms.txt` kısa bir özetti. | Sayfalar (3 dil), kitle rakamları, partnerler, markalar, hizmetler, paketler, SSS ve iletişim. | Bazı yapay zekâ tarayıcıları bu dosyayı doğrudan okur. |
| `robots.txt` Impressum/Datenschutz'u engelliyordu (bu yüzden "noindex" hiç okunamıyordu). | Yasal sayfalar taranabilir ama noindex; `/go/` (partner linkleri, tıklama sayar) engelli. Tüm yapay zekâ tarayıcılarına izin var. | Doğru teknik uygulama; botlar partner tıklama sayılarını şişirmez. |
| Sitemap: 2 adres. | 7 adres + dil alternatifleri. | Yeni sayfalar hızlı keşfedilir. |
| 404 sayfası yoktu (varsayılan). | Markalı, üç dilli 404. | |

**Rakamlar tek yerde:** Instagram/TikTok/YouTube takipçi sayıları ve demografi
`src/lib/site.ts` → `audience` içinde. Bir sayı değişince **sadece orayı** güncelleyin;
istatistik bölümü, SSS, başlık açıklamaları, yapılandırılmış veri ve `/llms.txt` birlikte
güncellenir. (Hero'daki "306.000" cümlesi `translations.ts` içinde `hero_value`'da ayrıca
yazılı; onu da unutmayın.)

---

## 2. Yayından sonra bir kerelik yapılacaklar (~1 saat)

1. **Google Search Console** (search.google.com/search-console)
   - "Alan adı" mülkü ekleyin; doğrulama DNS TXT kaydıyla (alan adının yönetildiği yerde,
     ör. Vercel → Domains). Alternatif: "URL öneki" + HTML etiketi → etiketteki `content`
     değerini Vercel'de `GOOGLE_SITE_VERIFICATION` olarak kaydedip yeniden deploy edin.
   - Sitemaps → `https://atillabarbarossa.com/sitemap.xml` gönderin.
   - URL Denetimi → `/`, `/en`, `/tr`, `/social-media`, `/social-media/en`, `/social-media/tr`
     için "Dizine eklenmesini iste".
2. **Bing Webmaster Tools** (bing.com/webmasters) – **GEO için şart:** ChatGPT arama ve
   Copilot büyük ölçüde Bing dizinini kullanır.
   - "Google Search Console'dan içe aktar" ile tek tıkla kurulur (ya da `BING_SITE_VERIFICATION`).
   - Sitemap'i orada da gönderin.
3. **Kontrol testleri**
   - search.google.com/test/rich-results ve validator.schema.org: ana sayfa, `/en`,
     `/social-media`, `/roadmap`. Hata olmamalı.
   - Not: Google, SSS zengin sonuçlarını (açılır sorular) artık yalnızca resmi kurum ve sağlık
     sitelerinde gösteriyor. İşaretleme yine de doğru ve yapay zekâ motorları için değerli.
     E-kitap için fiyatlı ürün görünümü mümkündür.
   - Link önizlemesi: developers.facebook.com/tools/debug ile `/en` ve `/social-media/tr`.

---

## 3. Kimlik tutarlılığı – GEO'nun temeli

Yapay zekâ motorları bir kişiyi, farklı sitelerdeki bilgileri **eşleştirerek** tanır. Ad, tanım,
fotoğraf ve link her yerde aynıysa eşleşme kolaylaşır.

- **Ad:** Her yerde "Atilla Barbarossa". "Atilla Akgül" yalnızca künye ve sözleşmelerde
  (sitenin yapılandırılmış verisinde "alternatif ad" olarak zaten var).
- **Fotoğraf:** Tüm profillerde aynı portre (sitede `public/roadmap/atilla.webp` kullanılıyor).
- **Link:** Her profilin web sitesi alanı `https://atillabarbarossa.com`. Link-in-bio aracı
  kullanılıyorsa ilk link site olmalı.
- **Tanım cümlesi:** Aşağıdaki "Hazır metinler"den; profillerde, basın metinlerinde, partner
  sayfalarında, sunumlarda aynı cümle.
- **Yeni profil** (LinkedIn, Vimeo, IMDb…) açılırsa `src/lib/site.ts` → `socialProfiles`'a
  ekleyin; site onu otomatik olarak yapılandırılmış veriye (`sameAs`) koyar.
- **LinkedIn:** Otel pazarlama müdürleri ve turizm kurumları orada. Başlık önerisi:
  "Travel Filmmaker & Creative Director · Hotels, Destinations & Travel Brands · Berlin/Istanbul".
- **Partner sayfalarından link:** Visit Malta, Go Türkiye, Visit Kazakhstan, Visit Romania ve
  otellerden, yayımlanan iş birliğinin (reel/film) linkini alın ve `src/lib/partners.ts`'de ilgili
  partnere `url` olarak ekleyin. Kartta "Zum Beitrag" linki çıkar, yapılandırılmış veride
  "Atilla'nın bu kurum için yaptığı iş" olarak görünür. Onlardan da siteye bir link istemek,
  en güçlü güven sinyalidir.
- **Wikidata / Wikipedia:** Kendi hakkınızda kayıt açmak, bağımsız kaynaklarda (basın,
  röportaj) anıldıktan sonra anlamlıdır. Önce basın.

---

## 4. Instagram (306.000 takipçi)

**Ad alanı** (Instagram aramasında aranır, en fazla 30 karakter, 14 günde 2 kez değişir):

```
Atilla Barbarossa | Travel
```

**Biyografi** (ana kitle DACH olduğu için Almanca önerilir; 150 karakter sınırına uygun):

```
Reisefilmer & Creative Director 🎬
Hotels · Destinationen · Travel-Brands
Berlin ⇄ Istanbul · DE/EN/TR
👇 Kooperationen & Mediadaten
```

İngilizce alternatif:

```
Travel filmmaker & creative director 🎬
Hotels · Destinations · Travel brands
Berlin ⇄ Istanbul · DE/EN/TR
👇 Collaborations & media kit
```

Türkçe alternatif:

```
Seyahat film yapımcısı & kreatif direktör 🎬
Oteller · Destinasyonlar · Seyahat markaları
Berlin ⇄ İstanbul · DE/EN/TR
👇 İş birlikleri & medya kiti
```

**Linkler** (Instagram 5 link destekler): 1) `atillabarbarossa.com` 2) `atillabarbarossa.com/social-media`
3) `atillabarbarossa.com/roadmap`.

**Ayarlar**
- Hesap gizliliği → "Herkese açık fotoğraf ve videoların arama motoru sonuçlarında görünmesine
  izin ver" ayarı (profesyonel hesaplarda bulunur) **açık** olmalı; böylece reels Google ve
  Bing sonuçlarında da çıkar.
- Her reel'de otomatik altyazı açık; fotoğraflarda Gelişmiş ayarlar → Erişilebilirlik →
  alternatif metin yazın ("Novotel Bosphorus Istanbul, Dachterrasse mit Blick auf das Goldene Horn").
- İletişim düğmeleri: e-posta `a@barbarossafilms.de`, WhatsApp.

**Instagram araması neyi okur:** ad alanı, kullanıcı adı, açıklamanın metni (hashtag'lerden
daha önemli), videodaki yazı ve konuşma (otomatik altyazıdan), konum etiketi.

**Açıklama şablonu – DE**

```
Hoteltipp in [Stadt]: [Hotelname] @[hotelaccount] 🏨
[1–2 Sätze: was es besonders macht – Lage, Zimmer, Kulinarik –, mit Viertel und Stadt.]
📍 [Viertel], [Stadt], [Land]
💬 Fragen zu Preisen & Buchung? Kommentiere „INFO“.
#hoteltipp #[stadt] #[land]reise #luxusreisen #atillabarbarossa
```

**EN**

```
Where to stay in [city]: [hotel name] @[hotelaccount] 🏨
[1–2 sentences on what makes it special, naming the neighbourhood and city.]
📍 [Neighbourhood], [City], [Country]
💬 Questions on rates & booking? Comment "INFO".
#hoteltip #[city] #[country]travel #luxurytravel #atillabarbarossa
```

**TR**

```
[Şehir]'de nerede kalınır: [Otel adı] @[otelhesabı] 🏨
[1–2 cümle: semt ve şehir adıyla, oteli özel kılan ne?]
📍 [Semt], [Şehir], [Ülke]
💬 Fiyat ve rezervasyon için yoruma "fiyat" yaz.
#oteltavsiyesi #[şehir] #[ülke]gezisi #lükstatil #atillabarbarossa
```

"info", "preis", "fiyat", "tour" gibi kelimeler Instagram otomasyonunu tetikler
(`IG_COMMENT_KEYWORDS`, bkz. `docs/automation-handover.md`).

**Kurallar:** İlk satırda otel/destinasyon adı + şehir. 3–5 hashtag (30 değil). Otelin ve
turizm kurumunun hesabını etiketleyin, konum ekleyin. Kendi hashtag'iniz her gönderide:
`#atillabarbarossa`.

**Öne çıkanlar (Highlights):** "Hotels", "Destinationen", "Kooperation" (son hikâyede site
linki ve "Mediadaten auf Anfrage").
**Sabitlenmiş 3 gönderi:** Novotel reel'i (559.316 hesap), bir destinasyon serisi, "benimle
çalışın" reel'i (sonunda atillabarbarossa.com).

---

## 5. TikTok (287.000 takipçi)

- Ad: "Atilla Barbarossa". Biyografi (80 karakter):
  `Reisefilmer 🎬 Hotels & Destinationen · Berlin ⇄ Istanbul`
- Web sitesi alanı: `atillabarbarossa.com` (işletme hesabında açılır).
- TikTok araması ve Google, TikTok videolarını şu sırayla anlar: **ilk 3 saniyede söylenen
  kelime**, ekrandaki yazı, açıklamanın ilk satırı, 3–5 hashtag. Açıklamayı 2–3 cümlelik
  gerçek bir metin yapın (otel adı, şehir, ülke); tek kelimelik açıklama kullanmayın.
- Konum ekleyin; otelin/turizm kurumunun TikTok hesabını etiketleyin.

---

## 6. YouTube (20.000 abone) – GEO'da en değerli kanal

Google AI Overviews ve Gemini YouTube'u çok sık kaynak gösterir; yapay zekâ motorları videonun
**transkriptini** okur.

- **Kanal açıklaması** (ilk 150 karakter aramada görünür):
  > Reisefilmer und Creative Director aus Berlin: kinoreife Hotel- und Destinationsfilme aus
  > [die Reiseziele des Kanals, z. B. Istanbul und der Türkei]. Für Kooperationen:
  > atillabarbarossa.com
- **Kanal linkleri:** atillabarbarossa.com, Instagram, TikTok. YouTube Studio → Ayarlar →
  Kanal → Anahtar kelimeler: `Atilla Barbarossa, Reisefilmer, Travel Filmmaker, Hotel Review,
  Luxushotel, Istanbul, Türkei Reise, Malta, Kasachstan, Rumänien`.
- **Başlık şablonu:** `[Hotel/Ort] – [was es ist] | [Stadt/Land] 4K`
  örn. `Novotel Istanbul Bosphorus – Hoteltipp in Karaköy | Istanbul 4K`
- **Açıklama şablonu:**

  ```
  [2 Sätze Zusammenfassung mit Hotel, Stadt, Land – das liest auch die KI.]

  00:00 Ankunft
  00:45 Zimmer
  02:10 Frühstück
  ...

  📍 [Hotel], [Adresse/Viertel], [Stadt]
  🤝 In Zusammenarbeit mit @[partner] (falls bezahlt: "Werbung")
  🎬 Film & Schnitt: Atilla Barbarossa – https://atillabarbarossa.com
  #[stadt] #[land]reise #hoteltipp
  ```
- **Altyazı:** Otomatik altyazıyı düzeltin; DE + EN (+ TR) yükleyin. Hem yapay zekâ hem
  uluslararası izleyici için.
- **Oynatma listeleri:** "Hotels in Istanbul", "Malta", "Kasachstan", "Hotel Reviews".
- **Shorts:** Her reel, başlığında anahtar kelimeyle Shorts olarak da yüklensin.
- Her partnerin uzun filmi YouTube'da olsun; linki `src/lib/partners.ts`'e girilince sitede de görünür.

---

## 7. Sıradaki içerik adımları (öncelik sırasıyla)

1. **Her iş birliği için bir vaka sayfası** (ör. `/projekte/novotel-bosphorus-istanbul`, 3 dilde):
   hedef, yapılan iş, video, rakamlar (559.316 hesap), müşteri yorumu. Yapay zekâ motorları
   somut rakam içeren sayfaları kaynak gösterir; en büyük GEO kaldıracı budur.
2. **Partner linkleri** (bkz. bölüm 3).
3. **Mediadaten sayfası** (`/mediadaten`): "Atilla Barbarossa Mediadaten" arayanlar için;
   PDF indirilebilir.
4. **Müşteri referansları** (izinli, isim + unvan + otel) – ana sayfaya ve vaka sayfalarına.
5. **Basın:** DACH otelcilik/turizm sektör yayınlarında (ör. AHGZ, fvw|TravelTalk, Tophotel)
   röportaj veya konuk yazı; Türkiye'de turizm sektör siteleri. Her haber siteye link verirse hem
   Google hem yapay zekâ için güven sinyali.
6. İsteğe bağlı: Google İşletme Profili ("Videoproduzent", Berlin, adres gizli hizmet bölgesi).

---

## 8. Ölçüm – ayda bir kontrol

**Yapay zekâ testleri** (ChatGPT arama açık, Perplexity, Google AI Mode, Gemini, Copilot).
Her ay aynı soruları sorun, tabloya yazın: Atilla anılıyor mu? Site kaynak mı? Bilgiler doğru mu?

| Dil | Soru |
|---|---|
| DE | Wer ist Atilla Barbarossa? |
| DE | Welche Travel-Creator aus dem DACH-Raum drehen Hotelvideos in Istanbul? |
| DE | Reise-Content-Creator für einen Tourismusverband gesucht – Empfehlungen? |
| DE | Social-Media-Betreuung mit Videoproduktion für Hotels – wer bietet das an? |
| EN | Travel filmmaker for a tourism board targeting the DACH market? |
| EN | Has Atilla Barbarossa worked with Visit Malta? |
| TR | Atilla Barbarossa kimdir? |
| TR | Almanya merkezli, Türkçe de içerik üreten seyahat film yapımcıları kimler? |

Yanlış bilgi görürseniz: doğrusu sitede açıkça yazıyor mu? Yazmıyorsa SSS'ye ekleyin
(`translations.ts` → `faq_*`, üç dilde).

**Search Console / Bing:** "atilla" içeren sorgular, `/en` `/tr` `/social-media`
gösterimleri, dizine alınmayan sayfalar.

---

## 9. Hazır metinler

**Kısa tanım (profiller, basın, partner sayfaları):**

- DE: Atilla Barbarossa ist Reisefilmer, Creative Director und Travel Content Creator aus
  Berlin. Er produziert kinoreife Hotel- und Destinationsfilme für Hotels, Tourismusverbände
  und Travel-Brands – für rund 613.000 Follower auf Instagram, TikTok und YouTube, 86 % davon
  aus dem DACH-Raum.
- EN: Atilla Barbarossa is a travel filmmaker, creative director and travel content creator
  from Berlin. He produces cinematic hotel and destination films for hotels, tourism boards and
  travel brands, for around 613,000 followers on Instagram, TikTok and YouTube, 86% of them in
  the DACH region.
- TR: Atilla Barbarossa, Berlin merkezli bir seyahat film yapımcısı, kreatif direktör ve
  seyahat içerik üreticisidir. Oteller, turizm kurumları ve seyahat markaları için sinematik
  otel ve destinasyon filmleri üretir; Instagram, TikTok ve YouTube'da toplam yaklaşık 613.000
  takipçisi vardır ve kitlesinin %86'sı DACH bölgesindendir.

Rakamlar değişince bu metinleri de `src/lib/site.ts` ile birlikte güncelleyin.

---

## 10. E-kitap (The Travel Creator Roadmap): Google'da bulunmak ve satmak

**Sitede ne değişti (1 Ekim 2026)?** Daha önce e-kitaba yalnızca footer'daki tek bir kelime
götürüyordu; ne ziyaretçi ne Google ona ana sayfadan ulaşabiliyordu.

- Navbar'da altın çerçeveli **"E-Book"** butonu; mobil menüde ayrı, altın renkli satır.
- Ana sayfada, Instagram filmlerinin hemen altında **kapaklı e-kitap bölümü**:
  "Zum E-Book" → `/roadmap`, "Gratis-Auszug" → Tentary (ücretsiz bölüm, e-posta toplar).
- Ana sayfa SSS'ine 9. soru: "Gibt es ein E-Book von Atilla Barbarossa?" (3 dilde, `/roadmap`'e
  linkli). FAQPage verisine ve `/llms.txt`'ye kendiliğinden girer.
- `/roadmap` yapılandırılmış verisi: ürün kodu (`TCR-DE`), marka, satıcı, durum, breadcrumb.
  Teklifin adresi artık Tentary değil sayfanın kendisi (Merchant Center bunu ister).
- `/en` ve `/tr`'den gelen linkler sayfayı `?lang=en|tr` ile o dilde açar; canonical hep `/roadmap`.

**Bir kerelik yapılacaklar (~45 dk)**

1. **Search Console** → URL Denetimi → `https://atillabarbarossa.com/roadmap` ve ana sayfa
   → "Dizine eklenmesini iste" (yeni iç linkleri hızlı görsün).
2. **Rich Results Test** → `/roadmap`: "Ürün snippet'leri" ve "Satıcı listelemeleri" hatasız
   olmalı. Kargo ve iade alanları için uyarı çıkabilir; bunlar Merchant Center hesabında
   tanımlanır (aşağıda), hata değildir.
3. **Google Merchant Center** (merchants.google.com) – ücretsiz listeleme:
   - Search Console ile aynı Google hesabıyla açın; alan adını doğrulayıp sahiplenin.
   - Ürünler → "Web sitenizden ürün ekleyin": sayfadaki ürün verisini otomatik okur.
     Elle eklenecekse: kimlik `TCR-DE`, link `https://atillabarbarossa.com/roadmap`,
     görsel `/roadmap/cover.webp`, fiyat 49 EUR, durum yeni, marka Atilla Barbarossa.
   - Pazarlama yöntemi olarak **yalnızca "Ücretsiz listelemeler"**. Google, e-kitapları Mayıs
     2021'den beri **Shopping reklamlarında kabul etmiyor**; reklam kampanyası açmayın, reddedilir.
   - Teslimat: dijital ürün, kargo ücreti 0 €. İade politikası: Tentary'deki cayma hakkı metni
     ne diyorsa birebir aynısı (dijital içerikte, anında teslime onay verilince cayma hakkı düşer).
   - Hedef ülke: Almanya ve Avusturya (kitap Almanca, fiyat EUR).
4. **Fiyat değişirse:** önce Tentary, sonra `src/lib/roadmap.ts` → `price`. Sayfa ile ödeme
   sayfası farklı fiyat gösterirse Merchant Center ürünü durdurur.
5. İsteğe bağlı: **Google Play Kitaplar** (Partner Merkezi) – PDF'i Google'ın kendi kitap
   mağazasında da satmak; Google aramadaki kitap sonuçlarında çıkar. Ayrı bir mağaza ve fiyat
   yönetimi demek, bu yüzden önce Merchant Center'ın sonucunu görün.

**Sitenin dışından trafik**

- Instagram bio'daki link doğrudan `/roadmap`'e gitsin; story'lerde link çıkartması da.
- YouTube: e-kitabı anlatan bir video (ör. "Wie ich kostenlos in Luxushotels übernachte"),
  açıklamanın ilk satırında `/roadmap`. YouTube videoları Google'da ayrıca sıralanır.
- Creator ve seyahat podcast'leri, bloglarında konuk yazı (Almanca); her biri `/roadmap`'e link.
- Pinterest: kapak ve "Pitch-Vorlage Hotel" pinleri → `/roadmap`.

**Sıradaki büyük adım: rehber makaleler.** `/roadmap` tek başına "Travel Creator werden" gibi
geniş aramalarda zor sıralanır; Google bu sorulara rehber yazıları gösterir. Önerilen üç
Almanca makale, her biri e-kitaba linkli:

1. "Hotel-Kooperation anfragen: So schreibst du die erste Mail" (bir örnek mail ücretsiz,
   tüm şablonlar e-kitapta)
2. "Travel Creator werden: die ersten 90 Tage"
3. "Wie viele Follower braucht man für Hotel-Kooperationen?"

Metinler Atilla'nın kendi deneyimiyle yazılmalı (Google bunu "deneyim" sinyali olarak arar).
Altyapı (`/blog`, Article verisi, sitemap) ayrı bir iş.

**Ölçüm (ayda bir):** Search Console → Performans → sayfa `/roadmap` (gösterim, tıklama,
sorgular); Merchant Center → ücretsiz listeleme tıklamaları; Tentary → satışlar ve
Gratis-Auszug talepleri. Sitede analitik yok (gizlilik kuralı), satışları Tentary sayar.
