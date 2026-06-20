-- Runs booking-reminders once per day.
-- The Edge Function was deployed with --no-verify-jwt, so pg_net can call it
-- without storing another service key in Vault.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

insert into public.settings (key, value)
  values ('booking_reminders_url',
          to_jsonb('https://vhwusfuqfqyacvhhldss.functions.supabase.co/booking-reminders'::text))
  on conflict (key) do update set value = excluded.value;

create or replace function public.trigger_booking_reminders(p_reason text default 'cron')
returns void
language plpgsql
security definer
as $$
declare
  v_url text;
begin
  select value->>0 into v_url
    from public.settings
    where key = 'booking_reminders_url';

  if v_url is null or v_url = '' then
    return;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('reason', p_reason)
  );
end $$;

select cron.unschedule('booking-reminders-daily')
  where exists (select 1 from cron.job where jobname = 'booking-reminders-daily');

-- 07:15 UTC = 09:15 Berlin summer time / 08:15 Berlin winter time.
select cron.schedule(
  'booking-reminders-daily',
  '15 7 * * *',
  $$select public.trigger_booking_reminders('cron')$$
);
