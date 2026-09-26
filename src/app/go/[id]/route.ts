import { env } from '@/lib/concierge/config';
import { resolveOfferClick } from '@/lib/concierge/offers';

/** Partner-link redirect: counts the click, then forwards to the affiliate network. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let target: string | null = null;
  try {
    target = await resolveOfferClick(id);
  } catch (e) {
    console.error('[concierge] partner link failed', e);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: target ?? env('SITE_URL'),
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
