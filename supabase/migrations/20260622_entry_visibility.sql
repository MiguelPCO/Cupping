-- supabase/migrations/20260622_entry_visibility.sql

-- Add visibility type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'entry_visibility') then
    create type public.entry_visibility as enum ('public', 'private');
  end if;
end $$;

-- Add column, default public so existing rows stay visible
alter table public.coffee_entries
  add column if not exists visibility public.entry_visibility not null default 'public';

-- Drop old permissive read policy
drop policy if exists "Entries are viewable by everyone" on public.coffee_entries;

-- New read policy: public entries visible to all; private entries only to owner
create policy "Entries are viewable by owner or if public"
  on public.coffee_entries
  for select
  using (
    visibility = 'public'
    or user_id = auth.uid()
  );

-- Insert policy unchanged (owner inserts own entries)
-- Update policy unchanged (owner updates own entries)
-- Delete policy unchanged (owner deletes own entries)

-- Update the community stats views to only count public entries
-- (views are replaced — no DROP needed for OR REPLACE)
create or replace view public.coffee_flavor_stats as
  select ef.tag, ce.coffee_id, count(*) as mention_count
  from public.entry_flavor_tags ef
  join public.coffee_entries ce on ce.id = ef.entry_id
  where ce.visibility = 'public'
  group by ef.tag, ce.coffee_id;

create or replace view public.coffee_brew_stats as
  select brew_method, coffee_id, count(*) as usage_count
  from public.coffee_entries
  where brew_method is not null
    and visibility = 'public'
  group by brew_method, coffee_id;

create or replace view public.coffee_subrating_avgs as
  select
    coffee_id,
    round(avg(rating_aroma)::numeric, 1)      as avg_aroma,
    round(avg(rating_body)::numeric, 1)       as avg_body,
    round(avg(rating_acidity)::numeric, 1)    as avg_acidity,
    round(avg(rating_sweetness)::numeric, 1)  as avg_sweetness,
    round(avg(rating_bitterness)::numeric, 1) as avg_bitterness,
    round(avg(rating_aftertaste)::numeric, 1) as avg_aftertaste
  from public.coffee_entries
  where visibility = 'public'
  group by coffee_id;

create or replace view public.coffee_rating_distribution as
  select coffee_id, rating_global as rating, count(*) as count
  from public.coffee_entries
  where visibility = 'public'
  group by coffee_id, rating_global
  order by coffee_id, rating_global;

-- Update the Bayesian avg trigger to only count public entries
create or replace function public.update_coffee_avg_rating()
returns trigger as $$
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
$$ language plpgsql security definer;
