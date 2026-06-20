-- Add per-booking extras: children (under 2, free unless they need a crib),
-- pet, wheelchair access requirement, and the optional Dachboden / yoga
-- centre rental. Plus 3 new editable price knobs in settings.
--
-- Idempotent — safe to re-run.

alter table public.bookings
  add column if not exists children integer not null default 0 check (children >= 0),
  add column if not exists needs_crib boolean not null default false,
  add column if not exists has_pet boolean not null default false,
  add column if not exists needs_wheelchair boolean not null default false,
  add column if not exists rents_dachboden boolean not null default false;

insert into public.settings (key, value) values
  ('child_crib_fee_cents',  '1000'::jsonb),  -- 10 € per child, one-time
  ('pet_fee_cents',         '4000'::jsonb),  -- 40 € per stay, one-time
  ('dachboden_fee_cents',   '0'::jsonb),     -- admin sets
  ('max_capacity_extended', '25'::jsonb)     -- with Dachboden apartments
on conflict (key) do nothing;
