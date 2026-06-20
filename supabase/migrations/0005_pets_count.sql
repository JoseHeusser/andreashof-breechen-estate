-- Replace the boolean has_pet with an integer pet count.
-- Idempotent — safe to re-run.

alter table public.bookings
  add column if not exists pets integer not null default 0 check (pets >= 0);

-- If old has_pet was true, port it over as 1 (best guess we have).
update public.bookings
  set pets = greatest(pets, 1)
  where pets = 0 and has_pet = true;

alter table public.bookings drop column if exists has_pet;
