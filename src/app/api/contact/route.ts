import { NextResponse } from "next/server";

/**
 * Contact endpoint — the single revenue path of this site.
 *
 * This route previously resolved after a mocked 1.5s delay and answered
 * "Message securely delivered." while sending nothing at all, so every
 * inquiry was dropped silently and the visitor was told otherwise. The rule
 * now: either a mail provider acknowledges the message, or the request fails
 * loudly. Success is never claimed on the strength of a timer.
 */

export const runtime = "nodejs";

const LIMITS = { name: 100, email: 254, message: 5000 } as const;

/**
 * Deliberately permissive. Real-world addresses are stranger than most
 * regexes assume and the mail provider performs the authoritative check;
 * this only rejects input that cannot be an address at all.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Best-effort throttle. A serverless instance can be recycled or duplicated,
 * so this stops the common case — one client hammering a warm instance — and
 * is not a guarantee. The provider's own rate limit is the real backstop.
 */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;
const recentHits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentHits.set(key, hits);

  // Keep the map from growing without bound on a long-lived instance.
  if (recentHits.size > 500) {
    for (const [k, v] of recentHits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) recentHits.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

function readField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

/** Strip the characters an injected header line would need. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;

  // Honeypot: a real person never sees this field, so anything in it is a bot.
  // Answer 200 so the bot has no signal to adapt to, but send nothing.
  if (readField(payload.company, 200)) {
    return NextResponse.json({ message: "ok" }, { status: 200 });
  }

  const name = readField(payload.name, LIMITS.name);
  const email = readField(payload.email, LIMITS.email);
  const message = readField(payload.message, LIMITS.message);
  const consent = payload.consent === true;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!EMAIL_SHAPE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    // Misconfiguration must never look like a delivered message. Log for the
    // operator without touching the visitor's data, and tell the client the
    // channel is down so the UI can offer the direct mail address instead.
    console.error(
      "[contact] mail delivery is not configured: set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: headerSafe(from),
        to: [headerSafe(to)],
        reply_to: headerSafe(email),
        subject: `Neue Projektanfrage — ${headerSafe(name)}`,
        text: `Name: ${name}\nE-Mail: ${email}\n\n${message}`,
        html:
          `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` +
          `<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>` +
          `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });

    if (!response.ok) {
      // The provider's body can echo the submitted address, so log the status
      // only — the visitor's data does not belong in the platform log.
      console.error(`[contact] provider rejected the message: ${response.status}`);
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }

    return NextResponse.json({ message: "delivered" }, { status: 200 });
  } catch {
    console.error("[contact] could not reach the mail provider");
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
