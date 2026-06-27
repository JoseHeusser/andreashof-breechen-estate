-- Lightweight first-party page analytics for the admin dashboard.
create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  path text not null,
  referrer text,
  user_agent text,
  language text,
  session_id text
);

create index if not exists page_visits_occurred_at_idx
  on public.page_visits (occurred_at desc);

create index if not exists page_visits_path_idx
  on public.page_visits (path);

create index if not exists page_visits_session_id_idx
  on public.page_visits (session_id)
  where session_id is not null;

alter table public.page_visits enable row level security;
