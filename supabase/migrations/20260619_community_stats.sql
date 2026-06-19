-- ═══════════════════════════════════════════════════
-- Sprint 3.5 — Community Stats Migration
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Bayesian avg_rating trigger
--    Formula: (C*m + n*R) / (C + n)  where C=5, m=3.0
--    Returns null when 0 reviews (vs old DEFAULT 0)

create or replace function public.update_coffee_avg_rating()
returns trigger as $$
begin
  update public.coffees
  set
    avg_rating = (
      select
        case when count(*) = 0 then null
        else round(
          ((5.0 * 3.0 + count(*) * avg(rating_global)) / (5.0 + count(*)))::numeric,
          1
        )
        end
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

-- Backfill: coffees with 0 reviews should have null avg_rating
update public.coffees set avg_rating = null where total_reviews = 0;

-- 2. Dedup UNIQUE index (case-insensitive brand + name + type)
--    Prevents duplicate coffee rows for same product
create unique index if not exists idx_coffees_dedup
  on public.coffees (lower(brand), lower(name), type);

-- 3. Community stats views

-- Flavor tag frequency per coffee (for detail page tag cloud)
create or replace view public.coffee_flavor_stats
  with (security_invoker = true)
as
  select
    ef.tag,
    ce.coffee_id,
    count(*)::integer as mention_count
  from public.entry_flavor_tags ef
  join public.coffee_entries ce on ce.id = ef.entry_id
  group by ef.tag, ce.coffee_id;

-- Brew method distribution per coffee
create or replace view public.coffee_brew_stats
  with (security_invoker = true)
as
  select
    brew_method,
    coffee_id,
    count(*)::integer as usage_count
  from public.coffee_entries
  where brew_method is not null
  group by brew_method, coffee_id;

-- Sub-rating averages per coffee (only entries that set sub-ratings)
create or replace view public.coffee_subrating_avgs
  with (security_invoker = true)
as
  select
    coffee_id,
    round(avg(rating_aroma)::numeric, 1)      as avg_aroma,
    round(avg(rating_body)::numeric, 1)       as avg_body,
    round(avg(rating_acidity)::numeric, 1)    as avg_acidity,
    round(avg(rating_sweetness)::numeric, 1)  as avg_sweetness,
    round(avg(rating_bitterness)::numeric, 1) as avg_bitterness,
    round(avg(rating_aftertaste)::numeric, 1) as avg_aftertaste
  from public.coffee_entries
  where rating_aroma is not null
     or rating_body is not null
     or rating_acidity is not null
  group by coffee_id;

-- Rating distribution per coffee (integer buckets 1-5)
create or replace view public.coffee_rating_distribution
  with (security_invoker = true)
as
  select
    coffee_id,
    floor(rating_global)::integer as bucket,
    count(*)::integer as count
  from public.coffee_entries
  group by coffee_id, floor(rating_global)::integer
  order by coffee_id, bucket;
