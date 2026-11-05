# NFC kartvizit

Telefon bir web sayfası üzerinden NFC yayınlayamaz: iOS da Android de buna
izin vermiyor. Çözüm fiziksel bir **NFC kart ya da sticker**. Kart
programlandıktan sonra karşındaki kişi onu telefonuna dokundurur ve
kartvizit açılır. Uygulama gerekmez; iPhone'da da Android'de de çalışır.

## Hangi kart?

- **Çip:** NTAG213, NTAG215 ya da NTAG216. Hepsi yeterli, çünkü sadece kısa
  bir adres yazılıyor.
- **PVC ya da ahşap kart:** tek başına 1–3 €. Kartın üzerine kartvizit
  tasarımını bastırabilirsin (`public/brand/` içindeki logolar,
  `public/card/atilla.webp` portresi).
- **Metal kart:** sıradan çip metal üzerinde çalışmaz. Mutlaka
  **"on-metal" / "anti-metal" NFC** yazan bir kart al.
- **Telefon kılıfı sticker'ı:** aynı şekilde "on-metal" olanı seç.

## Karta hangi adres yazılır?

| Kart | Adres |
|---|---|
| Kişisel kart | `https://atillabarbarossa.com/card` |
| İş (B2B) kartı | `https://atillabarbarossa.com/card/business` |
| İngilizce / Türkçe | adresin sonuna `/en` ya da `/tr` ekle (ör. `…/card/business/en`) |

Otellere ve markalara verilecek kart için **İş kartını** öneririm. Kart
kişisel ve iş yüzü arasında zaten geçiş yapabiliyor; sadece hangi yüzle
açılacağını seçmiş olursun.

## Nasıl yazılır?

**Android (Chrome):**

1. `atillabarbarossa.com/card#nfc` adresini aç. Kartın altında "NFC kartı
   yaz" paneli belirir.
2. Kartın açacağı sayfayı seç → **"NFC karta yaz"**.
3. Kartı telefonun arkasına dokundur. "Tamam" mesajını görünce kart hazır.

**iPhone:**

1. App Store'dan ücretsiz **NFC Tools** uygulamasını indir.
2. Write → Add a record → **URL/URI**.
3. Yukarıdaki adresi yapıştır → **Write** → kartı telefonun üst kısmına
   dokundur.

Adresi kopyalamak için iPhone'da da `atillabarbarossa.com/card#nfc` sayfasını
açabilirsin; panel adresi gösterir ve kopyalama düğmesi sunar.

**İpucu:** kartı yazdıktan sonra NFC Tools'ta **"Lock tag"** ile kilitlersen
kimse kartın adresini değiştiremez. Bu kalıcıdır; önce kartı bir kez test
et.

## Neden adres, kartın kendisi değil?

Kart yalnızca bir adres taşır. Numara, fotoğraf ya da metin değişirse siteyi
güncellemek yeterli; basılmış kartlar aynı kalır.
