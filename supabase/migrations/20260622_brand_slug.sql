-- ═══════════════════════════════════════════════════
-- Sprint 4D — Brand Hub: stored brand_slug column
-- Fixes accent round-trip: ilike("brand", term) does not
-- fold accents in PostgreSQL, so "Café de Altura" was not
-- matched by the slug "cafe-de-altura".
-- Solution: store a pre-computed slug on the coffees row and
-- query with .eq("brand_slug", slug) instead.
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Enable unaccent extension (built into Supabase/Postgres)
create extension if not exists unaccent with schema extensions;

-- 2. IMMUTABLE wrapper required for use in a GENERATED ALWAYS AS column.
--    unaccent() is STABLE (depends on a dictionary), not IMMUTABLE.
--    Passing the dictionary OID explicitly via regdictionary makes the
--    call fully deterministic, letting us declare it IMMUTABLE.
create or replace function public.immutable_unaccent(text)
  returns text
  language sql
  immutable
  parallel safe
  strict
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

-- 3. Add generated brand_slug column to coffees.
--    The expression must exactly replicate brandToSlug() in
--    src/lib/brand-slug.ts:
--      1. normalize/strip accents  → immutable_unaccent(brand)
--      2. lowercase               → lower(...)
--      3. strip non-[a-z0-9 -]   → regexp_replace(..., '[^a-z0-9\s-]', '', 'g')
--         NOTE: hyphens are KEPT here (brandToSlug strips [^a-z0-9\s-])
--      4. trim whitespace         → btrim(...)
--      5. collapse spaces→hyphens → regexp_replace(..., '\s+', '-', 'g')
--      6. collapse double-hyphens → regexp_replace(..., '-{2,}', '-', 'g')
alter table public.coffees
  add column if not exists brand_slug text generated always as (
    regexp_replace(
      regexp_replace(
        btrim(
          regexp_replace(
            lower(public.immutable_unaccent(brand)),
            '[^a-z0-9\s-]', '', 'g'
          )
        ),
        '\s+', '-', 'g'
      ),
      '-{2,}', '-', 'g'
    )
  ) stored;

-- 4. Index for fast slug lookups
create index if not exists idx_coffees_brand_slug on public.coffees (brand_slug);
