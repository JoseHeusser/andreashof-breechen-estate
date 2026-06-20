-- Tracks the daily booking-reminders edge function so we never send the
-- same email twice. Both columns nullable; populated on successful send.
alter table public.bookings
  add column if not exists reminder_balance_sent_at timestamptz,
  add column if not exists reminder_arrival_sent_at timestamptz;

create index if not exists bookings_arrival_status_idx
  on public.bookings (arrival, status)
  where is_cleaning = false;
