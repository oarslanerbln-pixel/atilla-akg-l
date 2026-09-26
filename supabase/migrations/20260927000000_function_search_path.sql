-- Pin the search path of our functions (Supabase security advisor 0011), so a schema object
-- with a matching name can never shadow the tables they touch. All bodies use qualified names.
alter function public.claim_agent_turn(uuid, integer) set search_path = '';
alter function public.purge_stale_personal_data(interval) set search_path = '';
alter function public.register_affiliate_click(text) set search_path = '';
