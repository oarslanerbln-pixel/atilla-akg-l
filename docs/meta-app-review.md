# Meta App Review: Instagram partner linkleri

Hedef: reel `Dd1hMBzt3q7`'nin altına **LOUNGE** (ya da başka bir partner anahtar kelimesi) yazan **her takipçi** linkini DM'den otomatik alsın. Bugün yalnızca uygulamada rolü olan hesaplar alıyor, çünkü Meta uygulaması *Development* modunda. Bu dosya, uygulamayı *Live* moda alacak App Review başvurusunu hazırlar: kontrol listesi, Meta'ya yapıştırılacak İngilizce metinler ve ekran kaydı senaryosu.

Kapsam, canlıdaki **partner modudur** (`CONCIERGE_AI` kapalı): partner anahtar kelimesi isteyen bir yorum, DM ya da story cevabı linkini alır. Yapay zekâ concierge'i bu başvuruya dahil değildir. Açılınca kullanım tarifi değişeceği için başvuru o zaman güncellenir.

## Neden gerekli

Meta'nın dokümanları (2026-10-27'de okundu):

- **Live mod.** *Set up Instagram Webhooks → Requirements*: uygulama bildirimleri ancak *Live* iken alır. *Development* modunda yalnızca uygulamada rolü olan hesapların tetiklediği olaylar gelir.
- **Advanced Access.** Aynı sayfa Instagram Login için erişim düzeyini "Advanced Access" olarak koyar; *Limitations* kısmı `comments` bildirimleri için Advanced Access'i ayrıca şart koşar. *App Review* sayfası kendi işletmesine hizmet eden bir uygulamaya Standard Access'in yettiğini söylese de webhook şartı Advanced Access olduğu için başvuru üç iznin Advanced Access'i içindir.
- **Advanced Access istemeden önce her izinde en az bir başarılı API çağrısı.**
- **İşletme doğrulaması** üretim erişimi için şart: tamam (aşağıda).
- **Hesap herkese açık olmalı.** Gizli hesapların paylaşımlarına yorum bildirimi gelmez.

Panel de aynısını söylüyor (*Instagram API → API-Einrichtung mit Instagram-Login*, 5. adım): Instagram için uygulama, canlı verilere ancak App Review tamamlandıktan sonra erişir; Advanced Access App Review ile gelir. Uygulamayı inceleme olmadan yayınlamak LOUNGE sorununu çözmez, çünkü Standard Access ile `comments` bildirimi gelmez.

## Kodun kullandığı izinler

Yalnızca bu üç izin istenir. Kullanılmayan bir izin istenirse Meta başvurunun tamamını reddedebilir.

| İzin | Kodun yaptığı | Nerede |
|---|---|---|
| `instagram_business_basic` | Hesabın kimliği ve kullanıcı adı (`me?fields=username`, günlük durum kontrolü); hesabın kendi filmleri (`me/media`, üç günde bir, sitedeki *Latest films*); yorum gelen paylaşımın linki ve açıklaması (`{media-id}?fields=permalink,caption`; LOUNGE'un doğru reel'in altında olup olmadığı buradan anlaşılır); token yenileme; hesabın webhook aboneliği (`me/subscribed_apps`). Diğer iki iznin webhook alanları da bu izni ister. | `concierge/status.ts`, `reels/sync.ts`, `concierge/meta.ts`, `concierge/offers.ts`, `concierge/tokens.ts` |
| `instagram_business_manage_comments` | `comments` webhook'u; anahtar kelimeli yorumun altına tek kısa açık cevap (`POST /{comment-id}/replies`). | `concierge/inbound.ts` (`handleInstagramComment`), `concierge/meta.ts` |
| `instagram_business_manage_messages` | `messages` ve `messaging_postbacks` webhook'ları; yoruma tek özel cevap (`POST /me/messages`, `recipient.comment_id`); butona dokunulunca, DM'de ya da story cevabında link (`recipient.id`). | `concierge/inbound.ts`, `concierge/offers.ts`, `concierge/meta.ts` |

İstenmeyecekler: `instagram_business_content_publishing` (uygulama paylaşım yapmıyor), `instagram_business_manage_insights` (istatistik okunmuyor), *Human Agent* (partner modunda kullanılmıyor). `message_echoes` alanına abone olunmuyor (`INSTAGRAM_WEBHOOK_FIELDS`, `meta.ts`); kod onu yalnızca yapay zekâ açıkken işler.

