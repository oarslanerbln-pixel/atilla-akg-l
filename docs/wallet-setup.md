# Wallet kurulumu (Apple Wallet ve Google Wallet)

Dijital kartvizitteki **"Cüzdana ekle"** düğmesi (`/card` ve ana sayfadaki kart
bölümü) kartı telefonun cüzdanına ekler:

- **iPhone, iPad, Mac:** Apple Wallet. Kart kilit ekranından açılır, internet
  olmadan da QR kodu gösterir.
- **Android ve diğer bilgisayarlar:** Google Wallet.

Kod hazır (`src/lib/wallet/`, `src/app/wallet/`). İki cüzdan da kartın kimin
olduğunu kendi sertifikası ya da anahtarıyla doğruluyor. Bu yüzden düğme,
aşağıdaki değişkenler Vercel'e girilip site yeniden yayınlanana kadar
görünmez. O zamana kadar `/wallet/apple` ve `/wallet/google` 503 döner.
Ziyaretçiye hiçbir zaman çalışmayan bir dosya ya da sayfa gösterilmez.

İkisini birbirinden bağımsız açabilirsin. Yalnızca Apple'ı kurarsan düğme
yalnızca Apple cihazlarda görünür; yalnızca Google'ı kurarsan yalnızca
Android'de ve bilgisayarlarda.

Değişkenleri girdikten sonra: Vercel → Project → Deployments → son yayın →
**Redeploy**.

---

## 1. Apple Wallet

**Gerekenler:** Apple Developer Program üyeliği (yıllık 99 $),
developer.apple.com hesabı ve bir Mac (sertifikayı dışa aktarmak için; Mac
yoksa OpenSSL ile de yapılır, aşağıda).

1. **Pass Type ID oluştur.**
   developer.apple.com → Certificates, Identifiers & Profiles → Identifiers →
   **+** → *Pass Type IDs* → açıklama: `Atilla Barbarossa Card`, kimlik:
   `pass.com.atillabarbarossa.card`.
2. **Sertifika al.**
   Aynı Pass Type ID'yi aç → *Create Certificate*.
   - Mac'te: Anahtar Zinciri Erişimi → Sertifika Asistanı → *Bir Sertifika
     Yetkilisinden Sertifika İste* → "Diske kaydet". Oluşan `.certSigningRequest`
     dosyasını yükle, `pass.cer` dosyasını indir ve çift tıklayarak Anahtar
     Zinciri'ne ekle.
   - Mac yoksa (OpenSSL):
     ```sh
     openssl req -new -newkey rsa:2048 -nodes -keyout pass.key -out pass.csr -subj "/CN=Atilla Barbarossa Pass"
     ```
     `pass.csr` dosyasını yükle, `pass.cer` dosyasını indir.
3. **PEM'e çevir.**
   - Mac'te: Anahtar Zinciri'nde sertifikaya sağ tık → *Dışa Aktar* →
     `pass.p12` (bir parola belirle). Sonra:
     ```sh
     openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signer.pem -legacy
     openssl pkcs12 -in pass.p12 -nocerts -out signer.key -legacy
     ```
     (İkinci komut anahtar için yeni bir parola sorar. Bu parola
     `APPLE_WALLET_SIGNER_KEY_PASSPHRASE` olur.)
   - OpenSSL ile:
     ```sh
     openssl x509 -inform DER -in pass.cer -out signer.pem
     cp pass.key signer.key
     ```
4. **Apple WWDR ara sertifikası (G4).**
   apple.com/certificateauthority adresinden *Worldwide Developer Relations -
   G4* sertifikasını (`AppleWWDRCAG4.cer`) indir:
   ```sh
   openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
   ```
5. **Team ID:** developer.apple.com → Membership → *Team ID* (10 karakter).
6. **Vercel değişkenleri.** PEM dosyalarını tek satırlık base64 olarak gir:
   ```sh
   base64 -i signer.pem | tr -d '\n'   # → APPLE_WALLET_SIGNER_CERT
   base64 -i signer.key | tr -d '\n'   # → APPLE_WALLET_SIGNER_KEY
   base64 -i wwdr.pem   | tr -d '\n'   # → APPLE_WALLET_WWDR_CERT
   ```

