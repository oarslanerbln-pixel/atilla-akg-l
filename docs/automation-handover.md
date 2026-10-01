# Otomasyon – Devir Notu

**Durum tarihi: 1 Ekim 2026.** Bu dosya o günün anlık fotoğrafıdır; kod değiştikçe
`docs/concierge-setup.md` (kurulum adımları) ve `CLAUDE.md` (kurallar) esas alınır.
Burada hiçbir anahtar veya gizli değer yoktur. Değerler yalnızca Vercel'de ve bir şifre
yöneticisinde durur, sohbetlere yapıştırılmaz. Repo herkese açık olduğu için proje
kimlikleri (Vercel/Supabase/Stripe ID'leri) de buraya yazılmaz.

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

- **Kod:** GitHub `oarslanerbln-pixel/atilla-akg-l` (herkese açık), dal `main`. Her değişiklik PR ile gelir; CI (`verify`: tsc, eslint, build) yeşil olmalı.
- **Hosting:** Vercel projesi `atilla-portfolio` (takım `oarslanerbln-pixels-projects`), fonksiyonlar Frankfurt'ta (`fra1`). Canlı alan adı: `atillabarbarossa.com`.
- **Veritabanı:** Supabase projesi `atilla-concierge` (Frankfurt, `eu-central-1`), Vercel entegrasyonu ile bağlı.
- **Ödeme:** Kaporayı tahsil edecek Stripe hesabı henüz bağlı değil (bkz. §4).
- **Geçici çözüm:** Atilla'nın Instagram hesabına anahtar kelime cevapları için **Manychat** bağlı. Gizlilik metninde (`src/app/datenschutz/page.tsx`, bölüm 9 ve 12) geçiyor. Manychat bırakılınca o paragraflar silinmeli.

### Claude'un bağlayıcıları (1 Ekim 2026'da denendi)

| Bağlayıcı | Durum | Ne okunur | Dikkat |
|---|---|---|---|
| GitHub | bağlı | PR'lar, CI | — |
| Vercel | bağlı | runtime logları, değişken **adları**, deploy durumu | Loglar yaklaşık 1 saat tutulur. Sorgu `deploymentId` ve en fazla `since: 6h` ile daraltılmazsa zaman aşımına uğrar. Değişken değerleri asla `decrypt` ile istenmez. Cron elle yalnızca panelden tetiklenir (Settings → Cron Jobs → Run). |
| Supabase | bağlı | şema, satır sayıları, `pg_cron`, güvenlik uyarıları | Migration'lar SQL Editor'den çalıştırıldığı için `list_migrations` boş döner; nesnelerin kendisine bakılır. Kişisel alanlar şifreli; yalnızca sayım sorgulanır. |
| Stripe | bağlı, ama yalnızca bir **test sandbox'ına** | ürünler, ödemeler, webhook endpoint'leri | Gerçek hesap bağlanana kadar canlı durum okunamaz. |
| Resend | bağlı değil | iletişim formu: alan adı doğrulaması, teslimat kayıtları | claude.ai → Connectors'dan eklenebilir. |
| Meta (Instagram, WhatsApp) | bağlayıcısı yok | — | Gözlem Vercel loglarından yapılır (`[concierge] webhook …`). Meta paneli Claude'un yerleşik tarayıcısında, kullanıcının oturumuyla okunur; her değişiklik açık onayla. Giriş, doğrulama kodları, PIN, token ve ödeme bilgisi yalnızca kullanıcıda kalır. |

## 3. Canlı durum (1 Ekim 2026, bağlayıcılarla okundu)

### Vercel'de tanımlı değişkenler (production)
`SITE_URL`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ entegrasyonun diğer Supabase/Postgres değişkenleri),
`CONCIERGE_ENCRYPTION_KEYS`, `CONCIERGE_INDEX_KEY`, `META_VERIFY_TOKEN`, `META_GRAPH_VERSION`, `INSTAGRAM_ACCESS_TOKEN`,
`INSTAGRAM_APP_SECRET`, `IG_COMMENT_KEYWORDS`, `STAFF_WHATSAPP`, `TOUR_TIMEZONE`, `CRON_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`CONTACT_FROM_EMAIL` (30 Eylül'de eklendi, 1 Ekim deploy'unda etkin).

### Eksik olanlar ve etkisi
| Eksik değişken | Etkisi |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` | WhatsApp kanalı hiç çalışmıyor. **Atilla'ya giden bütün bildirimler** (müşteri devri, token yenileme hatası, ödeme) WhatsApp'tan gittiği için şu an **ulaşmıyor**. |
| `META_APP_SECRET` | WhatsApp olayları Meta uygulamasının kendi App Secret'ı ile imzalanır; Instagram'ın ayrı secret'ı bunları doğrulamaz. WhatsApp kurulurken eklenmeli. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Kapora linki oluşturulamıyor, ödeme onayı işlenemiyor. Rezervasyon akışı Stripe'ta kırılıyor. |

