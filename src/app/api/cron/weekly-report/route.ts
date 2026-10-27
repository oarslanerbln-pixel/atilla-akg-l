import { CONCIERGE } from '@/lib/concierge/config';
import { staff } from '@/lib/concierge/copy';
import { safeEqual } from '@/lib/concierge/crypto';
import { weeklyReport } from '@/lib/concierge/report';
import { mailFailure, mailOperator } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Weekly Vercel Cron (vercel.json, Monday morning), also run on demand:
// `vercel crons run /api/cron/weekly-report`. Mails CONTACT_TO_EMAIL what the partner links did in
// the last seven days, per offer and per reel, story or ad. Counts and public titles only.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('CRON_SECRET is not configured', { status: 503 });
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const report = await weeklyReport();
  const day = (date: Date, options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString('tr-TR', { timeZone: CONCIERGE.timezone, ...options });
  const period = `Son 7 gün: ${day(report.from, { day: 'numeric', month: 'long' })} – ${day(report.to, { dateStyle: 'long' })}`;

  const failure = mailFailure(await mailOperator(staff.weeklyReport(period, report)));
  if (failure) console.error(`[report] weekly report not sent: ${failure}`);
  else console.info(`[report] weekly report mailed: ${report.week.sent} sent, ${report.week.opened} opened`);

  return Response.json(
    { week: report.week, previous: report.previous, mail: failure ? 'failed' : 'mailed' },
    { status: failure ? 502 : 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
