import { after } from 'next/server';
import { jobsFromMetaWebhook } from '@/lib/concierge/inbound';
import { verifyMetaSignature } from '@/lib/concierge/meta';

// Agent runs continue after the 200 response, and a run includes the debounce and the model call.
export const maxDuration = 300;

/** Meta's one-time subscription handshake. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const verifyToken = process.env.META_VERIFY_TOKEN;
  if (verifyToken && params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === verifyToken) {
    return new Response(params.get('hub.challenge') ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyMetaSignature(raw, request.headers.get('x-hub-signature-256'))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload: Parameters<typeof jobsFromMetaWebhook>[0];
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Meta retries unless it gets a quick 200, so the real work happens after responding.
  const jobs = jobsFromMetaWebhook(payload);
  after(async () => {
    const results = await Promise.allSettled(jobs.map((job) => job()));
    for (const r of results) if (r.status === 'rejected') console.error('[concierge] webhook job failed', r.reason);
  });

  return new Response('EVENT_RECEIVED', { status: 200 });
}
