import { NextResponse, type NextRequest } from "next/server";
import { languageParam } from "@/lib/wallet/card";
import { buildVCard } from "@/lib/wallet/vcard";

/**
 * The business card as a contact file. GET /api/wallet/vcard?lang=de|en|tr.
 * Needs no account anywhere, so the card page always offers it.
 */

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const lang = languageParam(request.nextUrl.searchParams.get("lang"));
  return new NextResponse(buildVCard(lang), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="atilla-barbarossa.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
