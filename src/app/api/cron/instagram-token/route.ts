import { CONCIERGE, env } from '@/lib/concierge/config';
import { staff } from '@/lib/concierge/copy';
import { safeEqual } from '@/lib/concierge/crypto';
import { alertStaff, subscribeInstagramWebhooks } from '@/lib/concierge/meta';
import { InstagramTokenError, refreshInstagramToken } from '@/lib/concierge/tokens';

export const maxDuration = 60;

// Weekly Vercel Cron (vercel.json): keeps the account subscribed to webhooks and renews the
// 60-day Instagram token long before it runs out.
// Vercel sends CRON_SECRET as a bearer token; without it the endpoint stays closed.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('CRON_SECRET is not configured', { status: 503 });
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) return Response.json({ status: 'not_configured' });

  // Re-subscribed on every run: idempotent, and it heals a subscription lost on Meta's side.
  const webhooks = await subscribeInstagramWebhooks();
  if (webhooks.status === 'failed') console.error('[concierge] Instagram webhook subscription failed:', webhooks.error);
  else console.info('[concierge] Instagram webhooks subscribed');

  try {
    return Response.json({ ...(await refreshInstagramToken()), webhooks });
  } catch (error) {
    console.error('[concierge] Instagram token refresh failed', error);
    const expiresAt = error instanceof InstagramTokenError ? error.expiresAt : null;
    const expiresOn = expiresAt
      ? new Date(expiresAt).toLocaleDateString('tr-TR', { timeZone: CONCIERGE.timezone, dateStyle: 'long' })
      : null;
    try {
      await alertStaff(env('STAFF_WHATSAPP'), staff.instagramTokenFailed(expiresOn, String(error).slice(0, 300)));
    } catch (alertError) {
      console.error('[concierge] staff alert failed', alertError);
    }
    return Response.json({ status: 'failed', webhooks }, { status: 500 });
  }
}
