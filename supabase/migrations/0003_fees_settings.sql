-- Adds three fee settings used to compute total booking price:
--   • cleaning_fee_cents          — flat fee per stay
--   • base_occupancy              — guests included in the base nightly price
--   • extra_person_fee_per_night  — per-night surcharge per guest above base_occupancy
-- All values are integers stored as jsonb so they can be edited from the admin.

insert into public.settings (key, value) values
  ('cleaning_fee_cents',                '35000'::jsonb),  -- 350,00 €
  ('base_occupancy',                    '10'::jsonb),
  ('extra_person_fee_per_night_cents',  '0'::jsonb)
on conflict (key) do nothing;
