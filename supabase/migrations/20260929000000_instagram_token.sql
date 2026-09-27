-- Tokens from the Instagram API with Instagram Login expire after 60 days. The weekly cron
-- /api/cron/instagram-token renews the token and keeps the current one here, so the bot does not
-- go silent when the token pasted into Vercel runs out (src/lib/concierge/tokens.ts).
--
-- token is ciphertext (AES-256-GCM, associated data access_tokens.token:<id>). seed_hash is a keyed
-- fingerprint of the INSTAGRAM_ACCESS_TOKEN the row grew from: when a new token is pasted into
-- Vercel, the app sees the mismatch and replaces the stored one.

create table public.access_tokens (
  id text primary key,                            -- 'instagram'
  token text not null,                            -- ciphertext
  seed_hash text not null,
  obtained_at timestamptz not null default now(), -- Meta issued the token no later than this
  expires_at timestamptz                          -- known once the token has been refreshed
);

alter table public.access_tokens enable row level security;

revoke all on public.access_tokens from anon, authenticated;
