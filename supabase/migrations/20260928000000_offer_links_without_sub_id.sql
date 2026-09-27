-- Some partner links cannot carry our click id (the GetYourGuide app link runs through Adjust),
-- so {click_id} in the tracking link becomes optional. Such clicks are still counted per reel or
-- story on our side; only the network's report can't be matched back to them.

alter table public.affiliate_offers drop constraint affiliate_offers_tracking_url_check;
alter table public.affiliate_offers
  add constraint affiliate_offers_tracking_url_check check (tracking_url like 'https://%');