| Değişken | Değer |
|---|---|
| `APPLE_WALLET_PASS_TYPE_ID` | `pass.com.atillabarbarossa.card` |
| `APPLE_WALLET_TEAM_ID` | Team ID |
| `APPLE_WALLET_SIGNER_CERT` | `signer.pem` (base64) |
| `APPLE_WALLET_SIGNER_KEY` | `signer.key` (base64) |
| `APPLE_WALLET_SIGNER_KEY_PASSPHRASE` | anahtarın parolası (parola yoksa boş bırak) |
| `APPLE_WALLET_WWDR_CERT` | `wwdr.pem` (base64) |

**Test:** iPhone'da Safari ile `atillabarbarossa.com/card` → "Cüzdana ekle".
Kart doğrudan Apple Wallet'ta açılmalı. Hata olursa Vercel → Logs'ta
`[wallet/apple]` satırına bak.

Sertifika bir yıl geçerli. Süresi dolmadan aynı adımlarla yenisini al ve iki
`SIGNER` değişkenini değiştir.

---

## 2. Google Wallet

**Gerekenler:** bir Google hesabı ve Google Cloud projesi (ücretsiz).

1. **Issuer hesabı:** pay.google.com/business/console → *Google Wallet API* →
   hesabı oluştur. **Issuer ID** (uzun bir sayı) burada görünür.
2. **API'yi aç:** console.cloud.google.com → proje oluştur → *APIs & Services*
   → **Google Wallet API** → Enable.
3. **Servis hesabı:** *IAM & Admin* → *Service Accounts* → *Create* (ör.
   `wallet`) → hesabı aç → *Keys* → *Add key* → JSON. İndirilen dosyada
   `client_email` ve `private_key` var.
4. **Yetki:** Wallet konsolunda → *Users* → servis hesabının e-postasını
   **Developer** olarak ekle.
5. **Yayına alma:** konsolda ilk başta yalnızca test kullanıcıları kartı
   kaydedebilir. Herkese açmak için *Google Wallet API* → **Request publishing
   access**. Google birkaç gün içinde onaylar.

| Değişken | Değer |
|---|---|
| `GOOGLE_WALLET_ISSUER_ID` | Issuer ID |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL` | JSON'daki `client_email` |
| `GOOGLE_WALLET_PRIVATE_KEY` | JSON'daki `private_key`, olduğu gibi (`\n`'leriyle) ya da base64 |

**Test:** Android'de Chrome ile `atillabarbarossa.com/card` → "Cüzdana ekle" →
Google'ın "Kaydet" sayfası açılır.

Google kartın logosunu ve görselini sitedeki `public/wallet/` klasöründen
(`google-logo.png`, `google-hero.jpg`) alır. Bu yüzden Google kartı yalnızca
canlı sitede çalışır, korumalı Vercel önizlemelerinde çalışmaz.

---

## Kartın içeriği

İki kart da aynı kaynaklardan beslenir:

- **Bilgiler:** `src/lib/site.ts` içindeki `businessCard`, `contact` ve
  `socialProfiles`.
- **Metinler:** `translations.ts`. Apple kartı telefonun diline göre DE/EN/TR
  gösterir.
- **QR kod:** web sitesini açar.

Bir bilgi değişince:

- **Apple:** bir sonraki indirmede yeni kart gelir. Daha önce eklenmiş kartlar
  kendiliğinden güncellenmez; yeniden eklenmeleri gerekir.
- **Google:** `src/lib/wallet/google.ts` içindeki `VERSION` değerini bir
  artır. Google, zaten kayıtlı bir kartın eski hâlini tutar.

**Görseller:** `npx tsx social/brand/wallet.ts` marka dosyalarından ve
portreden yeniden üretir. Çıktılar `src/assets/wallet/` ve `public/wallet/`
klasörlerine yazılır.
