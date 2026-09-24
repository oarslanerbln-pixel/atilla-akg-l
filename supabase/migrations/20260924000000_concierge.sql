-- Atilla concierge: tour catalogue, local guides, CRM contacts, message log and bookings.
-- Every table has RLS enabled with no policies and no grants for anon/authenticated:
-- only the server (service role) can read or write.
--
-- Personal data is encrypted by the app before it reaches the database (AES-256-GCM, see
-- src/lib/concierge/crypto.ts). Columns marked "ciphertext" hold v1.<key>.<iv>.<data>.<tag>
-- tokens, so a leaked backup or dashboard session exposes no names, numbers or conversations.

create extension if not exists pgcrypto;

create table public.tours (
  id text primary key,
  name jsonb not null,                 -- {"de": "...", "en": "...", "tr": "..."}
  summary jsonb not null,
  region text not null,
  duration_hours numeric(4, 1) not null,
  price_per_person_eur integer not null check (price_per_person_eur > 0),
  child_price_eur integer check (child_price_eur >= 0),
  deposit_percent integer not null default 30 check (deposit_percent between 1 and 100),
  languages text[] not null default '{de,en,tr}',
  includes jsonb not null default '[]',
  excludes jsonb not null default '[]',
  meeting_point text,
  meeting_point_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,              -- E.164 without "+", e.g. 905321234567
  languages text[] not null default '{}',
  regions text[] not null default '{}',
  active boolean not null default true
);

create table public.departures (
  id uuid primary key default gen_random_uuid(),
  tour_id text not null references public.tours (id) on delete cascade,
  starts_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  guide_id uuid references public.guides (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  unique (tour_id, starts_at)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('whatsapp', 'instagram')),
  external_id text not null,           -- ciphertext: WhatsApp wa_id or Instagram-scoped user id
  external_id_hash text not null,      -- HMAC blind index of channel + external_id, for lookups
  name text,                           -- ciphertext
  username text,                       -- ciphertext
  language text check (language in ('de', 'en', 'tr')),
  email text,                          -- ciphertext
  phone text,                          -- ciphertext
  stage text not null default 'new'
    check (stage in ('new', 'qualifying', 'qualified', 'offer_sent', 'booked', 'completed', 'lost')),
  qualification text,                  -- ciphertext of a JSON object
  bot_paused boolean not null default false,
  marketing_consent boolean not null default false,
  agent_lock_until timestamptz,
  last_inbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, external_id_hash)
);

create table public.messages (
  id bigint generated always as identity primary key,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  role text not null check (role in ('customer', 'assistant', 'human')),
  body text not null,                  -- ciphertext
  meta_message_id text unique,
  created_at timestamptz not null default now()
);
create index messages_contact_idx on public.messages (contact_id, id desc);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  departure_id uuid not null references public.departures (id),
  adults integer not null check (adults >= 1),
  children integer not null default 0 check (children >= 0),
  full_name text not null,             -- ciphertext
  email text not null,                 -- ciphertext
  total_eur integer not null,
  deposit_eur integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'deposit_paid', 'expired', 'cancelled', 'completed')),
  stripe_session_id text unique,
  expires_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index bookings_departure_idx on public.bookings (departure_id);

-- WhatsApp alerts sent to Atilla; replying to one relays the reply to that customer.
create table public.staff_alerts (
  meta_message_id text primary key,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Webhook events that must run once even when Meta or Stripe deliver them again.
create table public.processed_events (
  id text primary key,
  created_at timestamptz not null default now()
);

-- Unpaid bookings hold their seats until the deposit link expires.
create view public.departure_availability with (security_invoker = true) as
select
  d.id as departure_id,
  d.tour_id,
  d.starts_at,
  d.capacity,
  d.guide_id,
  d.status,
  (d.capacity - coalesce(sum(b.adults + b.children) filter (
    where b.status = 'deposit_paid' or (b.status = 'pending' and b.expires_at > now())
  ), 0))::integer as seats_left
from public.departures d
left join public.bookings b on b.departure_id = d.id
group by d.id;

-- Lets only one agent run answer a contact at a time. Returns null when the lock is taken.
create function public.claim_agent_turn(p_contact_id uuid, p_seconds integer default 120)
returns boolean
language sql
as $$
  update public.contacts
  set agent_lock_until = now() + make_interval(secs => p_seconds)
  where id = p_contact_id and (agent_lock_until is null or agent_lock_until < now())
  returning true;
$$;

alter table public.tours enable row level security;
alter table public.guides enable row level security;
alter table public.departures enable row level security;
alter table public.contacts enable row level security;
alter table public.messages enable row level security;
alter table public.bookings enable row level security;
alter table public.staff_alerts enable row level security;
alter table public.processed_events enable row level security;

-- Deletes personal data nobody needs any more (DSGVO Art. 5(1)(e) storage limitation).
-- Contacts with a paid or completed booking are kept for accounting; everyone else is removed
-- after the retention period, together with their messages and unpaid bookings (cascade).
-- Schedule daily with pg_cron: select cron.schedule('concierge-purge', '30 3 * * *', 'select public.purge_stale_personal_data()');
create function public.purge_stale_personal_data(p_retention interval default interval '24 months')
returns void
language sql
as $$
  delete from public.contacts c
  where greatest(c.updated_at, coalesce(c.last_inbound_at, c.created_at)) < now() - p_retention
    and not exists (
      select 1 from public.bookings b
      where b.contact_id = c.id and b.status in ('deposit_paid', 'completed')
    );

  delete from public.messages where created_at < now() - p_retention;
  delete from public.processed_events where created_at < now() - interval '30 days';
  delete from public.staff_alerts where created_at < now() - interval '90 days';
$$;

-- Defence in depth on top of RLS: the public API roles get no table or function access at all.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on function public.claim_agent_turn(uuid, integer) from public, anon, authenticated;
revoke execute on function public.purge_stale_personal_data(interval) from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
