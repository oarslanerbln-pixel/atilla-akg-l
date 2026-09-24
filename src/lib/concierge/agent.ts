import Anthropic from '@anthropic-ai/sdk';
import { CONCIERGE, env } from './config';
import { getContact, recentMessages, updateContact, type Contact, type StoredMessage } from './db';
import { alertStaff, sendToContact } from './meta';
import { fallbackReply, staff } from './copy';
import { SYSTEM_PROMPT } from './prompt';
import { runTool, TOOLS, type ToolContext } from './tools';

type MessageParam = Anthropic.Beta.BetaMessageParam;

let anthropic: Anthropic | null = null;
const client = () => (anthropic ??= new Anthropic());

function crmContext(contact: Contact, history: StoredMessage[]): string {
  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: CONCIERGE.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());
  const profile = {
    name: contact.name,
    instagram_username: contact.username,
    language: contact.language,
    email: contact.email,
    stage: contact.stage,
    ...contact.qualification,
  };
  return [
    '<crm_context>',
    `now: ${now} (${CONCIERGE.timezone})`,
    `channel: ${contact.channel}`,
    `first_reply_to_this_customer: ${!history.some((m) => m.role !== 'customer')}`,
    `known_profile: ${JSON.stringify(profile)}`,
    '</crm_context>',
  ].join('\n');
}

/**
 * Rebuilds the conversation from the message log as plain text turns. Earlier turns are
 * byte-identical between runs, so the growing prefix keeps hitting the prompt cache.
 */
function buildMessages(history: StoredMessage[], context: string): MessageParam[] {
  const turns: { role: 'user' | 'assistant'; parts: string[] }[] = [];
  for (const m of history) {
    const role = m.role === 'customer' ? 'user' : 'assistant';
    const text = m.role === 'human' ? `[Atilla wrote personally] ${m.body}` : m.body;
    const last = turns.at(-1);
    if (last?.role === role) last.parts.push(text);
    else turns.push({ role, parts: [text] });
  }
  while (turns[0]?.role === 'assistant') turns.shift();
  if (turns.at(-1)?.role !== 'user') return [];

  return turns.map((turn, i) => {
    const text = turn.parts.join('\n\n');
    if (i < turns.length - 1) return { role: turn.role, content: text };
    return {
      role: 'user',
      content: [
        { type: 'text', text: context },
        { type: 'text', text },
      ],
    };
  });
}

async function executeTool(block: Anthropic.Beta.BetaToolUseBlock, ctx: ToolContext) {
  try {
    const result = await runTool(block.name, (block.input ?? {}) as Record<string, unknown>, ctx);
    return {
      type: 'tool_result' as const,
      tool_use_id: block.id,
      content: JSON.stringify(result),
      is_error: typeof result === 'object' && result !== null && 'error' in result,
    };
  } catch (error) {
    console.error(`[concierge] tool ${block.name} failed`, error);
    return {
      type: 'tool_result' as const,
      tool_use_id: block.id,
      content: 'The booking system had a technical problem. Do not retry; offer to have Atilla follow up.',
      is_error: true,
    };
  }
}

/** Stops the bot for this customer, tells them Atilla will answer and alerts Atilla. */
async function escalate(ctx: ToolContext): Promise<void> {
  const contact = await updateContact(ctx.contact.id, { bot_paused: true });
  await sendToContact(contact, fallbackReply(contact.language ?? 'en'));
  await alertStaff(env('STAFF_WHATSAPP'), staff.refusal(contact.name ?? contact.username ?? contact.external_id), contact);
}

async function deliver(ctx: ToolContext, reply: string): Promise<void> {
  if (!reply) return;
  const latest = await getContact(ctx.contact.id);
  // Atilla may have taken over while the model was thinking; his message wins.
  if (latest.bot_paused && !ctx.handedOff) return;
  await sendToContact(latest, reply);
}

/** Answers the newest customer messages of one contact. */
export async function runConcierge(contactId: string): Promise<void> {
  const contact = await getContact(contactId);
  if (contact.bot_paused) return;

  const history = await recentMessages(contact.id, CONCIERGE.historyLimit);
  const messages = buildMessages(history, crmContext(contact, history));
  if (!messages.length) return;

  const ctx: ToolContext = { contact, handedOff: false };

  for (let i = 0; i < CONCIERGE.maxAgentIterations; i++) {
    const response = await client().beta.messages.create({
      model: CONCIERGE.model,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      cache_control: { type: 'ephemeral' },
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    if (response.stop_reason === 'refusal') {
      console.warn('[concierge] refusal', response.stop_details);
      await escalate(ctx);
      return;
    }

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'pause_turn') continue;

    if (response.stop_reason === 'tool_use') {
      const results = [];
      // Sequential on purpose: tools update the same contact row.
      for (const block of response.content) {
        if (block.type === 'tool_use') results.push(await executeTool(block, ctx));
      }
      messages.push({ role: 'user', content: results });
      continue;
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n\n')
      .trim();
    await deliver(ctx, reply);
    return;
  }

  console.warn(`[concierge] iteration cap reached for contact ${contactId}`);
  await escalate(ctx);
}
