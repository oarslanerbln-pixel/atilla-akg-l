import { NextResponse, type NextRequest } from "next/server";
import { languageParam } from "@/lib/wallet/card";
import { googleSaveUrl } from "@/lib/wallet/google";

/**
 * The business card for Google Wallet. GET /api/wallet/google?lang=de|en|tr
 * redirects to Google's "Save to Google Wallet" page with a freshly signed
 * pass. The signing happens on each tap, so the link on the card page never
 * goes stale. Without the issuer account it answers 503 (docs/wallet-setup.md).
 */

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const lang = languageParam(request.nextUrl.searchParams.get("lang"));
  let url: string | null;
  try {
    url = googleSaveUrl(lang);
  } catch (error) {
    console.error("[wallet] Google pass could not be signed", error);
    return NextResponse.json({ error: "pass_failed" }, { status: 500 });
  }
  if (!url) return NextResponse.json({ error: "google_wallet_not_configured" }, { status: 503 });

  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
