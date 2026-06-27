-- Andreashof Breechen — initial admin schema.
-- Run once via Supabase Dashboard → SQL Editor.
-- Then create your first admin user via Authentication → Users → "Add user".

------------------------------------------------------------------
-- 1. Pricing
------------------------------------------------------------------
-- One row with type='base' is the default per-night price.
-- Rows with type='special' override the base for a given date range
-- (e.g. Weihnachten, Silvester). Higher `priority` wins on overlap.
create table public.pricing (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('base','special')),
  label text,                              -- e.g. "Weihnachten 2026"
  price_per_night_cents integer not null check (price_per_night_cents >= 0),
  start_date date,                          -- null for base
  end_date date,                            -- null for base
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_date_consistency check (
    (type = 'base'    and start_date is null and end_date is null) or
    (type = 'special' and start_date is not null and end_date is not null and start_date <= end_date)
  )
);
create index pricing_special_range_idx on public.pricing (start_date, end_date) where type = 'special';

------------------------------------------------------------------
-- 2. Bookings (web form requests + accepted reservations)
------------------------------------------------------------------
create type booking_status as enum (
  'requested',      -- guest filled the form, not reviewed
  'accepted',       -- Andrea approved, awaiting deposit
  'deposit_paid',   -- 50% in, awaiting balance
  'fully_paid',     -- 100% paid, confirmed
  'cancelled',      -- declined or cancelled
  'completed'       -- stay finished
);

create type booking_source as enum ('web', 'airbnb', 'manual');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  source booking_source not null default 'web',
  status booking_status not null default 'requested',

  arrival date not null,
  departure date not null,
  guests integer not null check (guests > 0),
  occasion text,                            -- 'wedding'|'family'|'retreat'|'other'

  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  message text,

  total_price_cents integer,                -- computed by admin or overridden
  deposit_amount_cents integer,
  internal_notes text,

  airbnb_uid text unique,                   -- iCal UID for Airbnb-sourced bookings

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_date_consistency check (arrival < departure)
);
create index bookings_arrival_idx on public.bookings (arrival);
create index bookings_status_idx on public.bookings (status);
create index bookings_source_idx on public.bookings (source);

------------------------------------------------------------------
-- 3. Settings (key-value, JSON)
------------------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed initial settings (base price 1500€/night placeholder; Andrea will edit)
insert into public.pricing (type, price_per_night_cents, priority)
  values ('base', 150000, 0);

insert into public.settings (key, value) values
  ('airbnb_ical_url', '""'::jsonb),
  ('deposit_percentage', '50'::jsonb),
  ('min_nights', '2'::jsonb);

------------------------------------------------------------------
-- 4. updated_at trigger
------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger pricing_set_updated_at  before update on public.pricing  for each row execute function public.tg_set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.tg_set_updated_at();
create trigger settings_set_updated_at before update on public.settings for each row execute function public.tg_set_updated_at();

------------------------------------------------------------------
-- 5. Row-Level Security — public has NO direct access. All reads &
--    writes go through server-side code that uses the service_role
--    key (which bypasses RLS).
------------------------------------------------------------------
alter table public.pricing  enable row level security;
alter table public.bookings enable row level security;
alter table public.settings enable row level security;
-- No policies = locked down for anon + authenticated. Service role bypasses.

------------------------------------------------------------------
-- 6. View: bookings that block a date (for availability checks)
------------------------------------------------------------------
create or replace view public.blocked_ranges as
  select id, source, status, arrival, departure
  from public.bookings
  where status in ('accepted', 'deposit_paid', 'fully_paid');

comment on view public.blocked_ranges is
  'Bookings that count as "the house is taken". Web requests in status=requested do not block until Andrea accepts.';
