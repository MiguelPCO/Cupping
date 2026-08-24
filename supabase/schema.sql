-- CUPPING — database schema
--
-- Reverse-engineered from the live Supabase Cloud project (introspected via
-- the Management API: pg_catalog/information_schema, not a pg_dump). Run
-- top to bottom in the Supabase Dashboard SQL Editor (or `psql`) against a
-- fresh project to reproduce the schema this app expects.
--
-- Requires: Supabase's built-in `pgcrypto` (gen_random_uuid) and `unaccent`
-- extensions, both available by default in the `extensions` schema.

create extension if not exists unaccent with schema extensions;

-- ============================================================
-- Enums
-- ============================================================

create type public.brew_method as enum (
  'espresso', 'pour_over', 'french_press', 'aeropress',
  'moka', 'drip', 'cold_brew', 'capsule_machine'
);

create type public.coffee_type as enum (
  'bean', 'ground', 'capsule', 'instant', 'cold_brew'
);

create type public.collection_type as enum (
  'at_home', 'favorites', 'to_try', 'tried'
);

create type public.entry_visibility as enum (
  'public', 'private'
);

create type public.flavor_tag as enum (
  'chocolate', 'nutty', 'fruity', 'floral', 'citrus', 'spicy',
  'herbal', 'sweet', 'earthy', 'smoky', 'vanilla', 'honey',
  'berry', 'tropical', 'wine'
);

create type public.roast_level as enum (
  'light', 'medium', 'medium_dark', 'dark'
);

-- ============================================================
-- Functions (created before triggers that reference them)
-- ============================================================

-- Locale-independent lowercase+unaccent, used in the generated
-- `coffees.brand_slug` column and safe to mark IMMUTABLE for indexing.
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable parallel safe strict
as $function$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$function$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Seeds the 4 default collections every user gets on signup.
create or replace function public.create_default_collections()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.collections (user_id, name, type, icon, is_default) values
    (new.id, 'En casa', 'at_home', '🏠', true),
    (new.id, 'Favoritos', 'favorites', '⭐', true),
    (new.id, 'Pendientes', 'to_try', '📋', true),
    (new.id, 'Probados', 'tried', '✅', true);
  return new;
end;
$function$;

-- Bayesian-average rating (prior: 3.0 over 5 reviews) + review count,
-- recomputed on the owning coffee row whenever a public entry changes.
create or replace function public.update_coffee_avg_rating()
returns trigger
language plpgsql
security definer
as $function$
begin
  update public.coffees
  set
    avg_rating = (
      select case when count(*) = 0 then null
      else round(((5.0 * 3.0 + count(*) * avg(rating_global)) / (5.0 + count(*)))::numeric, 1)
      end
      from public.coffee_entries
      where coffee_id = coalesce(new.coffee_id, old.coffee_id)
        and visibility = 'public'
    ),
    total_reviews = (
      select count(*)
      from public.coffee_entries
      where coffee_id = coalesce(new.coffee_id, old.coffee_id)
        and visibility = 'public'
    )
  where id = coalesce(new.coffee_id, old.coffee_id);
  return coalesce(new, old);
end;
$function$;

-- ============================================================
-- Tables
-- ============================================================

-- Profile row for every authenticated user. Created client-side by the
-- signup flow (there is no DB trigger on auth.users) — see
-- tests/e2e/helpers/create-test-user.ts for the reference insert shape.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]+$'),
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30)
);

-- Shared coffee catalog. Deduped by (lower(brand), lower(name), type) —
-- see src/lib/actions/coffee.ts, which looks up an existing row before
-- inserting. `created_by` is attribution only, not ownership: it's
-- nullable and ON DELETE SET NULL, because other users' entries may
-- reference a coffee whose original creator later deletes their account.
create table public.coffees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  type public.coffee_type not null,
  origin text,
  roast_level public.roast_level,
  image_url text,
  avg_rating numeric(2,1) default 0,
  total_reviews integer default 0,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  brand_slug text generated always as (
    regexp_replace(
      regexp_replace(
        btrim(regexp_replace(lower(public.immutable_unaccent(brand)), '[^a-z0-9\s-]', '', 'g')),
        '\s+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    )
  ) stored
);

create unique index idx_coffees_dedup on public.coffees using btree (lower(brand), lower(name), type);
create index idx_coffees_brand_slug on public.coffees using btree (brand_slug);
create index idx_coffees_brand on public.coffees using btree (brand);
create index idx_coffees_type on public.coffees using btree (type);
create index idx_coffees_avg_rating on public.coffees using btree (avg_rating desc);

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
  brew_method public.brew_method,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visibility public.entry_visibility not null default 'public'
);

create index idx_coffee_entries_created on public.coffee_entries using btree (created_at desc);
create index idx_coffee_entries_user on public.coffee_entries using btree (user_id);
create index idx_coffee_entries_coffee on public.coffee_entries using btree (coffee_id);

create table public.entry_flavor_tags (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.coffee_entries(id) on delete cascade,
  tag public.flavor_tag not null,
  unique (entry_id, tag)
);

create index idx_entry_flavor_tags_tag on public.entry_flavor_tags using btree (tag);
create index idx_entry_flavor_tags_entry on public.entry_flavor_tags using btree (entry_id);

