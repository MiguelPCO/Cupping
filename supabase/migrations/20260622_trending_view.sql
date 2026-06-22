-- ═══════════════════════════════════════════════════
-- Sprint 4B — Trending Score View with Recency Weighting
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Coffee trending score view
-- Scores coffees by: avg_rating × ln(total_reviews + 1) × (1.0 + (recent_reviews_7d / (total_reviews + 1)) × 2.0)
-- Only includes coffees where avg_rating IS NOT NULL

create or replace view public.coffee_trending_score as
select
  c.id,
  c.name,
  c.brand,
  c.type,
  c.origin,
  c.roast_level,
  c.image_url,
  c.avg_rating,
  c.total_reviews,
  coalesce(recent.count, 0) as recent_reviews_7d,
  case
    when c.total_reviews = 0 then 0
    else round(
      (
        c.avg_rating *
        ln(c.total_reviews + 1) *
        (1.0 + (coalesce(recent.count, 0)::numeric / (c.total_reviews + 1)) * 2.0)
      )::numeric,
      4
    )
  end as score
from public.coffees c
left join (
  select
    coffee_id,
    count(*) as count
  from public.coffee_entries
  where created_at >= now() - interval '7 days'
  group by coffee_id
) recent on recent.coffee_id = c.id
where c.avg_rating is not null
order by score desc;
