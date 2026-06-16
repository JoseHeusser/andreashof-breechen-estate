-- Airbnb sync wiring: hourly pg_cron + trigger on every booking change.
-- Requires the airbnb-sync Edge Function to be deployed.
--
-- Before running, replace <YOUR_PROJECT_REF> below with the actual project
-- ref (already filled: vhwusfuqfqyacvhhldss).

-- 1. Enable extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Store the edge-function URL + a sync key in settings so we can change them
-- without touching the function body / cron.
insert into public.settings (key, value)
  values ('airbnb_sync_url',
          to_jsonb('https://vhwusfuqfqyacvhhldss.supabase.co/functions/v1/airbnb-sync'::text))
  on conflict (key) do update set value = excluded.value;

insert into public.settings (key, value)
  values ('airbnb_last_synced_at', to_jsonb(''::text))
  on conflict (key) do nothing;

-- 2. Helper function — fires-and-forgets a POST to the Edge Function.
--    Reads its own auth key from Vault (we set it below) so it isn't in
--    the function body verbatim.
create or replace function public.trigger_airbnb_sync(p_reason text default 'auto')
returns void
language plpgsql
security definer
as $$
declare
  v_url text;
  v_key text;
begin
  select value->>0 into v_url from public.settings where key = 'airbnb_sync_url';
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'airbnb_sync_service_key';

  if v_url is null or v_url = '' or v_key is null then
    return; -- silently skip if not configured yet
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Authorization', 'Bearer ' || v_key,
                 'Content-Type',  'application/json'
               ),
    body    := jsonb_build_object('reason', p_reason)
  );
end $$;

-- 3. Trigger on the bookings table — every insert / update fires a sync.
--    The 30-second rate limit lives inside the edge function so we never
--    hit Airbnb more often than that.
create or replace function public.tg_bookings_sync_airbnb()
returns trigger language plpgsql as $$
begin
  perform public.trigger_airbnb_sync('booking_change');
  return null;
end $$;

drop trigger if exists bookings_airbnb_sync on public.bookings;
create trigger bookings_airbnb_sync
  after insert or update on public.bookings
  for each row execute function public.tg_bookings_sync_airbnb();

-- 4. Hourly cron schedule.
select cron.unschedule('airbnb-sync-hourly')
  where exists (select 1 from cron.job where jobname = 'airbnb-sync-hourly');
select cron.schedule(
  'airbnb-sync-hourly',
  '0 * * * *',
  $$select public.trigger_airbnb_sync('cron')$$
);
