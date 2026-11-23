-- Personal discount on a booking. Andrea grants it from the admin after the
-- contract has gone out; the guest is told in a separate email and the
-- rental contract itself stays as signed (total_price_cents is untouched).
--
-- The discount is settled with the final payment: every later email that
-- quotes the balance subtracts discount_cents from it.

alter table public.bookings
  add column if not exists discount_cents integer
    check (discount_cents is null or discount_cents > 0),
  -- when the guest was last told about the discount by email
  add column if not exists discount_sent_at timestamptz;
