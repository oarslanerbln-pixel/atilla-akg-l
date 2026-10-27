-- An offer can be limited to the comments under particular posts or reels, named by the code in
-- their link (instagram.com/reel/<code>/). Empty, as for every existing offer: everywhere.
-- Run before supabase/offers.sql, which fills it.
alter table public.affiliate_offers add column media_codes text[] not null default '{}';
