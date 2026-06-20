-- Entry likes: users can like any coffee review
create table public.entry_likes (
  entry_id uuid not null references public.coffee_entries(id) on delete cascade,
  user_id  uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

alter table public.entry_likes enable row level security;

-- Anyone (including anon) can read likes
create policy "Anyone can read entry likes"
  on public.entry_likes
  for select
  using (true);

-- Authenticated users can like entries
create policy "Authenticated users can like"
  on public.entry_likes
  for insert
  with check (auth.uid() = user_id);

-- Users can only remove their own likes
create policy "Users can unlike their own likes"
  on public.entry_likes
  for delete
  using (auth.uid() = user_id);
