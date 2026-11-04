import { NextResponse, type NextRequest } from "next/server";
import { buildApplePass } from "@/lib/wallet/apple";
import { languageParam } from "@/lib/wallet/card";

/**
 * The business card for Apple Wallet. GET /api/wallet/apple?lang=de|en|tr
 * answers the signed .pkpass; Safari on iPhone and Mac opens it straight
 * into Wallet. Without the certificates it answers 503: the card page only
 * shows the button when they are set (docs/wallet-setup.md).
 */

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const lang = languageParam(request.nextUrl.searchParams.get("lang"));
  let pass: Buffer | null;
  try {
    pass = await buildApplePass(lang);
  } catch (error) {
    console.error("[wallet] Apple pass could not be built", error);
    return NextResponse.json({ error: "pass_failed" }, { status: 500 });
  }
  if (!pass) return NextResponse.json({ error: "apple_wallet_not_configured" }, { status: 503 });

  return new NextResponse(new Uint8Array(pass), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": 'attachment; filename="atilla-barbarossa.pkpass"',
      "Cache-Control": "no-store",
    },
  });
}
