# Dijital kartvizit: Apple Wallet ve Google Wallet kurulumu

Kartvizit sayfası `atillabarbarossa.com/card` adresinde (`/card/en`, `/card/tr`).
Sayfada üç düğme var:

| Düğme | Çalışması için gereken | Ortam değişkenleri |
|---|---|---|
| Kişilere kaydet (.vcf) | Hiçbir şey, hemen çalışır | — |
| Apple Cüzdan'a ekle | Apple Developer Program üyeliği (yıllık ücretli) ve bir Pass Type ID sertifikası | `APPLE_*` |
| Google Cüzdan'a ekle | Google Pay & Wallet Console'da ücretsiz issuer hesabı ve bir service account | `GOOGLE_WALLET_*` |

Bir Wallet'ın değişkenleri eksikse o düğme sayfada hiç görünmez, endpoint'i
503 döner. Sahte bir düğme gösterilmez. Değişkenleri Vercel'e ekledikten sonra
**yeniden deploy** et: sayfa derleme sırasında hangi düğmelerin gösterileceğine
karar veriyor.

Kartın içeriği (isim, unvan, e-posta, telefon, profiller) `src/lib/site.ts` ve
`src/lib/wallet/card.ts` dosyalarından gelir. Bir bilgi değişirse orada değişir,
kart bir sonraki indirmede güncel olur. Görseller `public/wallet/` içinde ve
`npm run wallet` ile marka dosyalarından ve `public/roadmap/atilla.webp`
portresinden üretilir.

## Apple Wallet

1. **Apple Developer Program**'a katıl (developer.apple.com/programs). Hesap
   onaylanınca Team ID'yi Membership sayfasında görürsün → `APPLE_TEAM_ID`.
2. **Certificates, Identifiers & Profiles → Identifiers → +** → *Pass Type IDs*.
   Açıklama: "Atilla Barbarossa Card", kimlik ör. `pass.com.barbarossafilms.card`
   → `APPLE_PASS_TYPE_ID`.
3. Bu Pass Type ID için bir sertifika iste. Mac'te **Keychain Access → Certificate
   Assistant → Request a Certificate From a Certificate Authority** ile bir CSR
   oluştur ("Saved to disk"), Apple'a yükle, `pass.cer` dosyasını indir.
4. `pass.cer` dosyasını çift tıklayıp Keychain'e ekle, sertifikayı özel
   anahtarıyla birlikte **.p12** olarak dışa aktar. Sonra terminalde:

   ```bash
   openssl pkcs12 -in pass.p12 -clcerts -nokeys -out pass-cert.pem -legacy
   openssl pkcs12 -in pass.p12 -nocerts -nodes -out pass-key.pem -legacy
   base64 -i pass-cert.pem | tr -d '\n'   # → APPLE_PASS_CERT
   base64 -i pass-key.pem  | tr -d '\n'   # → APPLE_PASS_KEY
   ```

   Anahtarı şifreli bırakmak istersen `-nodes` yazma ve şifreyi
   `APPLE_PASS_KEY_PASSPHRASE` olarak ekle.
5. Apple'ın **WWDR G4** ara sertifikasını indir (apple.com/certificateauthority →
   "Worldwide Developer Relations - G4"), PEM'e çevir ve base64 olarak ekle:

   ```bash
   openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem
   base64 -i wwdr.pem | tr -d '\n'        # → APPLE_WWDR_CERT
   ```

6. Beş değeri Vercel → Project → Settings → Environment Variables'a ekle,
   yeniden deploy et. iPhone'da Safari ile `/card` aç, "Apple Cüzdan'a Ekle"ye
   dokun.

Sertifika bir yıl geçerlidir. Süresi dolunca 3–5. adımları tekrarla. Eski
kartlar telefonlarda kalır, yeni indirmeler yeni sertifikayla imzalanır.

## Google Wallet

1. **Google Pay & Wallet Console**'u aç (pay.google.com/business/console),
   işletme profilini oluştur. *Google Wallet API* bölümünde **Issuer ID**'yi gör
   → `GOOGLE_WALLET_ISSUER_ID`.
2. **Google Cloud Console**'da bir proje aç, *Google Wallet API*'yi etkinleştir,
   bir **service account** oluştur ve JSON anahtarını indir.
3. Wallet Console → *Users* bölümünde service account'un e-posta adresini
   **Developer** olarak ekle.
4. JSON anahtarını base64 olarak ekle:

   ```bash
   base64 -i service-account.json | tr -d '\n'   # → GOOGLE_WALLET_SERVICE_ACCOUNT
   ```

5. Yeniden deploy et. Android'de `/card` aç, "Google Cüzdan'a ekle"ye dokun.
   Hesap "demo mode"dayken kartı yalnızca Console'da test kullanıcısı olarak
   eklenen Google hesapları kaydedebilir. Herkesin kaydedebilmesi için Console'da
   **Request publishing access** ile yayın onayı iste.

## Resmi düğme görselleri

Apple ve Google, "Add to Apple Wallet" / "Add to Google Wallet" düğmeleri için
kendi resmi rozetlerini kullanmayı ister (Apple: *Add to Apple Wallet Guidelines*,
Google: *Brand guidelines*). Sayfa şimdilik markanın kendi siyah düğmelerini
kullanıyor. Yayına almadan önce iki rozeti resmi sitelerinden indirip
`public/wallet/` içine koyarsan, düğmeleri onlarla değiştiririm.

## Kontrol

- Apple: `curl -I https://atillabarbarossa.com/api/wallet/apple?lang=de`
  → `200` ve `Content-Type: application/vnd.apple.pkpass`. 503 ise değişkenlerden
  biri eksik. 500 ise sertifika ya da anahtar okunamadı; Vercel loglarında
  `[wallet]` satırına bak.
- Google: `curl -I https://atillabarbarossa.com/api/wallet/google?lang=de`
  → `303` ve `pay.google.com` adresine yönlendirme.
- vCard: `/api/wallet/vcard?lang=de` her zaman `200`.
