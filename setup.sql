-- Supabase setup for Study Hub (run once in SQL Editor)

create table if not exists public.app_state (
  id integer primary key check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_state (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_state enable row level security;

drop policy if exists "Public read app_state" on public.app_state;
drop policy if exists "Admin write app_state" on public.app_state;

create policy "Public read app_state"
  on public.app_state for select to anon, authenticated
  using (true);

create policy "Admin write app_state"
  on public.app_state for all to authenticated
  using (true) with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read ebooks" on storage.objects;
drop policy if exists "Admin write ebooks" on storage.objects;

create policy "Public read ebooks"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'ebooks');

create policy "Admin write ebooks"
  on storage.objects for all to authenticated
  using (bucket_id = 'ebooks')
  with check (bucket_id = 'ebooks');