### Kullanılmayan değişkenler
- `INSTAGRAM_ACCOUNT_ID`: kod okumuyor (hesap token'dan alınıyor). Silinebilir.
- `BLOB_READ_WRITE_TOKEN` ise kullanılıyor: `main`'deki reels senkronu (`src/lib/reels/`, `/api/cron/instagram-reels`) Vercel Blob'a yazar. Silinmez.

### Supabase
- Şema tam: 5 migration'ın bütün nesneleri yerinde (12 tablo, 2 görünüm, `search_path=''` ile 3 fonksiyon, sub-id'siz link kısıtı, `access_tokens`).
- `offers.sql` uygulanmış: 5 partner teklifi aktif (`amex-gold`, `amex-platinum`, `gyg-app`, `gyg-berlin-gendarmenmarkt`, `skyscanner`).
- **Turlar hâlâ örnek:** `seed.sql`'in 3 turu pasif (`active = false`); 2 "Sample Guide" rehberi ve 255 ileri tarihli örnek kalkış duruyor. Bot şu an tur satamaz, yalnızca partner linkleri çalışır.
- `pg_cron`: `concierge-purge` her gün 03:30 UTC'de çalışıyor; son çalışma 1 Ekim 03:30, başarılı.
- Instagram token'ı `access_tokens`'ta: 30 Eylül 17:38 UTC'de yenilendi, 29 Kasım 2026'da doluyor. Haftalık cron uzatmaya devam eder.
- `contacts`, `messages`, `bookings`: **0 satır**. Bot şimdiye kadar tek bir konuşma işlemedi.
- Güvenlik uyarıları yalnızca bilgi seviyesinde: "RLS açık, policy yok" (12 tablo). Bu bilerek böyle; `anon`/`authenticated` tamamen kapalı, yalnızca sunucu erişir.

### İletişim formu ve e-posta
- Resend'de `atillabarbarossa.com` 30 Eylül'de eklendi, bölge `eu-west-1` (İrlanda). DNS checkdomain'de ve gereken kayıtların hepsi yayında: `resend._domainkey` (DKIM), `send` alt alan adında MX ve SPF. Resend'deki durum **"Not Started"**, yani doğrulama hiç başlatılmamış. Alan adına girip **Verify DNS Records**'a basmak yeterli.
- Ana alan adının MX kaydı yine kendisini gösteriyor; o da Vercel'e (`76.76.21.21`) çıkıyor. Vercel posta kabul etmez: `@atillabarbarossa.com` adreslerine gönderilen e-posta **hiçbir yere ulaşmaz**. `CONTACT_TO_EMAIL` bu alan adında olmamalı (sitedeki açık adres `a@barbarossafilms.de`).

