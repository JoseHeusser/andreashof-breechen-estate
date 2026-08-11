-- Guest reviews. Submitted via /rezension/<token> (token gated in code),
-- moderated from /admin. Only status='published' rows land on the home page.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  quote text not null,
  language text not null default 'de' check (language in ('de','en','es')),
  rating smallint check (rating between 1 and 5),
  status text not null default 'pending'
    check (status in ('pending','published','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;
-- No public read/write policies — the service role bypasses RLS and all
-- writes go through the server fns in src/lib/admin/server-fns.ts.

-- Reuse or create the shared updated_at trigger fn.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'reviews_touch_updated_at') then
    create or replace function public.reviews_touch_updated_at()
      returns trigger language plpgsql as $body$
      begin new.updated_at = now(); return new; end;
    $body$;
  end if;
end $$;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.reviews_touch_updated_at();
