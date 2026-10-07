# Meta App Review: Instagram partner linkleri

Bu dosya, Meta uygulamasını *Live* moda almak için gereken App Review başvurusunu hazırlar. İngilizce bloklar Meta paneline olduğu gibi yapıştırılır. Kapsam, şu an canlıda olan **partner modudur** (`CONCIERGE_AI` kapalı): partner anahtar kelimesi soran bir yorum ya da DM, linkini alır. Yapay zekâ concierge'i bu başvuruya dahil değildir. Açılınca kullanım tarifi değişeceği için o zaman başvuru güncellenir.

## Neden gerekli

Meta'nın webhook kurulum rehberi (developers.facebook.com → Instagram Platform → Webhooks → Setup → *Requirements*, 2026-10-02'de okundu) Instagram Login için üç şart koyar:

- Uygulama **Live** olmalı. *Development* modunda yalnızca uygulamada rolü olan hesapların olayları gelir.
- `instagram_business_*` izinleri için **Advanced Access** gerekir. `comments` bildirimleri Advanced Access olmadan hiç gelmez.
- Üretim erişimi için **işletme doğrulaması** (Business Verification) şarttır.

## Başvurudan önce

| Şart | Durum | Kim |
|---|---|---|
| Uygulama ikonu 1024 × 1024 | yüklendi (2026-10-06, Flow logosu) | tamam |
| Gizlilik politikası URL'si: `https://atillabarbarossa.com/datenschutz` | güncel: §9 yalnızca partner linklerini anlatıyor (Manychat ve yapay zekâ pasajları çıkarıldı). İnceleyen, politikayı başvurudaki kullanımla karşılaştırır. | tamam |
| Uygulama kategorisi | *Business and Pages* ya da panelin önerdiği en yakın kategori | kullanıcı |
| İş e-postası | uygulama iletişim adresi ayarlandı (2026-10-06) | tamam |
| İşletme doğrulaması | açık | Atilla |
| Her izin için en az bir başarılı API çağrısı | `instagram_business_basic`: her üç günde bir film senkronu (`me/media`), sağlanmış. `manage_comments` ve `manage_messages`: tester testindeki yorum cevabı ve DM bunları sağlar. | tester testi |
| Manychat'in Instagram bağlantısı | kesildi (2026-10-06); hesaba bağlı tek uygulama bu | tamam |

İstenmeyecekler: `instagram_business_content_publishing` (uygulama paylaşım yapmıyor) ve *Human Agent* (partner modunda kullanılmıyor). Meta, kullanılmayan bir izin istendiğinde başvurunun tamamını reddeder.

## İzin tarifleri (Meta'ya yapıştırılacak)

### instagram_business_basic

```text
This app is used only by the business that owns it: the Instagram professional account of
Atilla Barbarossa, a travel filmmaker. We use instagram_business_basic to identify that account
(its ID and username) and to read its own media: the permalink and caption of a post when a
comment arrives on it, and the account's newest videos, which are shown in the "Latest films"
section of atillabarbarossa.com. We do not read media or profiles of any other account.
```

### instagram_business_manage_comments

```text
Atilla regularly recommends partner products to his audience (for example a travel credit card
or a city tour). Under a post he invites followers to comment a specific keyword, such as
"GOLDCARD", to receive the link. We receive comment webhooks for posts on Atilla's own account
only. When a comment contains one of these keywords together with a request ("GOLDCARD please"),
the app posts one short public reply under that comment ("Sent you a DM") and sends the link
privately (see instagram_business_manage_messages). Comments without such a request ("Gold ✨",
"Great trip!") get no reply. We never hide, delete or edit comments, and we do not store the
comments that receive no reply.
```

### instagram_business_manage_messages

