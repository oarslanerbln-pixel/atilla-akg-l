# Otomasyon – Devir Notu

**Durum tarihi: 30 Eylül 2026.** Bu dosya o günün anlık fotoğrafıdır; kod değiştikçe
`docs/concierge-setup.md` (kurulum adımları) ve `CLAUDE.md` (kurallar) esas alınır.
Burada hiçbir anahtar veya gizli değer yoktur. Değerler yalnızca Vercel'de ve bir şifre
yöneticisinde durur, sohbetlere yapıştırılmaz.

---

## 1. Sistem ne yapıyor?

Atilla Barbarossa için Instagram ve WhatsApp üzerinden çalışan bir satış otomasyonu:

```
Instagram DM / yorum / story cevabı ─┐
                                     ├─► /api/webhooks/meta ──► Claude (concierge) ─┬─► müşteriye cevap (DE/EN/TR)
WhatsApp ────────────────────────────┘                                              ├─► Supabase (müşteri, rezervasyon)
                                                                                    ├─► Stripe kapora linki
                                                                                    └─► Atilla'ya devir (WhatsApp bildirimi)
Stripe ödemesi ─► /api/webhooks/stripe ─► onay mesajı + Atilla + rehber bildirimi
Anahtar kelime (GOLD, LOUNGE…) ─► modele gitmeden partner linki ─► /go/<id> (tıklama sayılır)
```

| Parça | Nerede |
|---|---|
| Concierge mantığı (sunucu tarafı) | `src/lib/concierge/` – `agent.ts` (Claude tool-use döngüsü), `inbound.ts` (gelen olaylar), `tools.ts`, `meta.ts` (Instagram/WhatsApp API), `tokens.ts`, `crypto.ts`, `db.ts`, `bookings.ts`, `offers.ts`, `copy.ts` (sabit müşteri mesajları, 3 dil) |
| Webhook'lar | `src/app/api/webhooks/meta/route.ts`, `src/app/api/webhooks/stripe/route.ts` |
| Haftalık cron | `src/app/api/cron/instagram-token/route.ts` + `vercel.json` (pazartesi 04:00 UTC): Instagram token'ını yeniler ve hesabı webhook'lara abone eder |
| Partner link yönlendirme | `src/app/go/[id]/route.ts` |
| Veritabanı şeması | `supabase/migrations/` (5 dosya), `supabase/seed.sql` (örnek turlar), `supabase/offers.sql` (partner teklifleri; idempotent) |
| Reel kapak / story görselleri | `social/` → `npm run social -- social/briefs/<brief>.json` (bkz. `social/README.md`) |
| Kurulum rehberi | `docs/concierge-setup.md` |
| Model | `claude-opus-5-5` (`src/lib/concierge/config.ts`) |

Kişisel veriler Supabase'e yazılmadan önce uygulamada AES-256-GCM ile şifrelenir. Kişisel alanlar
asla doğrudan DB'ye yazılmaz, her zaman `db.ts` / `bookings.ts` eşleyicileri kullanılır. Kişiler
`external_id_hash` ile aranır (bkz. `CLAUDE.md`).

## 2. Altyapı

- **Kod:** GitHub `oarslanerbln-pixel/atilla-akg-l`, dal `main`. Her değişiklik PR ile gelir; CI (`verify`: tsc, eslint, build) yeşil olmalı.
- **Hosting:** Vercel projesi `atilla-portfolio` (takım `oarslanerbln-pixels-projects`), fonksiyonlar Frankfurt'ta (`fra1`). Canlı alan adı: `atillabarbarossa.com`.
- **Veritabanı:** Supabase (Vercel entegrasyonu ile bağlı; bölge Frankfurt olmalı).
- **Geçici çözüm:** Atilla'nın Instagram hesabına anahtar kelime cevapları için **Manychat** bağlı. Gizlilik metninde (`src/app/datenschutz/page.tsx`, bölüm 9 ve 12) geçiyor. Manychat bırakılınca o paragraflar silinmeli.

## 3. Canlı durum (30 Eylül 2026, Vercel'den okundu)

### Vercel'de tanımlı değişkenler (production)
`SITE_URL`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ entegrasyonun diğer Supabase/Postgres değişkenleri),
`CONCIERGE_ENCRYPTION_KEYS`, `CONCIERGE_INDEX_KEY`, `META_VERIFY_TOKEN`, `META_GRAPH_VERSION`, `INSTAGRAM_ACCESS_TOKEN`,
`INSTAGRAM_APP_SECRET`, `IG_COMMENT_KEYWORDS`, `STAFF_WHATSAPP`, `TOUR_TIMEZONE`, `CRON_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`.

