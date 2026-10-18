-- Mail log: every email the site sends to a guest, plus every reply that
-- comes back through the Resend inbound webhook. Feeds the "Postfach" tab
-- in the admin, so Andrea can see the whole conversation per guest.

create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  direction text not null check (direction in ('outbound', 'inbound')),
  -- which template produced it: 'custom' for free text written in the admin,
  -- otherwise the template key (requestedGuest, acceptedGuest, …)
  kind text not null default 'custom',
  from_email text not null,
  to_email text not null,
  subject text not null default '',
  body_html text,
  body_text text,
  -- [{ filename, contentType }] — file contents are not stored
  attachments jsonb not null default '[]'::jsonb,
  provider_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists emails_created_at_idx on public.emails (created_at desc);
create index if not exists emails_booking_idx on public.emails (booking_id, created_at desc);
-- Conversations are grouped by the guest's address.
-- An expression index needs its own parentheses around the expression.
create index if not exists emails_counterpart_idx on public.emails (
  (case when direction = 'inbound' then from_email else to_email end)
);

alter table public.emails enable row level security;

-- No anon/authenticated policies on purpose: the admin reads and writes this
-- table exclusively through the service-role key on the server, exactly like
-- bookings. Without a policy, client-side access is denied by default.
