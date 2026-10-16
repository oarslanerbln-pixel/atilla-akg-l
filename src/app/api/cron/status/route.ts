import { safeEqual } from '@/lib/concierge/crypto';
import { runStatusCheck } from '@/lib/concierge/status';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Daily Vercel Cron (vercel.json), also run on demand: `vercel crons run /api/cron/status`.
// Read-only: it checks every setting and connection the site and the concierge need and logs
// one line per problem, by name only, so a setting saved empty in Vercel shows up within a day.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('CRON_SECRET is not configured', { status: 503 });
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const report = await runStatusCheck();

  for (const [feature, { required, missing }] of Object.entries(report.env)) {
    if (missing.length) {
      const line = `[status] ${feature}: ${missing.join(', ')} missing or empty${required ? '' : ' (feature off)'}`;
      if (required) console.error(line);
      else console.info(line);
    }
  }
  for (const [name, check] of Object.entries(report.checks)) {
    if (check.ok) console.info(`[status] ${name}: ok ${check.detail ? JSON.stringify(check.detail) : ''}`.trimEnd());
    else console.error(`[status] ${name}: failed: ${check.error}`);
  }
  console.info(`[status] ${report.ok ? 'all good' : 'needs attention'}`);

  return Response.json(report, { headers: { 'Cache-Control': 'no-store' } });
}
