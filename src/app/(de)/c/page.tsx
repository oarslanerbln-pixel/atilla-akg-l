import ContactPage from "@/components/card/ContactPage";
import { contactMetadata } from "@/components/card/share";
import { walletOptions } from "@/lib/wallet/ready";

/**
 * The German contact page; English and Turkish in (en)/c/en and (tr)/c/tr. What a scan of the card's QR code (or a tap on its NFC tag)
 * opens: Save contact, Instagram, then WhatsApp, a call, e-mail and the
 * website. See components/card/ContactPage.tsx.
 */
export const metadata = contactMetadata("DE");

export default function Contact() {
  return <ContactPage wallet={walletOptions()} />;
}
