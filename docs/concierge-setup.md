# AI Concierge – Kurulum Rehberi

Instagram DM + WhatsApp → Claude concierge → Supabase CRM → Stripe kapora → Atilla ve rehberlere bildirim.

```
Instagram DM / yorum ─┐                          ┌─► müşteriye cevap (DE/EN/TR)
                      ├─► /api/webhooks/meta ──► Claude ─┼─► Supabase (müşteri, rezervasyon)
WhatsApp ─────────────┘                          ├─► Stripe kapora linki
                                                 └─► Atilla'ya devir (WhatsApp bildirimi)
Stripe ödeme ─► /api/webhooks/stripe ─► onay mesajı + Atilla + rehber bildirimi
```

Bütün anahtarlar `.env.example` dosyasında listeli. Yerelde `.env.local` dosyasına, canlıda Vercel → Settings → Environment Variables'a girilir.

---

## 1. Supabase (CRM ve veritabanı)
1. supabase.com → New project → bölge olarak **Frankfurt (eu-central-1)** seçin (DSGVO/KVKK için AB'de kalsın).
2. SQL Editor'de sırayla çalıştırın:
   - `supabase/migrations/20260924000000_concierge.sql` (tablolar)
   - `supabase/migrations/20260926000000_offers_and_sources.sql` (partner teklifleri ve reel takibi)
   - `supabase/migrations/20260927000000_function_search_path.sql` (fonksiyon güvenlik ayarı)
   - `supabase/migrations/20260928000000_offer_links_without_sub_id.sql` (sub-id'siz partner linkleri)
   - `supabase/migrations/20260929000000_instagram_token.sql` (Instagram token'ının otomatik yenilenmesi)
   - `supabase/seed.sql` (**örnek** turlar, rehberler ve önümüzdeki 90 günün tarihleri)
   - `supabase/offers.sql` (partner teklifleri; her değişiklikten sonra tekrar çalıştırılabilir)
3. Project Settings → API → `SUPABASE_URL` ve `service_role` anahtarını kopyalayın.
4. Gerçek turlar, fiyatlar ve rehber numaraları Table Editor'den `tours`, `guides` ve `departures` tablolarına girilir. Müşteriler `contacts`, konuşmalar `messages`, rezervasyonlar `bookings` tablosunda görünür.

## 2. Claude
console.anthropic.com → API Keys → `ANTHROPIC_API_KEY`. Model: `claude-opus-5-5`. Anthropic'in önerdiği şekilde, bir istek güvenlik nedeniyle reddedilirse otomatik olarak başka bir modelle tekrar denenir (server-side fallback).

**Yapay zekâyı açmak:** Concierge müşterilere yalnızca Vercel'de `CONCIERGE_AI=on` tanımlıysa cevap verir. Değişken yoksa (veya başka bir değerdeyse) sistem **yalnızca partner modunda** çalışır:
- Partner anahtar kelimesi soran yorum, story cevabı veya DM linkini alır (aşağıda *Partner teklifleri*).
- Tur kelimeleri (`IG_COMMENT_KEYWORDS`) ve diğer bütün mesajlar Atilla'ya kalır. Bu mesajlar veritabanına **kaydedilmez**, Claude'a da gönderilmez.
- Atilla'nın Instagram uygulamasından yazdığı mesajlar işlenmez, bildirim gitmez.

Değişiklik ancak yeniden deploy ile geçerli olur.

**Claude'a ulaşılamazsa** (geçersiz anahtar, dolan harcama limiti, uzun kesinti; SDK kısa hataları kendisi tekrar dener) müşteri cevapsız kalmaz. Ona Atilla'nın döneceği yazılır, bot o sohbette durur ve Atilla'ya hatanın sebebiyle tek bir WhatsApp uyarısı gider. Böylece her yeni mesaj yeni bir uyarı doğurmaz. Sorun giderilince Atilla uyarıyı *bot* diye yanıtlayarak botu o müşteri için tekrar açar.

## 3. WhatsApp Business Platform
Atilla şu an normal WhatsApp kullandığı için concierge'e **ayrı bir numara** (yeni SIM veya sanal numara) ayırmak en temizi. Cloud API'ye bağlanan numara artık normal WhatsApp uygulamasında kullanılamaz.

1. business.facebook.com → İşletme hesabı açın, işletme doğrulamasını tamamlayın.
2. developers.facebook.com → Create App → **Business** → WhatsApp ürününü ekleyin.
3. WhatsApp → API Setup → numarayı ekleyin ve doğrulayın. `WHATSAPP_PHONE_NUMBER_ID` buradadır.
4. Business Settings → System Users → bir system user oluşturun → `whatsapp_business_messaging` ve `whatsapp_business_management` izinleriyle **kalıcı token** üretin → `WHATSAPP_ACCESS_TOKEN`.
5. App Settings → Basic → App Secret → `META_APP_SECRET`.
6. WhatsApp → Configuration → Webhook:
   - Callback URL: `https://SITE/api/webhooks/meta`
   - Verify token: `META_VERIFY_TOKEN` için belirlediğiniz metin
   - Abone olunacak alan: `messages`
7. **Mesaj şablonları** (WhatsApp Manager → Message templates, kategori *Utility*). Müşteri 24 saattir yazmamışsa sistem otomatik olarak bu şablonlara geçer:
   - `concierge_alert` – dil: Türkçe – gövde: `Yeni bildirim: {{1}}`
   - `booking_update` – dil: Almanca, İngilizce ve Türkçe – gövde: `Atilla Barbarossa Journeys: {{1}}`

## 4. Instagram
1. Instagram hesabı **Profesyonel** (İşletme veya İçerik Üreticisi) olmalı.
2. Aynı Meta uygulamasına **Instagram** ürününü ekleyin → *API setup with Instagram login*.
3. İzinler: `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`.
4. Hesabı bağlayıp token üretin → `INSTAGRAM_ACCESS_TOKEN`. Hesap kimliği gerekmez: sistem token'ın hesabını (`me`) kullanır.
5. Webhook: aynı Callback URL ve aynı verify token. Alanlar: `messages`, `messaging_postbacks`, `comments`, `message_echoes`.
6. Instagram uygulamasında Ayarlar → Mesajlar → **Bağlı araçlar / Mesaj erişimine izin ver** seçeneğini açın.
7. Yabancı müşterilerden mesaj alabilmek için uygulamanın **App Review**'dan geçmesi ve *Live* moda alınması gerekir. İnceleme tamamlanana kadar yalnızca uygulamaya eklenmiş test hesaplarıyla çalışır.

**Token yenileme:** `INSTAGRAM_ACCESS_TOKEN` 60 gün geçerlidir. Sistem onu ilk kullanımda şifreleyip Supabase'e (`access_tokens` tablosu) kaydeder. Her pazartesi sabahı bir Vercel Cron işi (`/api/cron/instagram-token`, `vercel.json`) Meta'dan 60 günlük yeni bir token alır ve kayıtlı olanın yerine yazar; bot bundan sonra hep kayıtlı token'ı kullanır. Bunun için Vercel'de `CRON_SECRET` tanımlı olmalı (bkz. *7. Vercel*).
- Yenileme başarısız olursa Atilla'ya WhatsApp'tan, token'ın ne zaman sona ereceğini söyleyen bir uyarı gelir.
- O durumda, veya hesap yeniden bağlandığında: Meta'da yeni token üretin, Vercel'de `INSTAGRAM_ACCESS_TOKEN`'a yapıştırın ve yeniden deploy edin. Sistem değişikliği fark eder ve kayıtlı token'ı yenisiyle değiştirir.
- Meta bir token'ı ancak en az 24 saatlik olduğunda yeniler. Yeni yapıştırılan token o hafta için fazla gençse yenileme atlanır (`too_new`) ve bir sonraki pazartesi yapılır.

**Yoruma otomatik DM** (tur kelimeleri yalnızca `CONCIERGE_AI=on` iken; partner kelimeleri her zaman): Bir post veya reel'in altına `IG_COMMENT_KEYWORDS` listesindeki bir kelime tek başına veya rica kelimeleriyle (ör. "TUR", "Tour bitte", "Lütfen fiyat 🙏") yazıldığında:
1. Yorum yapan kişiye, dilinde, **"Turları göster"** butonlu bir DM gider. Instagram, müşteri cevap verene kadar ikinci mesaja izin vermediği için buton tek dokunuşla sohbeti açar ve concierge devralır.
2. Yorumun altına 6 farklı kısa cevaptan biri herkese açık olarak yazılır ("DM'den yazdım ✨" gibi).
3. Yorumun hangi reel'den geldiği kaydedilir (bkz. *Hangi reel ne kazandırdı?*).

Kelime bir cümlenin içinde geçiyorsa ("Die Tour war toll!", "Was kostet die Tour?") bot ne DM ne cevap yazar; o yorumlar Atilla'ya kalır. @etiketler, emoji ve noktalama sayılmaz. Rica kelimeleri (bitte, please, lütfen …) `src/lib/concierge/keywords.ts` içindeki `REQUEST_WORDS` listesindedir. Aynı kural partner tekliflerine, story cevaplarına ve DM'lere de uygulanır.

### Partner (affiliate) teklifleri – Amex, GetYourGuide, Skyscanner
Tur dışında tanıtılan ürünler `affiliate_offers` tablosunda durur ve `supabase/offers.sql` dosyasından yönetilir. Dosyayı düzenleyip SQL Editor'de çalıştırmak yeterli; kayıtlar güncellenir.

1. **Takip linki (`tracking_url`):** ağın linkinde sub-id parametresine `{click_id}` yazın. Tıklama kimliği yalnızca harf ve rakamdan oluşur.
   - FinanceAds (Amex): `https://financeads.net/tc.php?t=…T&subid={click_id}`
   - GetYourGuide aktivitesi: aktivite sayfasının adresi + `?partner_id=RTQEAHP&cmp={click_id}`. Her aktivite için kısa link üretmeye gerek yok.
   - Impact (Skyscanner): `https://skyscanner.pxf.io/…?subId1={click_id}&u=<URL-encoded skyscanner.de adresi>`. `u` olmadan kısa link kaydedilmiş aramayı (şehir ve tarihler sabit) açar; `u` ile istenen sayfaya gider ve takip korunur.
   - Sub-id taşıyamayan linkler (ör. GetYourGuide app linki) `{click_id}` olmadan da girilebilir. Tıklamalar yine bizde sayılır, sadece ağın raporuyla eşleştirilemez.
2. **`keywords`** (küçük harf), **`pitch`** (programın onayladığı kısa metin, DE/EN/TR) ve **`active`**. Anahtar kelimeler tur kelimelerinden önce gelir ve yorumda tek başına yazılınca tetikler. Bu yüzden tek kelimelik bir iltifat ya da tepki olabilecek kelimeler seçmeyin: "Gold ✨" bir iltifattır, "GOLDCARD" ise bir istek. Kelime boşluksuz olmalı; "Gold Card" iki ayrı kelimedir ve tetiklemez.
3. **Reel:** *"Yorumlara GOLDCARD yaz"*. Yorum yapana tanıtım metni ve **"Linki gönder"** butonu gider. Butona basınca kişiye özel bir link (`SITE/go/…`) ve reklam uyarısı gelir.
4. **Story:** *"Bu story'ye GOLDCARD diye cevap ver"*. Story'ye kelimeyle cevap veren kişiye ("GOLDCARD", "Goldcard bitte"; cümle içindeki kelime sayılmaz) tanıtım metni ve link hemen DM'den gider, story de kaynak olarak kaydedilir. Aynı mesaj DM'den veya WhatsApp'tan gelirse de aynısı olur. Instagram API ile story'ye link sticker'ı eklenemediği için story'de linki bu yolla dağıtıyoruz.
5. Concierge'e sohbet içinde soran müşteriye de aynı link gönderilir. Her tıklama sayılır.

**Hukuki notlar**
- Her partner linkinde "Anzeige / Ad / Reklam" uyarısı otomatik olarak yer alır. Reel'in kendisi de reklam olarak işaretlenmeli (ör. "Werbung" etiketi veya Instagram'ın *Ücretli ortaklık* etiketi).
- Concierge kredi kartları hakkında kişisel finansal tavsiye vermez; yalnızca onaylı tanıtım metnini kullanır ve koşullar için sağlayıcıya yönlendirir.
- Programın koşullarını kontrol edin: bazı kart programları DM, yorum veya teşvikli trafik üzerinden tanıtımı kısıtlar. Tanıtım metni programın izin verdiği ifadelerden oluşmalı.

### Hangi reel ne kazandırdı?
Supabase'deki `source_performance` görünümünde her post/reel/story için şunlar listelenir: link, açılan sohbet sayısı, ödenmiş rezervasyonlar, tur cirosu, gönderilen ve açılan partner linkleri.

## 5. Stripe
1. Stripe hesabı → para birimi EUR. Settings → Payment methods'ta kart, Apple Pay, Google Pay, PayPal ve SEPA'yı açın.
2. Developers → API keys → `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → endpoint: `https://SITE/api/webhooks/stripe`. Olaylar: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`. Signing secret → `STRIPE_WEBHOOK_SECRET`.

## 6. Şifreleme anahtarları
Müşteri adları, telefon numaraları, Instagram kimlikleri, e-postalar ve bütün konuşmalar veritabanına yazılmadan önce sunucuda **AES-256-GCM** ile şifrelenir. Supabase'e veya bir yedeğe erişen biri yalnızca anlamsız metin görür.

1. İki ayrı anahtar üretin (komutu iki kez çalıştırın):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
2. `CONCIERGE_ENCRYPTION_KEYS=1:<birinci anahtar>` ve `CONCIERGE_INDEX_KEY=<ikinci anahtar>` olarak girin.
3. **İki anahtarı da bir şifre yöneticisine (1Password, Bitwarden) kaydedin.** Anahtar kaybolursa kayıtlı müşteri verileri bir daha okunamaz.
4. Anahtar yenileme (ör. yılda bir veya bir sızıntı şüphesinde): yeni anahtarı başa ekleyin → `2:<yeni>,1:<eski>`. Yeni veriler yeni anahtarla yazılır, eskiler okunmaya devam eder. `CONCIERGE_INDEX_KEY` değiştirilmez.

Not: Supabase Table Editor'de `contacts`, `messages` ve `bookings` tablolarındaki kişisel alanlar bu yüzden `v1.1.…` şeklinde görünür. Okunabilir görünüm, planlanan CRM panelinde gelecek.

**Diğer korumalar**
- Meta ve Stripe webhook'ları imza ile doğrulanır; sahte istekler reddedilir.
- Stripe ödemesi yalnızca tutar, para birimi ve oturum rezervasyonla birebir eşleşirse onaylanır. Eşleşmezse Atilla'ya uyarı gider.
- Bir kişi bir saatte 30'dan fazla mesaj atarsa (spam, bot, maliyet saldırısı) bot o sohbette durur ve Atilla'ya haber verilir.
- Veritabanı herkese açık API rollerine (`anon`, `authenticated`) tamamen kapalıdır; yalnızca sunucu erişebilir.

**Veri saklama (DSGVO/KVKK):** `purge_stale_personal_data()` fonksiyonu 24 aydır hareketsiz, ödenmiş rezervasyonu olmayan müşterileri ve eski mesajları siler. Supabase → Database → Extensions'dan `pg_cron`'u açıp SQL Editor'de bir kez çalıştırın:
```sql
select cron.schedule('concierge-purge', '30 3 * * *', 'select public.purge_stale_personal_data()');
```

## 7. Vercel
Bütün değişkenleri girin (`SITE_URL` dahil) ve yeniden deploy edin. Webhook'lar birkaç dakika sürebilen işleri cevap döndükten sonra çalıştırdığı için Fluid Compute açık kalmalı (varsayılan olarak açık).

**Zamanlanmış işler (Vercel Cron):** `vercel.json` içinde tanımlıdır ve yalnızca production deploy'larında çalışır. Şu an tek iş var: pazartesi 04:00 UTC'de Instagram token yenileme (Hobby planında o saat içinde herhangi bir anda). Aynı iş Instagram hesabını webhook'lara (`messages`, `messaging_postbacks`, `comments`) abone eder: Meta'daki uygulama düzeyindeki callback tek başına hiçbir şey iletmez, hesabın kendisi de abone olmalı ve panodaki *Webhook-Abonnement* düğmesi bazen hata verir.
1. Rastgele bir metin üretin:
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
   ```
2. Vercel → Settings → Environment Variables → `CRON_SECRET` olarak (Production, Sensitive) girin ve yeniden deploy edin. Vercel bu değeri her cron isteğine `Authorization: Bearer …` başlığıyla ekler; `CRON_SECRET` yoksa uç nokta 503 döner ve hiçbir şey yenilenmez.
3. Kontrol: Vercel → Settings → Cron Jobs → *Run* ile elle tetikleyin, sonra *View Logs*. Cevap `{"status":"refreshed",…}` veya token bir günden yeniyse `{"status":"too_new",…}` olmalı; `webhooks` alanı `{"status":"subscribed"}` göstermeli. Yeni bir `INSTAGRAM_ACCESS_TOKEN` girildiğinde redeploy'dan sonra bir kez *Run*'a basın, pazartesiyi beklemeyin.

---

## Atilla sistemi nasıl kullanır?

| Durum | Ne olur |
|---|---|
| Müşteri yazar | Concierge 4 saniye bekler (arka arkaya gelen mesajları toplamak için), sonra müşterinin dilinde cevap verir |
| Pazarlık, özel tur, şikâyet veya "bir insanla konuşmak istiyorum" | Bot o müşteride durur. Atilla'ya WhatsApp'tan Türkçe bir özet gelir |
| Atilla bildirimi **yanıtlarsa** (mesaja basılı tut → Yanıtla) | Yazdığı metin müşteriye iletilir |
| Atilla bildirimi sadece **bot** diye yanıtlarsa | Concierge o müşteride tekrar devreye girer |
| Atilla Instagram uygulamasından müşteriye kendisi yazarsa | Bot o sohbette otomatik olarak durur, Atilla'ya haber gelir |
| Müşteri kaporayı öder | Müşteriye onay mesajı, Atilla'ya ödeme bildirimi, atanmış rehbere tur bilgisi gider |

## Hukuki kontrol listesi (DE/TR)
- Concierge ilk mesajında yapay zekâ asistanı olduğunu söyler (AB Yapay Zekâ Yasası'nın şeffaflık kuralı).
- Web sitesindeki gizlilik politikasına (Datenschutzerklärung) şunlar eklenmeli: Meta, Anthropic, Supabase ve Stripe kullanıldığı; verilerin rezervasyon amacıyla işlendiği.
- Anthropic, Supabase ve Stripe ile veri işleme sözleşmesi (AVV/DPA) yapılmalı. Hepsi bunu standart olarak sunuyor.
- Pazarlama mesajları yalnızca açık onay verenlere gönderilir (`contacts.marketing_consent`).

## Sonraki aşamalar
- Tur hatırlatmaları: 7 gün önce, 48 saat önce ve tur sabahı (Vercel Cron + şablonlar)
- Rehberin turu WhatsApp'tan ✅/❌ ile kabul etmesi, reddederse sıradaki rehbere geçilmesi
- Tur sonrası Google ve TripAdvisor yorum isteği
- Sitede Atilla için şifreli CRM paneli ve üç dilli rezervasyon sayfası
- Sesli mesajların yazıya dökülmesi
