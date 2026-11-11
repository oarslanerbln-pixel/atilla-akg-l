import { staff } from '@/lib/concierge/copy';
import { safeEqual } from '@/lib/concierge/crypto';
import { runStatusCheck } from '@/lib/concierge/status';
import { mailFailure, mailOperator } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Daily Vercel Cron (vercel.json), also run on demand: `vercel crons run /api/cron/status`.
// Read-only: it checks every setting and connection the site and the concierge need and logs
// one line per problem, by name only, so a setting saved empty in Vercel shows up within a day.
// Vercel keeps runtime logs for about an hour, so problems are also mailed to CONTACT_TO_EMAIL.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('CRON_SECRET is not configured', { status: 503 });
  if (!safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const report = await runStatusCheck();
  const problems: string[] = [];

  for (const [feature, { required, missing }] of Object.entries(report.env)) {
    if (!missing.length) continue;
    const line = `${feature}: ${missing.join(', ')} missing or empty`;
    if (required) {
      problems.push(line);
      console.error(`[status] ${line}`);
    } else {
      console.info(`[status] ${line} (feature off)`);
    }
  }
  for (const [name, check] of Object.entries(report.checks)) {
    if (check.ok) {
      console.info(`[status] ${name}: ok ${check.detail ? JSON.stringify(check.detail) : ''}`.trimEnd());
    } else {
      problems.push(`${name}: ${check.error}`);
      console.error(`[status] ${name}: failed: ${check.error}`);
    }
  }
  console.info(`[status] ${report.ok ? 'all good' : 'needs attention'}`);

  let alert: 'none' | 'mailed' | 'failed' = 'none';
  if (problems.length) alert = await mailAlert(problems);

  return Response.json({ ...report, alert }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Problems carry names, counts and provider messages only, so they can go by mail as logged. */
async function mailAlert(problems: string[]): Promise<'mailed' | 'failed'> {
  // Without mail settings they are themselves among the problems; the log above is all there is.
  const failure = mailFailure(await mailOperator(staff.statusAlert(problems)));
  if (failure) {
    console.error(`[status] alert not sent: ${failure}`);
    return 'failed';
  }
  console.info('[status] alert mailed');
  return 'mailed';
}