```text
When a follower asks for a partner link, either in a comment (as above) or in a direct message
or story reply containing the keyword and a request, the app answers in the conversation the
follower started:
1. For a comment, it sends exactly one private reply to that comment: a short description of the
   offer and a quick-reply button "Send me the link".
2. When the follower taps the button, or asked in a direct message, the app sends the link with
   a clear advertising notice ("Ad: this is a partner link...").
The app only replies to messages the follower sent, within the 24-hour messaging window. It never
starts conversations, sends no promotional broadcasts, and does not reply to any other message:
those stay in Atilla's inbox for him to answer personally, and they are not stored by the app.
```

### Uygulama doğrulaması (App verification)

```text
There is no consumer login. The app runs server-side for a single Instagram professional account
(atillabarbarossa), which authorised it once via "Instagram API setup with Instagram login" in the
App Dashboard. To see the integration: comment "GOLDCARD please" under any post of
@atillabarbarossa, or send "platinum please" as a direct message. You will receive the offer
description with a "Send me the link" button, then the link. A message without a keyword, such as
"Hello, how are you?", receives no automated reply. The screencasts show each step.
```

Not: Uygulama inceleme sırasında hâlâ *Development* modunda. İnceleyenin hesabı rol sahibi olmadığı için olaylar ona gelmez. Asıl kanıt ekran kaydıdır. İnceleyen canlı test isterse, verdiği hesap Instagram tester olarak eklenir.

## Ekran kaydı senaryosu

Tek bir kayıt üç izin için de yüklenebilir. Meta her izin için kullanımın görünmesini ister.

Hazırlık:
- Müşteri telefonu: uygulamaya tester olarak eklenmiş bir hesap, Instagram arayüzü **İngilizce**.
- Bilgisayar: Meta paneli ve atillabarbarossa.com.
- **Hiçbir token, gizli anahtar veya telefon numarası ekranda görünmesin.** Panelde token alanı kapalı kalsın.
- Kayıt 2–3 dakika, İngilizce altyazılı: her sahnenin başında kısa bir başlık.

| # | Ekran | Gösterilen | Altyazı (EN) |
|---|---|---|---|
| 1 | Meta paneli → Instagram → *API setup with Instagram login* | Bağlı hesap (atillabarbarossa), webhook alanları `comments`, `messages`, `messaging_postbacks` | "The app is connected to one account: our own." |
| 2 | Atilla'nın bir paylaşımı | Altyazıda "Comment GOLDCARD for the link" çağrısı | "Atilla invites followers to ask for a partner link." |
| 3 | Müşteri telefonu | "GOLDCARD please" yorumu yazılır | "A follower asks for the link in a comment." |
| 4 | Aynı paylaşım | Yorumun altında açık cevap, örn. "Sent you a DM ✨" | "One public reply (instagram_business_manage_comments)." |
| 5 | Müşteri DM kutusu | Teklif açıklaması + **Send me the link** butonu | "One private reply to the comment (instagram_business_manage_messages)." |
| 6 | DM | Butona dokunulur → link ve *Ad:* uyarısı | "The link arrives with an advertising notice." |
| 7 | DM | "platinum please" yazılır → teklif ve link | "Asking in a direct message works the same way." |
| 8 | DM ve yorum | "Hello, how are you?" DM'i ve "Gold ✨" yorumu; otomatik cevap yok | "Without a request, the app stays silent. Atilla answers personally." |
| 9 | atillabarbarossa.com → *Latest films* | Hesabın kendi videoları | "Our own media on our website (instagram_business_basic)." |

Linke kayıtta **tıklanmaz**: tıklama, partner ağında gerçek bir tıklama olarak sayılır ve kendi tıklaması partner şartlarına aykırı olabilir. Linkin görünmesi yeterlidir.

## Sonra

- Başvuru onaylanınca uygulama *Live* moda alınır ve ilk gerçek yorumda loglar kontrol edilir (`docs/concierge-setup.md`).
- Yapay zekâ concierge'i açıldığında (`CONCIERGE_AI=on`) başvuru metinleri tur danışmanlığını da anlatacak şekilde güncellenir. Atilla'nın WhatsApp'tan 24 saat sonrasına cevap verebilmesi gerekiyorsa *Human Agent* o zaman istenir.