### Meta uygulaması (1 Ekim, panelden okundu)
- Mod: Development (yayınlanmadı). İşletme portföyü doğrulanmadı.
- Instagram webhook alanları: `messages`, `comments`, `live_comments`, `message_edit`, `message_reactions`, `messaging_postbacks`, `messaging_referral`, `messaging_seen` ve 17:12 UTC'den beri `standby`.
- İzinler (Standard Access): `instagram_business_basic`, `instagram_business_manage_comments` (1 Ekim'de eklendi), `instagram_business_manage_messages`. Sonuncusuyla henüz **hiç API çağrısı yapılmadı**; App Review için en az bir başarılı çağrı gerekir.
- Settings → Basic: gizlilik ve veri silme URL'si `/datenschutz`. Kullanım koşulları URL'si `facebook.com` olarak kalıyor, çünkü Meta boş değeri kabul etmiyor; gerçek bir AGB sayfası gelince değiştirilir. İncelemeye göndermenin önündeki tek eksik **1024×1024 uygulama ikonu**.
- Kullanım senaryoları: Marketing API, App Ads, WhatsApp, Embed, Instagram. Panel silmeye izin vermiyor; kalmaları zararsız. **Marketing API → Einstellungen'deki "Entfernen" işletme portföyünü uygulamadan koparır; tıklanmaz.**
- WhatsApp: senaryo ve izinler hazır, ama portföyde henüz **WhatsApp Business hesabı (WABA) ve sistem kullanıcısı yok**.

### Instagram webhook teşhisi (1 Ekim, 14:54–17:52 UTC)
- 14:54–15:31: 7 teslimat, hepsi 200 ve imzası doğrulandı: 6× `read(mid)`, 1× `message_edit(mid/text/num_edit)`, **0× `message`**. Hepsi `-> 0 job(s)`.
- 15:22'deki `message_edit` gerçek bir DM konuşmasının olduğunu gösteriyor, ama mesajın kendisi bize hiç gelmedi. Hesap aboneliği çalışıyor; eksik olan yalnızca `messages` olayı.
- 17:12'de `standby` abone yapıldı. 17:52'ye kadar yalnızca 2× `reaction` geldi (17:40, 17:41); `message` ve `standby` yok. Tepkiler, tester hesabının olaylarının Development modunda da ulaştığını gösteriyor.
- Olası nedenler:
  1. **Manychat konuşmaları tutuyor.** Bir hesaba birden fazla uygulama bağlıyken mesajlar varsayılan uygulamaya gider; diğerleri mesajı yalnızca `standby` kanalından görür. En olası neden bu.
  2. **`messages` alanı abone değil.** Elendi: panelde abone olduğu doğrulandı.
  3. **Uygulama Development modunda** ve yazan kişinin uygulamada rolü yok. Gerçek müşteriler için geçerli, tester için değil.
- Ayırt edici test: tester hesabından Atilla'ya DM atılır, Claude aynı dakikada logları okur. `message(...) -> 1 job(s)` gelirse mesajı bizim uygulama alıyor (yabancılar için App Review ve *Live* mod kalır). `standby(...)` gelirse ya da hiçbir şey gelmezse mesajı Manychat tutuyor: Manychat'in DM otomasyonu sakin bir saatte kısa süre kapatılıp test tekrarlanır. Aynı pencere `instagram_business_manage_messages` için gereken ilk API çağrısına ve App Review ekran kaydına da kullanılır.
- Her teslimat şu satırı loglar (kimlik ve metin olmadan, yalnızca alan adları):
  `[concierge] webhook instagram: <olay şekli> -> N job(s)`. Beklenen iyi durum: `message(mid/text) -> 1 job(s)`.

## 4. Sıradaki işler (öncelik sırasıyla)

1. **Instagram `message` olayını bota ulaştır** (kritik; bkz. §3 teşhis).
   - Webhook alanları tamam (§3, Meta uygulaması). Tester hesabıyla DM testi yapılır, loglar aynı dakikada okunur.
   - Instagram → Ayarlar → Mesajlar → Bağlı araçlar: Manychat mesajları kendine alıyor mu? Concierge devralacaksa Manychat'in DM otomasyonları kapatılır veya bizim uygulama varsayılan yapılır. İkisi aynı DM'e cevap vermemeli.
   - Yabancı müşteriler için App Review ve *Live* mod. Sıra: uygulama ikonunu yükle, `instagram_business_manage_messages` ile ilk başarılı çağrıyı yap, ekran kaydını hazırla, işletmeyi doğrula, gönder.
2. **WhatsApp Cloud API** (ayrı numara): `docs/concierge-setup.md` §3. `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` ve `META_APP_SECRET` girilir; iki şablon (`concierge_alert`, `booking_update`) onaylanmalı. Bu bitmeden Atilla hiçbir bildirim almaz.
   - Sıfırdan başlanıyor (§3, Meta uygulaması). Öneri: önce Meta'nın test numarasıyla uçtan uca deneme, sonra gerçek numara. Aynı sistem kullanıcısı token'ı ikisinde de çalışır; geçişte yalnızca `WHATSAPP_PHONE_NUMBER_ID` değişir.
   - Numara: Atilla'nın kişisel numarası değil (o `STAFF_WHATSAPP` olarak kalır), WhatsApp'ta aktif değil, SMS veya arama alabiliyor.
   - Şablon gövdesi değişkenle başlayamaz ve bitemez. `concierge-setup.md` §3'teki iki örnek `{{1}}` ile bitiyor; sonlarına sabit bir cümle eklenir (metni kullanıcı onaylar). Dil "English" (`en`) seçilir, "English (US)" değil: kod `de`/`en`/`tr` gönderir. Şablonlar WABA'ya bağlıdır, doğrudan gerçek hesapta oluşturulur.
3. **Stripe**: önce kaporayı hangi hesabın tahsil edeceğine karar verilir (Atilla'nın işletmesine ait olmalı). Akış test modunda uçtan uca denenir, sonra canlı anahtarlar girilir: `docs/concierge-setup.md` §5. Webhook endpoint'i tam olarak `https://atillabarbarossa.com/api/webhooks/stripe` olmalı: ana adres yönlendirmesiz cevap veriyor ve Stripe yönlendirme takip etmez. API sürümü `2026-08-26.dahlia` (`stripe@22.6.2` bu sürüme sabit). Test sandbox'ındaki endpoint'i 1 Ekim'de Claude bağlayıcıyla açtı (kullanıcının açık onayıyla). İmzalama anahtarı Dashboard'dan alınıp Vercel'e kullanıcı tarafından girilir; canlı hesapta endpoint yeniden açılır. SEPA açılmaz (bkz. `concierge-setup.md` §5). Claude'un Stripe bağlayıcısı da o hesaba bağlanmalı.
4. **Gerçek turlar**: Table Editor'den gerçek turlar, fiyatlar, rehberler ve kalkış tarihleri girilir, turlar `active = true` yapılır; örnek turlar, "Sample Guide" rehberleri ve örnek kalkışlar silinir.
5. **Temizlik**: Vercel'den `INSTAGRAM_ACCOUNT_ID`'yi sil. İletişim formu: önce Resend'de alan adını doğrula (DNS hazır, bkz. §3), sonra bir test mesajı gönder. Bir AGB sayfası (kapora alınan tur satışında zaten gerekli) Meta'daki kullanım koşulları alanını da düzeltir.
6. **Teşhisi kalıcı yap** (öneri): Vercel logları yaklaşık 1 saat yaşadığı için "dün DM geldi mi?" sorusu sonradan cevaplanamıyor. Webhook olay şekilleri (kişisel veri olmadan, yalnızca alan adları ve zaman) Supabase'de kısa süreli bir tabloda tutulabilir.
7. **Hukuk**: Anthropic, Supabase, Stripe ve Manychat ile AVV/DPA. Gizlilik metni kullanılan servislerle birebir örtüşmeli.
8. **Sonraki aşamalar** (`docs/concierge-setup.md` sonu): tur hatırlatmaları, rehber onayı, yorum isteği, CRM paneli, sesli mesaj dökümü.

## 5. Yeni hesapta çalışmaya başlarken

- Claude'a GitHub, Vercel ve Supabase bağlayıcıları bağlanmalı (§2). Loglar, değişken adları ve veritabanı durumu onlarla doğrudan okunur.
- Anahtarları sohbete yapıştırmayın. Değişken eklemek veya değiştirmek Vercel panelinden yapılır.
- `CONCIERGE_ENCRYPTION_KEYS` ve `CONCIERGE_INDEX_KEY` kaybolursa kayıtlı müşteri verisi bir daha okunamaz. Şifre yöneticisinde olduklarından emin olun.

Yeni oturuma yapıştırılabilecek başlangıç mesajı:

> `oarslanerbln-pixel/atilla-akg-l` reposunda Atilla Barbarossa için kurduğumuz Instagram/WhatsApp satış otomasyonuna (AI concierge) devam ediyoruz. Önce `CLAUDE.md`, `docs/automation-handover.md` ve `docs/concierge-setup.md` dosyalarını oku. Devir notundaki "Sıradaki işler" listesinin 1. maddesinden başla: Instagram DM'lerinin bota `message` olayı olarak ulaştığını Vercel loglarıyla kanıtla. Hiçbir anahtarı sohbete yazdırma. Değişiklikleri PR ile yap ve push'tan önce `tsc --noEmit`, `eslint` ve `next build` çalıştır.
