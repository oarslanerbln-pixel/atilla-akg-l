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
   - `supabase/seed.sql` (**örnek** turlar, rehberler ve önümüzdeki 90 günün tarihleri)
3. Project Settings → API → `SUPABASE_URL` ve `service_role` anahtarını kopyalayın.
4. Gerçek turlar, fiyatlar ve rehber numaraları Table Editor'den `tours`, `guides` ve `departures` tablolarına girilir. Müşteriler `contacts`, konuşmalar `messages`, rezervasyonlar `bookings` tablosunda görünür.

## 2. Claude
console.anthropic.com → API Keys → `ANTHROPIC_API_KEY`. Model: `claude-opus-5`. Anthropic'in önerdiği şekilde, bir istek güvenlik nedeniyle reddedilirse otomatik olarak başka bir modelle tekrar denenir (server-side fallback).

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
4. Hesabı bağlayıp token üretin → `INSTAGRAM_ACCESS_TOKEN`. Hesap kimliği → `INSTAGRAM_ACCOUNT_ID`.
5. Webhook: aynı Callback URL ve aynı verify token. Alanlar: `messages`, `messaging_postbacks`, `comments`, `message_echoes`.
6. Instagram uygulamasında Ayarlar → Mesajlar → **Bağlı araçlar / Mesaj erişimine izin ver** seçeneğini açın.
7. Yabancı müşterilerden mesaj alabilmek için uygulamanın **App Review**'dan geçmesi ve *Live* moda alınması gerekir. İnceleme tamamlanana kadar yalnızca uygulamaya eklenmiş test hesaplarıyla çalışır.

**Yoruma otomatik DM:** Bir post veya reel'in altına `IG_COMMENT_KEYWORDS` listesindeki kelimelerden biri (ör. "TUR", "Reise", "info") yazıldığında, yorum yapan kişiye müşterinin dilinde otomatik DM gider ve concierge sohbeti devralır.

## 5. Stripe
1. Stripe hesabı → para birimi EUR. Settings → Payment methods'ta kart, Apple Pay, Google Pay, PayPal ve SEPA'yı açın.
2. Developers → API keys → `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → endpoint: `https://SITE/api/webhooks/stripe`. Olaylar: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`. Signing secret → `STRIPE_WEBHOOK_SECRET`.

## 6. Vercel
Bütün değişkenleri girin (`SITE_URL` dahil) ve yeniden deploy edin. Webhook'lar birkaç dakika sürebilen işleri cevap döndükten sonra çalıştırdığı için Fluid Compute açık kalmalı (varsayılan olarak açık).

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
