-- Partner offers (affiliate programmes such as American Express via Awin, Admitad or FinanceAds)
-- and first-touch attribution: which reel or post brought each customer, booking and link click.

-- ---------- Attribution ----------

-- Instagram posts and reels that brought in at least one comment, with a link for the dashboard.
create table public.instagram_media (
  id text primary key,                 -- Instagram media id
  permalink text,
  caption text,
  first_seen_at timestamptz not null default now()
);

alter table public.contacts
  add column source_media_id text references public.instagram_media (id) on delete set null,
  add column source_keyword text;      -- the comment keyword that started the conversation

alter table public.bookings
  add column source_media_id text references public.instagram_media (id) on delete set null;

-- ---------- Partner offers ----------

create table public.affiliate_offers (
  id text primary key,                 -- e.g. 'amex-gold'
  network text not null,               -- awin, admitad, financeads, direct …
  name jsonb not null,                 -- {"de": "...", "en": "...", "tr": "..."}
  pitch jsonb not null,                -- short factual description approved by the programme
  -- Tracking link from the network. {click_id} is replaced with our click id, e.g.
  -- Awin: https://www.awin1.com/cread.php?awinmid=…&awinaffid=…&clickref={click_id}
  tracking_url text not null check (tracking_url like 'https://%' and tracking_url like '%{click_id}%'),
  keywords text[] not null default '{}', -- comment words that trigger this offer, lower case
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Every link we hand out. The id travels to the network as sub id, so commissions in the
-- network's report can be matched back to the reel and (while it exists) the contact.
create table public.affiliate_clicks (
  id text primary key,
  offer_id text not null references public.affiliate_offers (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  source_media_id text references public.instagram_media (id) on delete set null,
  clicks integer not null default 0,
  first_clicked_at timestamptz,
  created_at timestamptz not null default now()
);
create index affiliate_clicks_offer_idx on public.affiliate_clicks (offer_id);

-- Counts a click and returns where to send the visitor, or null for unknown or paused offers.
create function public.register_affiliate_click(p_id text)
returns text
language sql
as $$
  update public.affiliate_clicks c
  set clicks = c.clicks + 1, first_clicked_at = coalesce(c.first_clicked_at, now())
  from public.affiliate_offers o
  where c.id = p_id and o.id = c.offer_id and o.active
  returning replace(o.tracking_url, '{click_id}', c.id);
$$;

-- What each reel or post earned: conversations, paid tours and partner-link clicks.
create view public.source_performance with (security_invoker = true) as
select
  m.id as media_id,
  m.permalink,
  left(m.caption, 80) as caption,
  (select count(*) from public.contacts c where c.source_media_id = m.id) as conversations,
  (select count(*) from public.bookings b
    where b.source_media_id = m.id and b.status in ('deposit_paid', 'completed')) as paid_bookings,
  (select coalesce(sum(b.total_eur), 0) from public.bookings b
    where b.source_media_id = m.id and b.status in ('deposit_paid', 'completed')) as booked_revenue_eur,
  (select count(*) from public.affiliate_clicks a where a.source_media_id = m.id) as partner_links_sent,
  (select count(*) from public.affiliate_clicks a where a.source_media_id = m.id and a.clicks > 0) as partner_links_opened,
  m.first_seen_at
from public.instagram_media m;

alter table public.instagram_media enable row level security;
alter table public.affiliate_offers enable row level security;
alter table public.affiliate_clicks enable row level security;

revoke all on public.instagram_media, public.affiliate_offers, public.affiliate_clicks, public.source_performance
  from anon, authenticated;
revoke execute on function public.register_affiliate_click(text) from public, anon, authenticated;
