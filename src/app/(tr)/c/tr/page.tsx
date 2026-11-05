import ContactPage from "@/components/card/ContactPage";
import { contactMetadata } from "@/components/card/share";
import { walletOptions } from "@/lib/wallet/ready";

/**
 * /c in Turkish. What a scan of the card's QR code (or a tap on its NFC tag)
 * opens: Save contact, Instagram, then WhatsApp, a call, e-mail and the
 * website. See components/card/ContactPage.tsx.
 */
export const metadata = contactMetadata("TR");

export default function Contact() {
  return <ContactPage wallet={walletOptions()} />;
}
