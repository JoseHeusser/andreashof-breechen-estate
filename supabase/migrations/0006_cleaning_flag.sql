-- Distinguishes cleaning days from real reservations.
--
-- Airbnb sometimes pushes "Airbnb (Not available)" events through the iCal
-- feed when the host marks a day as cleaning / blocked. Those rows land in
-- our bookings table as `source='airbnb'`. With this column the sync can
-- flag them, the calendars colour them separately and the bookings list
-- can hide them.
--
-- Idempotent.

alter table public.bookings
  add column if not exists is_cleaning boolean not null default false;

create index if not exists bookings_is_cleaning_idx on public.bookings (is_cleaning);