Anahtar kelime kuralı (`keywordRequest`, `offers.ts`): yorum ya da mesaj yalnızca anahtar kelimeden, isterse rica kelimelerinden ("please", "bitte", "lütfen", "link", "dm" …) oluşmalı. "LOUNGE" ve "LOUNGE please" tetikler; "The lounge looks amazing!" tetiklemez. LOUNGE yalnızca reel `Dd1hMBzt3q7`'nin yorumlarında geçerlidir (`media_codes`); DM'de LOUNGE cevapsız kalır, DM örneği bu yüzden PLATINUM'dur.

## Kontrol listesi

Uygulama: **atilla concierge** (App-ID `1946000619946908`, portföy "Atilla"). Paneldeki durum 2026-10-27'de okundu; hiçbir ayar değiştirilmedi.

Durum: ✅ tamam · ❌ eksik · ⚠️ karar ya da düzeltme gerekiyor. "Panel yöneticisi" Meta uygulamasında yönetici rolü olan kişidir.

| # | Adım | Durum | Kim |
|---|---|---|---|
| 1 | İşletme doğrulaması (portföy "Atilla") | ✅ doğrulandı, 2026-10-25 (Security Center: "Verifiziert", "Ursprünglich verifiziert am Oct 25, 2026"; 2026-10-26'da okundu). Onaylanan üçüncü gönderim 2026-10-24'teydi: Einzelunternehmen, "Registriert", web sitesi `https://atillabarbarossa.com`, Personalausweis. İlk gönderim (ret 2026-10-11'de görüldü) ve Gewerbeanmeldung ile ikinci gönderim (2026-10-16), belgeler "kabul edilen türde değil" gerekçesiyle reddedilmişti. | — |
| 2 | App Review | ❌ **hiç gönderilmedi** (*App-Review → Einreichungen*: "Nicht eingereicht", geçmiş başvuru yok) | — |
| 3 | Instagram izinlerinin erişim düzeyi | ❌ üçü de Standard Access ("Bereit zum Testen"). Advanced Access henüz istenmedi; taslak başvuruda Instagram izni yok. | panel yöneticisi |
| 4 | Her izinde en az bir başarılı API çağrısı | `instagram_business_basic` ✅ 1,3 bin · `instagram_business_manage_comments` ✅ 1,1 bin · `instagram_business_manage_messages` ❌ **0**. Bu sıfır kalırken o izin için Advanced Access istenemez. Demek ki bir yoruma özel cevap ya da DM şimdiye kadar hiç başarıyla gitmedi. Çözüm: aşağıdaki *Prova*. Panelin sayıyı güncellemesi 24 saate kadar sürebilir. | tester hesabı |
| 5 | Taslak başvurudaki oEmbed izinleri | ⚠️ *Neue Anfragen* altında yalnızca "Meta oEmbed Read" ve "Threads oEmbed Read" duruyor. Kod oEmbed kullanmıyor (filmler Vercel Blob'dan geliyor). Gönderimden önce bu iki izin başvurudan çıkarılmalı ("entfernen"), ya da oEmbed kullanım senaryosu kaldırılmalı. Kullanılmayan bir izin başvurunun tamamını riske atar. | panel yöneticisi |
| 6 | Diğer kullanım senaryoları | ⚠️ Uygulamada ayrıca *Marketing API*, *App Ads*, *WhatsApp* ve *oEmbed* senaryoları ekli. Meta artık her başvuruda uygulamanın tamamını inceliyor (mevcut erişim, ikon, ad, gizlilik ve veri silme URL'leri). Kullanılmayanlar kaldırılabilir; WhatsApp concierge için planlı. Karar kullanıcının. | panel yöneticisi |
| 7 | Uygulama modu | Development ("In Entwicklung", *Veröffentlichen*: "Unveröffentlicht"). *Veröffentlichen* sayfası "Alle notwendigen App-Einstellungen sind abgeschlossen" diyor. Live'a alma onaydan sonra yapılır. | panel yöneticisi |
| 8 | Uygulama kategorisi | ✅ "Messenger Bots für Unternehmen" | — |
| 9 | Gizlilik politikası URL'si | ✅ `https://atillabarbarossa.com/datenschutz`. Sayfa güncel: §9 Instagram otomatik cevapları, §10 partner linkleri, §13 saklama (24 ay), §15 haklar. | — |
| 10 | Veri silme talimatı URL'si | ✅ `https://atillabarbarossa.com/datenschutz`. İsteğe bağlı: `https://atillabarbarossa.com/datenschutz/en#rights` (§15, İngilizce, doğrudan silme hakkına iner). | — |
| 11 | Uygulama ikonu 1024 × 1024 | ✅ `atilla-barbarossa-app-icon-1024.png` | — |
| 12 | İletişim e-postası (sonuç buraya gelir) | ✅ ayarlı | — |
| 13 | Kullanım koşulları URL'si | ✅ boş; zorunlu değil, sitede AGB sayfası yok | — |
| 14 | Instagram Tester hesapları | ✅ hesabın kendisinin yanında iki tester daveti kabul etmiş, bir davet bekliyor (*App-Rollen → Rollen*) | — |
| 15 | Bağlı hesap ve webhook | ✅ @atillabarbarossa bağlı, *Webhook-Abonnement: Ein*. Callback `https://atillabarbarossa.com/api/webhooks/meta`. Uygulama düzeyinde `comments`, `messages` ve `messaging_postbacks` abone. Bunların yanında `live_comments`, `message_edit`, `message_reactions`, `messaging_referral`, `messaging_seen` ve `standby` da abone; kod bunları yok sayar. İsteğe bağlı olarak kapatılabilirler. | — |
| 16 | Kurulum türü | Panel *API setup with Instagram login* kurulumunu artık "legacy" diye işaretliyor ve *Unified login*'i öneriyor. Kurulum çalışmaya devam ediyor; şimdilik bir şey yapmak gerekmiyor. | — |
| 17 | Hesap ve reel `Dd1hMBzt3q7` herkese açık; reel LOUNGE yazmaya çağırıyor | telefonda teyit edilecek | hesap sahibi |
| 18 | Teklif `amex-platinum-lounge` Supabase'de aktif | ✅ PR #81 ile canlı | — |
| 19 | İzin tarifleri ve inceleyen talimatı | ✅ taslak aşağıda; panele yapıştırılacak | panel yöneticisi |
| 20 | Ekran kaydı | ❌ senaryo aşağıda | tester hesabı + kaydı birleştiren kişi |
| 21 | *Allowed usage* onay kutuları ve **Submit for review** | ❌ | panel yöneticisi (Claude tıklamaz) |
| 22 | Onaydan sonra Live mod | ❌ | panel yöneticisi |
| 23 | Rolü olmayan bir hesapla canlı test (aşağıda *Onaydan sonra*) | ❌ | rolsüz bir hesabın sahibi |
| 24 | LOUNGE reklamı | 23 başarılı olmadan başlatılmaz | — |

### Sıra

1. **Prova** (aşağıda *Ekran kaydı → Hazırlık*): kabul etmiş bir tester hesabı LOUNGE yazar, butona dokunur, PLATINUM DM'i atar. Özel cevap gelirse `manage_messages` sayacı sıfırdan çıkar. Gelmezse önce @atillabarbarossa'nın Instagram ayarlarında *Messages → Connected tools → Allow access to messages* açık mı diye bakılır (`docs/concierge-setup.md` §4.6), sonra Vercel loglarına.
2. Ekran kaydı.
3. Panelde üç izin için Advanced Access istenir, oEmbed izinleri başvurudan çıkarılır, metinler ve kayıt eklenir.
4. Kullanılmayan kullanım senaryolarına karar verilir.
5. **Submit for review** (panel yöneticisi).
6. Onay → Live → rolsüz hesapla test → reklam.

## İzin tarifleri (Meta'ya yapıştırılacak)

### instagram_business_basic

```text
This app is used only by the business that owns it: the Instagram professional account
@atillabarbarossa of Atilla Barbarossa, a travel filmmaker. It is not offered to other accounts
and has no consumer login. We use instagram_business_basic to:
- identify that account (its ID and username) and keep its webhook subscription active;
- read the permalink and caption of our own post or reel when a comment arrives on it, so the
  app knows which reel the comment belongs to (some keywords are valid under one reel only);
- read the account's newest videos, which are shown in the "Latest films" section of
  atillabarbarossa.com.
We do not read media, profiles or insights of any other account.
```

### instagram_business_manage_comments

```text
Atilla recommends selected partner products in his reels and invites viewers to request the link
with a keyword. Example: our Priority Pass reel (https://www.instagram.com/reel/Dd1hMBzt3q7/)
asks viewers to comment "LOUNGE" to receive the link. We receive comment webhooks only for posts
of our own account. When a comment consists of such a keyword, alone or with a polite word
("LOUNGE", "LOUNGE please"), the app:
1. posts one short public reply under that comment ("Sent you a DM ✨"), so other viewers can
   see the request was answered, and
2. sends the link privately (see instagram_business_manage_messages).
Comments that only mention the word ("The lounge looks amazing!") or contain no keyword get no
automated reply; Atilla answers them personally. We never hide, delete or edit comments, and we
do not store comments that receive no reply.
```

### instagram_business_manage_messages

```text
The app sends messages only in reply to a person who asked for a partner link:
1. Comment: for a keyword comment (see instagram_business_manage_comments) it sends exactly one
   private reply to that comment: a short description of the offer and a quick-reply button
   "Send me the link".
2. When the person taps the button, the app sends the link in that conversation together with an
   advertising notice ("Ad: this is a partner link. If you book or sign up through it, Atilla
   earns a commission at no extra cost to you.").
3. Direct message or story reply: a message that consists of a keyword, alone or with a polite
   word ("PLATINUM please"), receives the description and the link at once.
Every message answers something the person sent, within the 24-hour messaging window. The app
never starts conversations, sends no broadcasts or follow-ups, and does not answer any other
message: those stay in Atilla's inbox for him to answer personally, and the app does not store
them. For a link request we store the person's Instagram ID and the request, encrypted, to
attribute partner commissions; they are deleted 24 months after the last message, as described
in our privacy policy.
```

### İnceleyen için talimat (App verification)

```text
There is no consumer login and nothing to install. The app runs server-side for one Instagram
professional account, @atillabarbarossa, which connected it once through "API setup with
Instagram login" in the App Dashboard. The integration is used inside Instagram:

1. Open https://www.instagram.com/reel/Dd1hMBzt3q7/ and comment: LOUNGE
2. Within a few seconds @atillabarbarossa replies publicly under your comment, and you receive a
   private reply with a short description and a "Send me the link" button (if you do not follow
   the account, it may appear under message requests).
3. Tap "Send me the link": the partner link arrives with an advertising notice.
4. Send the direct message "PLATINUM please" to @atillabarbarossa: you receive the description
   and the link at once.
5. A comment such as "The lounge looks amazing!" or a message such as "Hello" gets no automated
   reply.

Until approval the app is in Development mode, so Instagram delivers these events only for
accounts with a role on the app. The screencasts show every step with a tester account. If you
would like to test yourself, tell us an Instagram username and we will add it as an Instagram
Tester.
```

## Ekran kaydı

Meta her izin için uçtan uca kullanımı gösteren bir kayıt ister. Tek bir kayıt hazırlanıp üç izne de yüklenebilir; hangi sahnenin hangi izni gösterdiği altyazıda yazar.

**Hazırlık**
- **Tester hesabı:** daveti kabul etmiş tester hesaplarından biri (madde 14; kullanıcı adları panelde, *App-Rollen → Rollen*). Rolü olmayan bir hesaba olay gelmez, kayıt boşa gider. Yeni bir tester eklenirse daveti Instagram'da kabul eder: *Settings → Website permissions → Apps and websites → Tester invites*.
- **Dil:** tester telefonunda Instagram arayüzü İngilizce. Cevabın dili kişinin ilk mesajında kaydedilir: tester daha önce Almanca ya da Türkçe yazdıysa cevaplar o dilde gelir. Bu durumda başka bir tester hesabı kullanılır.
- **Prova:** kayıttan önce bir kez yorum + butona dokunma + DM. Bu, madde 4'teki eksik `manage_messages` çağrısını da yapar. Vercel loglarında `[concierge] webhook instagram: change:comments -> 1 job(s)` satırı görünmeli (loglar yaklaşık bir saat tutulur, prova sırasında bakılmalı).
- **Ekranda görünmeyecekler:** token, App Secret, telefon numarası, e-posta adresi, bildirimler (rahatsız etme modu açık). Panelde token alanı kapalı kalır.
- **Biçim:** telefonun kendi ekran kaydı + bilgisayar ekran kaydı, sonra tek videoda birleştirilir. 2–3 dakika, MP4, 1080p, her sahnenin başında kısa İngilizce başlık.
- **Linke tıklanmaz.** Tıklama partner ağında gerçek bir tıklama sayılır ve kendi tıklaması partner şartlarına aykırı olabilir. Linkin görünmesi yeterli.

| # | Ekran | Gösterilen | Altyazı (EN) | İzin |
|---|---|---|---|---|
| 1 | Bilgisayar: Meta paneli → Instagram → *API setup with Instagram login* | Bağlı hesap @atillabarbarossa (*Webhook-Abonnement: Ein*); abone alanlar arasında `comments`, `messages`, `messaging_postbacks`. Tester hesapları da listede görünür; altyazı onları test hesabı olarak anar. | "The app serves one Instagram account, our own. The others are test accounts." | basic |
| 2 | Telefon (tester): reel `Dd1hMBzt3q7` | Reel ve LOUNGE çağrısı | "Our reel invites viewers to comment LOUNGE for the link." | — |
| 3 | Telefon | "LOUNGE" yorumu yazılıp gönderilir | "A viewer comments the keyword." | manage_comments |
| 4 | Telefon: yorumlar yenilenir | @atillabarbarossa'nın açık cevabı ("Sent you a DM ✨" ya da benzeri) | "The app posts one short public reply." | manage_comments |
| 5 | Telefon: DM kutusu (gerekirse *Requests*) | Özel cevap: Amex Platinum açıklaması, "Tap the button below and I'll send you the link.", **Send me the link** butonu | "One private reply to the comment, with a button." | manage_messages |
| 6 | Telefon: DM | Butona dokunulur → "Here is your link to American Express Platinum Card:" + `atillabarbarossa.com/go/…` + *Ad:* uyarısı | "The link arrives with an advertising notice." | manage_messages |
| 7 | Telefon: DM | "PLATINUM please" yazılır → açıklama ve link | "Asking in a direct message works the same way." | manage_messages |
| 8 | Telefon | Aynı reel'e "The lounge looks amazing!" yorumu, DM'e "Hello"; 15 saniye beklenir, yenilenir: cevap yok | "Without a keyword request, the app stays silent. Atilla answers personally." | manage_comments, manage_messages |
| 9 | Bilgisayar: atillabarbarossa.com → *Latest films* | Hesabın kendi videoları | "Our own videos on our website." | basic |

## Gönderim

Panelde *Anwendungsfälle → Messaging und Content auf Instagram verwalten → Anpassen → Berechtigungen und Features*: üç iznin her biri için *Optionen* menüsünden Advanced Access istenir. İzinler böylece *Überprüfung → App-Review* sayfasında *Neue Anfragen* altına düşer. Orada oEmbed izinleri çıkarılır (madde 5); her izne yukarıdaki metin ve kayıt eklenir, *Allowed usage* onaylanır, ardından inceleyen talimatı girilir. **Submit for review** düğmesine panel yöneticisi basar; Claude başvuruyu göndermez, modu değiştirmez, ayarları kullanıcının sohbetteki açık onayı olmadan değiştirmez.

İnceleme genellikle birkaç gün sürer. Ret gelirse gerekçe iş e-postasına ve panele düşer; metin ya da kayıt düzeltilip yeniden gönderilir.

## Onaydan sonra

1. Panel yöneticisi uygulamayı *Live* moda alır (*App Settings → Basic → App Mode*, ya da panelin üst çubuğu).
2. **Rolü olmayan** bir hesap (uygulamada rolü olmayan herhangi biri) reel `Dd1hMBzt3q7`'nin altına LOUNGE yazar. Beklenen: açık cevap, özel cevap, butona dokununca link. Vercel loglarında `-> 1 job(s)` satırı.
3. Bu test geçince LOUNGE reklamı başlatılabilir.
4. Yapay zekâ concierge'i açıldığında (`CONCIERGE_AI=on`) metinler tur danışmanlığını da anlatacak şekilde güncellenir. Atilla'nın 24 saatten sonra cevap verebilmesi gerekirse *Human Agent* o zaman istenir.
