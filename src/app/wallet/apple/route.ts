import { applePass, appleWalletReady } from "@/lib/wallet/apple";
import { walletLanguage } from "@/lib/wallet/content";

/**
 * /wallet/apple?lang=de|en|tr — the Apple Wallet pass for the business card.
 * Safari on iPhone, iPad and Mac opens it straight in Wallet. Signed per
 * request (the certificates live in the environment, not in the build), and
 * 503 until they are set: never a file a phone would refuse.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!appleWalletReady()) {
    return new Response("Apple Wallet is not configured.", { status: 503 });
  }
  try {
    const pass = await applePass(walletLanguage(request));
    return new Response(new Uint8Array(pass), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="Atilla-Barbarossa.pkpass"',
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch (error) {
    // A broken certificate or key: say so in the logs, and to the visitor plainly.
    console.error("[wallet/apple]", error);
    return new Response("The Wallet pass could not be signed.", { status: 500 });
  }
}
