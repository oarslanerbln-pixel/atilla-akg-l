import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { contact, socialProfiles } from "@/lib/site";
import { languageAlternates } from "@/lib/locales";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "atillabarbarossa.com gizlilik politikası: ziyarette, iletişim formunda ve Instagram mesajlarında hangi verilerin işlendiği ve GDPR kapsamındaki haklarınız.",
  robots: { index: false, follow: true },
  alternates: languageAlternates("privacy", "TR"),
};

/**
 * Turkish translation of /datenschutz, section by section. The German text
 * in src/app/(de)/datenschutz/page.tsx is binding: change it first, then
 * this file and the English one the same way.
 */
export default function PrivacyTurkish() {
  return (
    <LegalPage title="Gizlilik Politikası" page="privacy" lang="TR">
      <p>
        <em>
          Bu metin, Almanca gizlilik politikasının (Datenschutzerklärung)
          çevirisidir. Bağlayıcı olan Almanca metindir.
        </em>
      </p>

      <h2>1. Veri sorumlusu</h2>
      <p>Genel Veri Koruma Tüzüğü (GDPR, Almancası DSGVO) kapsamında veri sorumlusu:</p>
      <p>
        Atilla Akgül
        <br />
        Neuendorfer Straße 54
        <br />
        13585 Berlin, Almanya
        <br />
        Telefon: <a href={`tel:${contact.phone}`}>{contact.phoneDisplay}</a>
        <br />
        E-posta: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
      <p>
        Yasal koşullar oluşmadığından bir veri koruma görevlisi atanmamıştır.
      </p>

      <h2>2. Genel bakış</h2>
      <p>
        Bu web sitesi bilinçli olarak takip yapmaz: çerez yok, analiz aracı
        yok, reklam pikseli yok, üçüncü taraflardan gömülü içerik yok. Kişisel
        veriler yalnızca sitenin sunulması için teknik olarak gerektiği
        ölçüde ya da benimle kendiniz iletişime geçtiğinizde işlenir. Kişisel
        verileri satmam. Bağlantı TLS (HTTPS) ile şifrelenir.
      </p>
      <p>
        Instagram&apos;da bir anahtar kelimeyle partner linki isterseniz link
        size otomatik olarak gönderilir; bazı anahtar kelimelere ayrıca
        Manychat hizmeti yanıt verir (ikisi de 9. bölüm). Diğer tüm mesajları
        kendim yanıtlarım. Komisyonların eşleştirilebilmesi için partner
        linklerine yapılan tıklamalar sayılır (10. bölüm). Instagram, TikTok
        ve YouTube&apos;daki profillerim için 12. bölüm geçerlidir.
      </p>

      <h2>3. Barındırma ve sunucu kayıt dosyaları</h2>
      <p>
        Bu web sitesi Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
        ABD tarafından barındırılır. Siteyi açtığınızda Vercel, teknik olarak
        gerekli bağlantı verilerini sunucu kayıt dosyalarında işler: IP adresi,
        erişim tarihi ve saati, istenen dosya, aktarılan veri miktarı,
        yönlendiren sayfa (referrer) ile tarayıcı ve işletim sistemi bilgisi.
        Bu veriler başka verilerle birleştirilmez. Vercel bu sitenin
        kayıtlarını en geç bir gün sonra siler; saldırıları önlemek için
        bağlantı verilerini kendi gizlilik politikası uyarınca daha uzun
        süre saklayabilir.
      </p>
      <p>
        Hukuki dayanak GDPR m. 6/1-f&apos;dir; meşru menfaat, web sitesinin
        güvenli ve kesintisiz işletilmesidir. Vercel ile GDPR m. 28 uyarınca
        bir veri işleme sözleşmesi yapılmıştır. ABD&apos;ye aktarım, Vercel&apos;in
        sertifikalı olduğu AB-ABD Veri Gizliliği Çerçevesi (Data Privacy
        Framework) yeterlilik kararına (GDPR m. 45), ek olarak AB standart
        sözleşme maddelerine (GDPR m. 46/2-c) dayanır.
      </p>
      <p>
        Sayfaların kendisini Vercel dünya çapındaki sunucu ağı üzerinden
        sunar. Sunucuda işlenen her şey (iletişim formu, Instagram&apos;daki
        otomatik yanıtlar, partner linkleri) Frankfurt am Main&apos;daki bir veri
        merkezinde çalışır.
      </p>

      <h2>4. Tarayıcınızda saklanan bilgi</h2>
      <p>
        Çerez kullanılmaz. Site, ilk ziyaretinizden sonra tarayıcınızın yerel
        belleğine (<code>atilla_preloader_seen</code>) yalnızca tek bir teknik
        kayıt bırakır; böylece sonraki ziyaretlerde açılış animasyonu atlanır.
        Bu kayıt kişisel veri içermez, bana ya da üçüncü kişilere iletilmez ve
        tarayıcı ayarlarından her zaman silinebilir. Hukuki dayanak Alman
        Telekomünikasyon ve Dijital Hizmetler Veri Koruma Kanunu&apos;nun (TDDDG)
        25/2-2. maddesidir; çünkü kayıt yalnızca istediğiniz sayfanın
        sunulmasına hizmet eder.
      </p>

      <h2>5. Harici kaynak yok</h2>
      <p>
        Yazı tipleri, videolar, görseller ve simgeler yalnızca kendi
        sunucumdan ya da barındırma hizmeti sağlayıcım Vercel&apos;in deposundan
        (3. bölüm) sunulur. Google Fonts, CDN betikleri, gömülü haritalar veya
        videolar ya da harici görsel hizmetleri yüklenmez. Bu nedenle siteyi
        yalnızca görüntülediğinizde IP adresiniz barındırma sağlayıcısı
        dışında hiçbir üçüncü tarafa iletilmez.
      </p>
      <p>
        &ldquo;Son filmler&rdquo; bölümündeki filmler Instagram hesabımdan
        gelir. Sunucum bunları üç günde bir Instagram&apos;dan indirir ve
        kopyalarını Vercel Blob depolama hizmetinde saklar. Tarayıcınız önizleme
        görsellerini bu web sitesi üzerinden, videoları ise
        public.blob.vercel-storage.com adresinden yükler; ikisi de
        Vercel&apos;dedir. İzlerken Instagram veya Meta sizden hiçbir veri almaz.
      </p>
      <p>
        Instagram, TikTok ve YouTube linkleri basit bağlantılardır.
        Tarayıcınız ilgili sağlayıcıya ancak birine tıkladığınızda bağlanır; o
        andan itibaren o sağlayıcının gizlilik politikası geçerlidir.
      </p>

      <h2>6. İletişim formu</h2>
      <p>
        İletişim formunu kullandığınızda talebinizi yanıtlamak için adınız,
        e-posta adresiniz ve mesajınız işlenir. Hukuki dayanak GDPR m. 6/1-a
        (onay kutusuyla verdiğiniz açık rıza) ve talebiniz bir sözleşme
        kurulmasına yönelikse GDPR m. 6/1-b&apos;dir. Rızanızı ileriye dönük
        olarak her zaman geri alabilirsiniz; kısa bir mesaj yeterlidir.
      </p>
      <p>
        Mesaj, veri işleyen sıfatıyla Resend hizmeti (Plus Five Five, Inc.,
        2261 Market Street, San Francisco, CA 94114, ABD) aracılığıyla e-posta
        kutuma iletilir. GDPR m. 28 uyarınca bir veri işleme sözleşmesi
        mevcuttur. ABD&apos;ye aktarım, Resend&apos;in sertifikalı olduğu AB-ABD Veri
        Gizliliği Çerçevesi yeterlilik kararına, ek olarak AB standart
        sözleşme maddelerine dayanır.
      </p>
      <p>
        Otomatik toplu gönderimleri önlemek için IP adresi başına gönderim
        sayısı kısa süreliğine çalışma belleğinde sınırlandırılır. Bu bilgi
        kalıcı olarak saklanmaz ve değerlendirilmez.
      </p>

      <h2>7. E-posta veya telefonla iletişim</h2>
      <p>
        Bana e-posta yazdığınızda ya da beni aradığınızda, bildirdiğiniz
        verileri (ad, e-posta adresi, telefon numarası ve talebin içeriği
        gibi) yalnızca talebinizi yanıtlamak için işlerim. Hukuki dayanak,
        talep bir sözleşmeyle ilgiliyse GDPR m. 6/1-b, diğer durumlarda GDPR m.
        6/1-f&apos;dir (talepleri yanıtlamaya yönelik meşru menfaat).
      </p>

      <h2>8. WhatsApp ile iletişim</h2>
      <p>
        Sitede bana WhatsApp üzerinden ulaşabileceğiniz linkler bulunur. Bunun
        için sitede WhatsApp&apos;tan hiçbir şey yüklenmez; WhatsApp ancak bir
        linke dokunduğunuzda, göndermeden önce değiştirebileceğiniz ya da
        silebileceğiniz hazır bir mesajla açılır.
      </p>
      <p>
        Bana WhatsApp üzerinden yazarsanız, Meta grubuna ait WhatsApp Ireland
        Limited (Merrion Road, Dublin 4, D04 X2K5, İrlanda) telefon numaranızı,
        profil adınızı ve mesajınızı işler; bu sırada ABD&apos;ye aktarım
        olasılığı göz ardı edilemez. Meta Platforms, Inc. AB-ABD Veri Gizliliği
        Çerçevesi kapsamında sertifikalıdır. Hukuki dayanak, talebiniz bir
        sözleşmeyle ilgiliyse GDPR m. 6/1-b, diğer durumlarda GDPR m.
        6/1-f&apos;dir. Kullanım isteğe bağlıdır; iletişim formu, e-posta ve
        telefon aynı şekilde kullanılabilir.
      </p>

      <h2 id="instagram">9. Instagram&apos;da otomatik yanıtlar</h2>
      <p>
        Bazı paylaşımlarımın altında &ldquo;GOLDCARD&rdquo; gibi bir anahtar
        kelime belirtirim. Bir yorumda, hikâye yanıtında ya da doğrudan
        mesajda bu kelimeyle teklifi sorarsanız otomatik olarak kısa bir
        açıklama ve isterseniz linkini alırsınız (10. bölüm); yorumların
        altında ayrıca mesaja dair kısa ve herkese açık bir not görünür.
        Diğer tüm yorum ve mesajları bizzat yanıtlarım. Sunucum bunları
        yalnızca anahtar kelime açısından kontrol eder ve saklamaz.
      </p>
      <p>
        Böyle bir talepte Instagram kimliğiniz (Instagram&apos;ın hesabım için
        verdiği bir numara), varsa adınız ve kullanıcı adınız, yorumunuz ya da
        mesajınız, algılanan dil, yanıtım ve soruyu sorduğunuz paylaşım
        saklanır. Bir hesap kısa sürede olağandışı sayıda mesaj gönderirse
        otomatik yanıt durur ve WhatsApp üzerinden hesabın adını içeren bir
        bildirim alırım. Hukuki dayanak GDPR m. 6/1-f&apos;dir; meşru menfaat,
        anahtar kelimeyle kendinizin başlattığı talepleri hemen ve yalnızca
        bir kez yanıtlamak ve kötüye kullanımı önlemektir.
      </p>
      <p>Sürece dahil olanlar:</p>
      <ul>
        <li>
          Instagram ve WhatsApp&apos;ın işletmecisi olarak Meta Platforms Ireland
          Limited, Merrion Road, Dublin 4, D04 X2K5, İrlanda. Instagram
          üzerindeki işleme için Meta&apos;nın gizlilik politikası geçerlidir;
          ABD&apos;ye aktarım olasılığı göz ardı edilemez. Meta Platforms, Inc.
          AB-ABD Veri Gizliliği Çerçevesi kapsamında sertifikalıdır.
        </li>
        <li>
          Veritabanı için veri işleyen sıfatıyla Supabase, Inc.; sunucular
          Frankfurt am Main&apos;dadır. Ad, kimlik, iletişim bilgileri ve mesajlar
          orada yalnızca şifreli olarak (AES-256) saklanır; anahtar
          Supabase&apos;de değildir. Supabase sistemlere üçüncü ülkelerden
          eriştiğinde bu, AB standart sözleşme maddelerine dayanır.
        </li>
        <li>Mesajların sunucularından geçtiği Vercel (bkz. 3. bölüm).</li>
      </ul>
      <p>
        Supabase ile GDPR m. 28 uyarınca bir veri işleme sözleşmesi
        mevcuttur. Otomatik yanıt istemiyorsanız anahtar kelime olmadan yazın;
        size bizzat yanıt veririm. Bana iletişim formu, e-posta veya telefonla
        da aynı şekilde ulaşabilirsiniz.
      </p>
      <p>
        Yorum ve mesajlardaki bazı anahtar kelimelere ayrıca otomatik bir
        mesajlaşma hizmeti yanıt verir: veri işleyen sıfatıyla Manychat, Inc.,
        8605 Santa Monica Blvd #64372, West Hollywood, CA 90069, ABD. Manychat
        bu sırada Instagram kimliğinizi, adınızı ve kullanıcı adınızı, yorumu
        ya da mesajı ve yanıttaki butonlara veya linklere dokunup
        dokunmadığınızı alır. Hukuki dayanak GDPR m. 6/1-f&apos;dir; meşru
        menfaat, anahtar kelimeyle kendinizin başlattığı talepleri hemen
        yanıtlamaktır.
      </p>
      <p>
        Manychat ile GDPR m. 28 uyarınca bir veri işleme sözleşmesi mevcuttur.
        ABD&apos;ye aktarım, Manychat&apos;in sertifikalı olduğu AB-ABD Veri
        Gizliliği Çerçevesi yeterlilik kararına, ek olarak AB standart
        sözleşme maddelerine dayanır.
      </p>

      <h2>10. Partner linkleri</h2>
      <p>
        Instagram&apos;da talep etmeniz hâlinde kredi kartı, tur veya uçuş arama
        gibi partner tekliflerine yönlendiren linkler alırsınız. Bunlar reklam
        olarak işaretlenir. Böyle bir link üzerinden bir sözleşme kurulursa
        komisyon alırım; sizin için hiçbir şey değişmez.
      </p>
      <p>
        Linkler önce bu web sitesinden geçer (<code>/go/…</code>). Bu sırada
        rastgele bir kimlikle linkin kaç kez ve ilk ne zaman açıldığı sayılır,
        hangi talepten ve hangi paylaşımdan geldiği kaydedilir. Komisyonların
        paylaşımla eşleştirilebilmesi için bu kimlik ilgili partner programına
        (financeAds, GetYourGuide veya Skyscanner gibi) iletilir; partner
        programı adınızı ya da Instagram kimliğinizi almaz. Hukuki dayanak
        GDPR m. 6/1-f&apos;dir; meşru menfaat komisyonların hesaplanmasıdır.
        Yönlendirmeden sonra ilgili sağlayıcının gizlilik politikası geçerlidir;
        sağlayıcı kendi çerezlerini kullanabilir.
      </p>

      <h2>11. E-kitap satın alma (Tentary)</h2>
      <p>
        Travel Creator Roadmap ve ücretsiz bölümü Tentary platformu üzerinden
        satılır ve teslim edilir: Tentary GmbH, Frankenstraße 152, 90461
        Nürnberg, Almanya. <code>/roadmap</code> sayfasındaki linkler
        doğrudan Tentary&apos;nin ödeme sayfasına gider; bu web sitesi bu sırada
        hiçbir veri toplamaz. Ödeme sayfasında adınızı, e-posta adresinizi,
        fatura ülkenizi ve ödeme bilgilerinizi girersiniz; Tentary ve
        kullandığı ödeme hizmeti sağlayıcıları bunları ödemeyi gerçekleştirmek
        ve PDF&apos;i size göndermek için işler. Sözleşmeyi ifa etmek ve
        vergisel yükümlülüklerimi yerine getirmek için adınızı, e-posta
        adresinizi ve sipariş bilgilerini alırım.
      </p>
      <p>
        Hukuki dayanak GDPR m. 6/1-b (sözleşme) ve 6/1-c&apos;dir (saklama
        yükümlülükleri). Ücretsiz bölüm için ad ve e-posta adresi açısından da
        aynısı geçerlidir. Tanıtım e-postalarını yalnızca ödeme sırasında
        açıkça onay verirseniz alırsınız (GDPR m. 6/1-a); bu onayı her zaman
        geri alabilirsiniz. Diğer konularda Tentary&apos;nin gizlilik politikası
        geçerlidir.
      </p>

      <h2 id="social-media">12. Sosyal medya profillerim</h2>
      <p>
        Çalışmalarımı{" "}
        <a href={socialProfiles.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        ,{" "}
        <a href={socialProfiles.tiktok} target="_blank" rel="noopener noreferrer">
          TikTok
        </a>{" "}
        ve{" "}
        <a href={socialProfiles.youtube} target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
        &apos;daki kendi profillerimde paylaşırım. Bu politika bu profiller
        için de geçerlidir. Birini ziyaret ettiğinizde ilgili sağlayıcı
        verilerinizi kendi koşullarına göre, reklam ve analiz amaçlarıyla da,
        orada hesabınız olup olmadığından bağımsız olarak işler; buna etkim
        yoktur. Ben yalnızca orada benimle paylaştıklarınızı (yorumlar,
        bahsetmeler, mesajlar) ve paylaşımlarımın erişimine ilişkin, tek tek
        kişileri tanımlamaya imkân vermeyen toplu istatistikleri görürüm.
        Hukuki dayanak GDPR m. 6/1-f&apos;dir; meşru menfaat, çalışmalarımı
        göstermek ve takipçilerim, ilgilenenler ve müşterilerimle iletişim
        kurmaktır.
      </p>
      <ul>
        <li>
          <strong>Instagram:</strong> Meta Platforms Ireland Limited, Merrion
          Road, Dublin 4, D04 X2K5, İrlanda. Meta&apos;nın profilim hakkında bana
          sunduğu istatistikler (&ldquo;Insights&rdquo;) için Meta ve ben ortak
          veri sorumlusuyuz (GDPR m. 26). Meta bir{" "}
          <a
            href="https://www.facebook.com/legal/terms/page_controller_addendum"
            target="_blank"
            rel="noopener noreferrer"
          >
            sözleşmede
          </a>{" "}
          bunun birincil sorumluluğunu, haklarınızın yerine getirilmesi dahil,
          üstlenmiştir. Meta Platforms, Inc. AB-ABD Veri Gizliliği Çerçevesi
          kapsamında sertifikalıdır.{" "}
          <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer">
            Gizlilik politikası
          </a>
        </li>
        <li>
          <strong>TikTok:</strong> TikTok Technology Limited, 10 Earlsfort
          Terrace, Dublin, D02 T380, İrlanda. TikTok bana istatistik sunduğu
          ölçüde (TikTok Analytics) bunlar için ortak veri sorumlusuyuz;
          ayrıntıları TikTok bir{" "}
          <a
            href="https://www.tiktok.com/legal/page/global/tiktok-analytics-joint-controller-addendum/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            sözleşmede
          </a>{" "}
          düzenler. TikTok verileri, hakkında yeterlilik kararı bulunmayan AB
          dışı ülkelere de aktarır.{" "}
          <a
            href="https://www.tiktok.com/legal/page/eea/privacy-policy/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gizlilik politikası
          </a>
        </li>
        <li>
          <strong>YouTube:</strong> Google Ireland Limited, Gordon House,
          Barrow Street, Dublin 4, İrlanda. Google verileri kendi
          sorumluluğunda işler; Google LLC AB-ABD Veri Gizliliği Çerçevesi
          kapsamında sertifikalıdır.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Gizlilik politikası
          </a>
        </li>
      </ul>
      <p>
        Haklarınızı (15. bölüm) hem bana hem de ilgili sağlayıcıya karşı
        kullanabilirsiniz. En hızlı sonuç sağlayıcının kendisinden alınır,
        çünkü kullanıcılarının verilerine yalnızca o erişebilir; bana gelen
        talepleri sağlayıcıya iletirim.
      </p>

      <h2>13. Saklama süresi</h2>
      <p>
        Talepler ve ilgili yazışmalar, sonuçlandırıldıklarında ve yasal
        saklama yükümlülükleri engel olmadığında silinir. Bir sözleşme
        kurulursa Alman ticaret ve vergi hukukundaki saklama süreleri geçerlidir
        (genellikle altı ila on yıl, Alman Ticaret Kanunu HGB m. 257, Vergi
        Usul Kanunu AO m. 147).
      </p>
      <p>
        Instagram&apos;dan gelen ve saklanan talepler (9. bölüm), son mesajdan 24
        ay sonra ilgili bilgilerle birlikte otomatik olarak silinir. Bir
        partner linkinin taleple ilişkisi de bununla sona erer; geriye
        yalnızca anonim tıklama sayısı kalır.
      </p>
      <p>
        Manychat&apos;teki bilgiler, hizmeti kullanmayı bırakana kadar saklanır;
        ardından orada silinir. Daha erken silinmesini her zaman talep
        edebilirsiniz (15. bölüm).
      </p>

      <h2>14. Veri verme yükümlülüğü, otomatik karar verme yok</h2>
      <p>
        Kişisel veri vermek için yasal ya da sözleşmesel bir yükümlülüğünüz
        yoktur; ancak bilgi vermeden bir talebi yanıtlayamam. GDPR m. 22
        kapsamında profil oluşturma dahil otomatik karar verme yapılmaz.
        Instagram&apos;daki otomatik yanıt yalnızca istediğiniz linki gönderir.
      </p>

      <h2 id="rights">15. Haklarınız</h2>
      <p>Her zaman şu haklara sahipsiniz:</p>
      <ul>
        <li>hakkınızda işlenen veriler hakkında bilgi alma (GDPR m. 15),</li>
        <li>yanlış verilerin düzeltilmesini isteme (GDPR m. 16),</li>
        <li>silinmesini isteme (GDPR m. 17),</li>
        <li>işlemenin kısıtlanmasını isteme (GDPR m. 18),</li>
        <li>veri taşınabilirliği (GDPR m. 20),</li>
        <li>verdiğiniz rızayı ileriye dönük olarak geri alma (GDPR m. 7/3).</li>
      </ul>
      <p>
        <strong>İtiraz hakkı (GDPR m. 21):</strong> GDPR m. 6/1-f&apos;ye dayanan
        bir işlemeye, özel durumunuzdan kaynaklanan sebeplerle her zaman
        itiraz edebilirsiniz. Bu durumda, menfaatlerinizin önüne geçen zorlayıcı
        ve korunmaya değer sebepler gösteremediğim ya da işleme hukuki
        taleplerin ileri sürülmesi, kullanılması veya savunulmasına hizmet
        etmediği sürece verileri artık işlemem.
      </p>
      <p>
        Haklarınızı kullanmak için{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> adresine kısa
        bir mesaj yeterlidir. Bir ay içinde yanıt veririm (GDPR m. 12/3).
      </p>

      <h2>16. Şikâyet hakkı</h2>
      <p>
        Bir veri koruma denetim makamına, özellikle mutat meskeninizin, işyerinizin
        ya da iddia edilen ihlalin bulunduğu üye devlette şikâyette bulunma
        hakkına sahipsiniz (GDPR m. 77). Benim için yetkili makam:
      </p>
      <p>
        Berliner Beauftragte für Datenschutz und Informationsfreiheit (Berlin
        Veri Koruma ve Bilgi Edinme Özgürlüğü Komiseri)
        <br />
        Alt-Moabit 59–61, 10555 Berlin, Almanya
        <br />
        <a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer">
          www.datenschutz-berlin.de
        </a>
      </p>

      <h2>17. Tarih ve dil seçenekleri</h2>
      <p>
        Ekim 2026 itibarıyla. Bu politika web sitesinin teknik durumunu
        açıklar ve kullanılan hizmetler değiştiğinde güncellenir. Almanca,
        İngilizce ve Türkçe olarak mevcuttur; bağlayıcı olan Almanca metindir.
      </p>
    </LegalPage>
  );
}
