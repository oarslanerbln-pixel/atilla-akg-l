import "server-only";

// Resend, the site's one mail provider: the contact form and the status alert both send here.
// A result is either a delivery the provider accepted or a reason an operator can act on.

export interface Mail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export type MailResult =
  | { ok: true }
  | { ok: false; kind: "rejected"; detail: string }
  | { ok: false; kind: "unreachable" };

/** Every address in a provider message is masked: its body can echo the submitted one. */
const maskAddresses = (text: string) => text.replace(/[^\s<>"'`,;:()]+@[^\s<>"'`,;:()]+/g, "[address]");

export async function sendMail(apiKey: string, mail: Mail): Promise<MailResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mail.from,
        to: [mail.to],
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
        subject: mail.subject,
        text: mail.text,
        ...(mail.html ? { html: mail.html } : {}),
      }),
    });
    if (response.ok) return { ok: true };

    // The provider's reason is what an operator needs to fix a rejection (unverified domain,
    // malformed sender).
    const reason = await response
      .json()
      .then((b: { name?: unknown; message?: unknown }) =>
        [b?.name, b?.message].filter((v) => typeof v === "string").join(": "),
      )
      .catch(() => "");
    const masked = maskAddresses(reason).slice(0, 300);
    return { ok: false, kind: "rejected", detail: `${response.status}${masked ? ` ${masked}` : ""}` };
  } catch {
    return { ok: false, kind: "unreachable" };
  }
}
