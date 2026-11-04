import { googleSaveUrl, googleWalletReady } from "@/lib/wallet/google";
import { walletLanguage } from "@/lib/wallet/content";

/**
 * /wallet/google?lang=de|en|tr — sends the visitor to Google Wallet's save
 * page with the card's pass, signed here with the service account key.
 * 503 until the key is set.
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (!googleWalletReady()) {
    return new Response("Google Wallet is not configured.", { status: 503 });
  }
  try {
    return Response.redirect(googleSaveUrl(walletLanguage(request)), 302);
  } catch (error) {
    console.error("[wallet/google]", error);
    return new Response("The Wallet pass could not be signed.", { status: 500 });
  }
}
