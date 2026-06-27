-- Keep the stored deposit setting aligned with the current booking policy.
insert into public.settings (key, value)
  values ('deposit_percentage', '50'::jsonb)
  on conflict (key) do update set value = excluded.value;