create table public.entry_likes (
  entry_id uuid not null references public.coffee_entries(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index idx_follows_follower on public.follows using btree (follower_id);
create index idx_follows_following on public.follows using btree (following_id);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type public.collection_type not null,
  icon text,
  is_default boolean default false,
  created_at timestamptz not null default now(),
  unique (user_id, type)
);

create index idx_collections_user on public.collections using btree (user_id);

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (collection_id, coffee_id)
);

create index idx_collection_items_collection on public.collection_items using btree (collection_id);
create index idx_collection_items_coffee on public.collection_items using btree (coffee_id);

-- ============================================================
-- Triggers
-- ============================================================

create trigger set_updated_at_users before update on public.users
  for each row execute function public.update_updated_at();

create trigger on_user_created after insert on public.users
  for each row execute function public.create_default_collections();

create trigger set_updated_at before update on public.coffee_entries
  for each row execute function public.update_updated_at();

create trigger on_entry_change after insert or delete or update on public.coffee_entries
  for each row execute function public.update_coffee_avg_rating();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;
alter table public.coffees enable row level security;
alter table public.coffee_entries enable row level security;
alter table public.entry_flavor_tags enable row level security;
alter table public.entry_likes enable row level security;
alter table public.follows enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "Users are viewable by everyone" on public.users
  for select using (true);
create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Coffees are viewable by everyone" on public.coffees
  for select using (true);
create policy "Authenticated users can create coffees" on public.coffees
  for insert with check (auth.uid() is not null);

create policy "Entries are viewable by owner or if public" on public.coffee_entries
  for select using (visibility = 'public'::entry_visibility or user_id = auth.uid());
create policy "Users can create own entries" on public.coffee_entries
  for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.coffee_entries
  for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.coffee_entries
  for delete using (auth.uid() = user_id);

create policy "Tags are viewable by everyone" on public.entry_flavor_tags
  for select using (true);
create policy "Users can manage tags on own entries" on public.entry_flavor_tags
  for all using (exists (
    select 1 from public.coffee_entries
    where coffee_entries.id = entry_flavor_tags.entry_id
      and coffee_entries.user_id = auth.uid()
  ));

create policy "Anyone can read entry likes" on public.entry_likes
  for select using (true);
create policy "Authenticated users can like" on public.entry_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own likes" on public.entry_likes
  for delete using (auth.uid() = user_id);

create policy "Follows are viewable by everyone" on public.follows
  for select using (true);
create policy "Users can follow" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

create policy "Favorites collections are public" on public.collections
  for select using (type = 'favorites'::collection_type);
create policy "Users can view own collections" on public.collections
  for select using (auth.uid() = user_id);
create policy "Users can manage own collections" on public.collections
  for all using (auth.uid() = user_id);

create policy "Favorites collection items are public" on public.collection_items
  for select using (exists (
    select 1 from public.collections c
    where c.id = collection_items.collection_id and c.type = 'favorites'::collection_type
  ));
create policy "Users can view own collection items" on public.collection_items
  for select using (exists (
    select 1 from public.collections
    where collections.id = collection_items.collection_id and collections.user_id = auth.uid()
  ));
create policy "Users can manage own collection items" on public.collection_items
  for all using (exists (
    select 1 from public.collections
    where collections.id = collection_items.collection_id and collections.user_id = auth.uid()
  ));

-- ============================================================
-- Views (aggregate stats, all scoped to public entries only)
-- ============================================================

create view public.coffee_brew_stats as
select brew_method, coffee_id, count(*)::integer as usage_count
from public.coffee_entries
where brew_method is not null and visibility = 'public'::entry_visibility
group by brew_method, coffee_id;

create view public.coffee_flavor_stats as
select ef.tag, ce.coffee_id, count(*)::integer as mention_count
from public.entry_flavor_tags ef
join public.coffee_entries ce on ce.id = ef.entry_id
where ce.visibility = 'public'::entry_visibility
group by ef.tag, ce.coffee_id;

create view public.coffee_rating_distribution as
select coffee_id, rating_global as rating, count(*)::integer as count
from public.coffee_entries
where visibility = 'public'::entry_visibility
group by coffee_id, rating_global
order by coffee_id, rating_global;

create view public.coffee_subrating_avgs as
select
  coffee_id,
  round(avg(rating_aroma), 1) as avg_aroma,
  round(avg(rating_body), 1) as avg_body,
  round(avg(rating_acidity), 1) as avg_acidity,
  round(avg(rating_sweetness), 1) as avg_sweetness,
  round(avg(rating_bitterness), 1) as avg_bitterness,
  round(avg(rating_aftertaste), 1) as avg_aftertaste
from public.coffee_entries
where visibility = 'public'::entry_visibility
group by coffee_id;

-- Ranks coffees by a recency-weighted score: avg_rating * ln(total_reviews+1),
-- boosted up to 3x by review volume in the last 7 days.
create view public.coffee_trending_score as
select
  c.id, c.name, c.brand, c.type, c.origin, c.roast_level, c.image_url,
  c.avg_rating, c.total_reviews, c.created_at,
  coalesce(recent.count, 0) as recent_reviews_7d,
  case
    when c.total_reviews = 0 then 0
    else round((c.avg_rating::float * ln(c.total_reviews + 1) *
      (1.0 + (coalesce(recent.count, 0)::numeric / (c.total_reviews + 1)) * 2.0))::numeric, 4)
  end as score
from public.coffees c
left join (
  select coffee_id, count(*) as count
  from public.coffee_entries
  where created_at >= now() - interval '7 days'
  group by coffee_id
) recent on recent.coffee_id = c.id
where c.avg_rating is not null
order by score desc;
