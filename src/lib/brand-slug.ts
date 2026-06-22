/**
 * Converts a brand name to a URL-safe slug.
 * "Heart Coffee Roasters" → "heart-coffee-roasters"
 * "Café de Altura"        → "cafe-de-altura"
 */
export function brandToSlug(brand: string): string {
  return brand
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // strip accent marks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")     // strip non-alphanumeric except spaces/hyphens
    .trim()
    .replace(/\s+/g, "-")             // spaces → hyphens
    .replace(/-{2,}/g, "-");          // collapse double hyphens
}

/**
 * Returns the slug's normalized form for an ilike query.
 * Converts hyphens back to spaces for partial matching.
 * "heart-coffee-roasters" → "heart coffee roasters"
 */
export function slugToSearchTerm(slug: string): string {
  return slug.replace(/-/g, " ");
}