### Eksik olanlar ve etkisi
| Eksik değişken | Etkisi |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` | WhatsApp kanalı hiç çalışmıyor. **Atilla'ya giden bütün bildirimler** (müşteri devri, token yenileme hatası, ödeme) WhatsApp'tan gittiği için şu an **ulaşmıyor**. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Kapora linki oluşturulamıyor, ödeme onayı işlenemiyor. Rezervasyon akışı Stripe'ta kırılıyor. |
| `META_APP_SECRET` | Instagram imzası `INSTAGRAM_APP_SECRET` ile doğrulanıyor, o yüzden Instagram için sorun değil. WhatsApp ayrı bir Meta uygulamasındaysa gerekir. |
| `CONTACT_FROM_EMAIL` | Sitedeki iletişim formu hâlâ 503 döner (bilerek: gönderemediği mesajı "gönderildi" diye göstermez). Resend'de doğrulanmış bir alan adındaki adres olmalı. |

**Artık kullanılmayan:** `INSTAGRAM_ACCOUNT_ID` Vercel'de duruyor ama kod okumuyor (hesap token'dan alınıyor). Silinebilir.

### Instagram webhook teşhisi
- Meta, `/api/webhooks/meta`'ya teslimat yapıyor; imza doğrulanıyor (hepsi 200).
- 30 Eylül'de görülen teslimatların hepsi `read` (okundu) ve `reaction` (tepki) olayıydı. Bunlar tasarım gereği iş üretmez (`-> 0 job(s)`). O pencerede gerçek bir **`message` olayı görülmedi**.
- Vercel bu planda runtime loglarını çok kısa süre tutuyor (yaklaşık 1 saat). Test ederken logları **hemen** okuyun.
- Her teslimat şu satırı loglar (kimlik ve metin olmadan, yalnızca alan adları):
  `[concierge] webhook instagram: <olay şekli> -> N job(s)`
  Beklenen iyi durum: `message(mid/text) -> 1 job(s)`.

## 4. Sıradaki işler (öncelik sırasıyla)

1. **Instagram'da mesajın bota ulaştığını kanıtla.**
   - Uygulamada rolü olan bir test hesabından Atilla'ya DM at, ardından Vercel → Logs'ta `message(...) -> 1 job(s)` satırını ara. Meta uygulaması *Development* modundaysa yalnızca rolü olan hesapların mesajları gelir. Yabancı müşteriler için App Review ve *Live* mod gerekir.
   - Yalnızca `read`/`reaction` geliyorsa:
     - Vercel → Settings → Cron Jobs → `/api/cron/instagram-token` → **Run** ile çalıştır. Cevapta `webhooks: {"status":"subscribed"}` olmalı; bu, hesabı `messages`, `messaging_postbacks` ve `comments` alanlarına abone eder.
     - Meta uygulamasının webhook alanlarında `messages`'ın işaretli olduğunu doğrula.
     - Manychat'in mesajları kendine alıp almadığını kontrol et. İkisi aynı DM'e cevap vermemeli.
2. **WhatsApp Cloud API** (ayrı numara): `docs/concierge-setup.md` §3. İki şablon (`concierge_alert`, `booking_update`) onaylanmalı. Bu bitmeden Atilla hiçbir bildirim almaz.
3. **Stripe**: `docs/concierge-setup.md` §5. Webhook endpoint'i `https://atillabarbarossa.com/api/webhooks/stripe`.
4. **Supabase'i doğrula**:
   - 5 migration, `seed.sql` ve `offers.sql` uygulanmış mı? `access_tokens` tablosu var mı?
   - Gerçek turlar, rehberler ve kalkış tarihleri girilmiş mi? (`seed.sql` yalnızca örnek.)
   - `pg_cron` ile `purge_stale_personal_data()` zamanlanmış mı? (§6)
5. **Temizlik**: Vercel'den `INSTAGRAM_ACCOUNT_ID`'yi sil; iletişim formu için `CONTACT_FROM_EMAIL`'i ekle.
6. **Hukuk**: Anthropic, Supabase, Stripe ve Manychat ile AVV/DPA. Gizlilik metni kullanılan servislerle birebir örtüşmeli.
7. **Sonraki aşamalar** (`docs/concierge-setup.md` sonu): tur hatırlatmaları, rehber onayı, yorum isteği, CRM paneli, sesli mesaj dökümü.

## 5. Yeni hesapta çalışmaya başlarken

- Yeni Claude hesabına GitHub'daki `oarslanerbln-pixel/atilla-akg-l` reposuna erişim verin. Vercel bağlayıcısı da bağlanırsa loglar ve değişken adları okunabilir.
- Anahtarları sohbete yapıştırmayın. Değişken eklemek veya değiştirmek Vercel panelinden yapılır.
- `CONCIERGE_ENCRYPTION_KEYS` ve `CONCIERGE_INDEX_KEY` kaybolursa kayıtlı müşteri verisi bir daha okunamaz. Şifre yöneticisinde olduklarından emin olun.

Yeni oturuma yapıştırılabilecek başlangıç mesajı:

> `oarslanerbln-pixel/atilla-akg-l` reposunda Atilla Barbarossa için kurduğumuz Instagram/WhatsApp satış otomasyonuna (AI concierge) devam ediyoruz. Önce `CLAUDE.md`, `docs/automation-handover.md` ve `docs/concierge-setup.md` dosyalarını oku. Devir notundaki "Sıradaki işler" listesinin 1. maddesinden başla: Instagram DM'lerinin bota `message` olayı olarak ulaştığını Vercel loglarıyla kanıtla. Hiçbir anahtarı sohbete yazdırma. Değişiklikleri PR ile yap ve push'tan önce `tsc --noEmit`, `eslint` ve `next build` çalıştır.
