-- ═══════════════════════════════════════════════════
-- CUPPING — Supabase Schema v1.0
-- Run this in Supabase SQL Editor to set up the database
-- ═══════════════════════════════════════════════════

-- ══════ ENUMS ══════

create type coffee_type as enum ('bean', 'ground', 'capsule', 'instant', 'cold_brew');
create type roast_level as enum ('light', 'medium', 'medium_dark', 'dark');
create type brew_method as enum ('espresso', 'pour_over', 'french_press', 'aeropress', 'moka', 'drip', 'cold_brew', 'capsule_machine');
create type flavor_tag as enum ('chocolate', 'nutty', 'fruity', 'floral', 'citrus', 'spicy', 'herbal', 'sweet', 'earthy', 'smoky', 'vanilla', 'honey', 'berry', 'tropical', 'wine');
create type collection_type as enum ('at_home', 'favorites', 'to_try', 'tried');

-- ══════ USERS ══════
-- Extends Supabase auth.users with profile data

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

-- ══════ COFFEES ══════
-- Global coffee catalog — shared across users

create table public.coffees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  type coffee_type not null,
  origin text,
  roast_level roast_level,
  image_url text,
  avg_rating numeric(2,1) default 0,
  total_reviews integer default 0,
  created_by uuid references public.users(id),
  created_at timestamptz default now() not null
);

-- ══════ COFFEE ENTRIES ══════
-- A user's review/rating of a specific coffee

create table public.coffee_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  rating_global numeric(2,1) not null check (rating_global >= 0.5 and rating_global <= 5.0),
  rating_aroma smallint check (rating_aroma >= 0 and rating_aroma <= 10),
  rating_body smallint check (rating_body >= 0 and rating_body <= 10),
  rating_acidity smallint check (rating_acidity >= 0 and rating_acidity <= 10),
  rating_sweetness smallint check (rating_sweetness >= 0 and rating_sweetness <= 10),
  rating_bitterness smallint check (rating_bitterness >= 0 and rating_bitterness <= 10),
  rating_aftertaste smallint check (rating_aftertaste >= 0 and rating_aftertaste <= 10),
  notes text,
  photo_url text,
  brew_method brew_method,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ══════ ENTRY FLAVOR TAGS ══════
-- Many-to-many: which flavors a user detected in a coffee

create table public.entry_flavor_tags (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.coffee_entries(id) on delete cascade,
  tag flavor_tag not null,
  unique(entry_id, tag)
);

-- ══════ COLLECTIONS ══════

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type collection_type not null,
  icon text,
  is_default boolean default false,
  created_at timestamptz default now() not null,
  unique(user_id, type)
);

-- ══════ COLLECTION ITEMS ══════

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  added_at timestamptz default now() not null,
  unique(collection_id, coffee_id)
);

-- ══════ FOLLOWS ══════

create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- ══════ INDEXES ══════

create index idx_coffee_entries_user on public.coffee_entries(user_id);
create index idx_coffee_entries_coffee on public.coffee_entries(coffee_id);
create index idx_coffee_entries_created on public.coffee_entries(created_at desc);
create index idx_entry_flavor_tags_entry on public.entry_flavor_tags(entry_id);
create index idx_entry_flavor_tags_tag on public.entry_flavor_tags(tag);
create index idx_collections_user on public.collections(user_id);
create index idx_collection_items_collection on public.collection_items(collection_id);
create index idx_collection_items_coffee on public.collection_items(coffee_id);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
create index idx_coffees_brand on public.coffees(brand);
create index idx_coffees_type on public.coffees(type);
create index idx_coffees_avg_rating on public.coffees(avg_rating desc);

-- ══════ FUNCTIONS ══════

-- Auto-update avg_rating on coffees when entries change
create or replace function public.update_coffee_avg_rating()
returns trigger as $$
begin
  update public.coffees
  set
    avg_rating = (
      select round(avg(rating_global)::numeric, 1)
      from public.coffee_entries
      where coffee_id = coalesce(new.coffee_id, old.coffee_id)
    ),
    total_reviews = (
      select count(*)
      from public.coffee_entries
      where coffee_id = coalesce(new.coffee_id, old.coffee_id)
    )
  where id = coalesce(new.coffee_id, old.coffee_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_entry_change
  after insert or update or delete on public.coffee_entries
  for each row execute function public.update_coffee_avg_rating();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.coffee_entries
  for each row execute function public.update_updated_at();

create trigger set_updated_at_users
  before update on public.users
  for each row execute function public.update_updated_at();

-- Auto-create default collections for new users
create or replace function public.create_default_collections()
returns trigger as $$
begin
  insert into public.collections (user_id, name, type, icon, is_default) values
    (new.id, 'En casa', 'at_home', '🏠', true),
    (new.id, 'Favoritos', 'favorites', '⭐', true),
    (new.id, 'Pendientes', 'to_try', '📋', true),
    (new.id, 'Probados', 'tried', '✅', true);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_created
  after insert on public.users
  for each row execute function public.create_default_collections();

-- ══════ ROW LEVEL SECURITY ══════

alter table public.users enable row level security;
alter table public.coffees enable row level security;
alter table public.coffee_entries enable row level security;
alter table public.entry_flavor_tags enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.follows enable row level security;

-- Users: anyone can read, only own profile editable
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Coffees: anyone can read, authenticated users can create
create policy "Coffees are viewable by everyone" on public.coffees for select using (true);
create policy "Authenticated users can create coffees" on public.coffees for insert with check (auth.uid() is not null);

-- Coffee entries: own entries only for write, all readable
create policy "Entries are viewable by everyone" on public.coffee_entries for select using (true);
create policy "Users can create own entries" on public.coffee_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.coffee_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.coffee_entries for delete using (auth.uid() = user_id);

-- Flavor tags: same as entries
create policy "Tags are viewable by everyone" on public.entry_flavor_tags for select using (true);
create policy "Users can manage tags on own entries" on public.entry_flavor_tags
  for all using (
    exists (
      select 1 from public.coffee_entries
      where id = entry_flavor_tags.entry_id and user_id = auth.uid()
    )
  );

-- Collections: own collections only
create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id);
create policy "Users can manage own collections" on public.collections for all using (auth.uid() = user_id);

-- Collection items: follows collection ownership
create policy "Users can view own collection items" on public.collection_items for select
  using (
    exists (
      select 1 from public.collections
      where id = collection_items.collection_id and user_id = auth.uid()
    )
  );
create policy "Users can manage own collection items" on public.collection_items for all
  using (
    exists (
      select 1 from public.collections
      where id = collection_items.collection_id and user_id = auth.uid()
    )
  );

-- Follows: readable by all, writeable by follower
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- ══════ STORAGE ══════
-- Run these in Supabase Dashboard > Storage

-- Create bucket for coffee photos
-- insert into storage.buckets (id, name, public) values ('coffee-photos', 'coffee-photos', true);

-- Storage policy: authenticated users can upload to their own folder
-- create policy "Users can upload coffee photos"
--   on storage.objects for insert
--   with check (bucket_id = 'coffee-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Anyone can view coffee photos"
--   on storage.objects for select
--   using (bucket_id = 'coffee-photos');
