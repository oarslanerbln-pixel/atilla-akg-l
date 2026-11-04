import { businessVCard } from "@/lib/card";

/**
 * /atilla-barbarossa.vcf — the contact behind "Save contact" on /card.
 *
 * Written once at build time from the same facts the card shows
 * (lib/site.ts), so the two cannot disagree. A phone that opens it offers to
 * add the contact, portrait included.
 */
export const dynamic = "force-static";

export async function GET() {
  return new Response(await businessVCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Atilla-Barbarossa.vcf"',
    },
  });
}
