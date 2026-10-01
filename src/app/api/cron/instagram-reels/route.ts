import { revalidateTag } from 'next/cache';
import { safeEqual } from '@/lib/concierge/crypto';
import { REELS_TAG } from '@/lib/reels/manifest';
import { syncReels } from '@/lib/reels/sync';

export const maxDuration = 60;

// Vercel Cron every third day (vercel.json): mirrors the newest Instagram videos into the Blob store and
// refreshes the home pages when the list changed. Also runnable by hand from Vercel → Cron Jobs.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('CRON_SECRET is not configured', { status: 503 });
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ status: 'not_configured' });
  }

  try {
    const result = await syncReels();
    if (result.changed) revalidateTag(REELS_TAG, 'max');
    console.info('[reels] sync', result);
    return Response.json({ status: 'ok', ...result });
  } catch (error) {
    console.error('[reels] sync failed', error);
    return Response.json({ status: 'failed' }, { status: 500 });
  }
}
