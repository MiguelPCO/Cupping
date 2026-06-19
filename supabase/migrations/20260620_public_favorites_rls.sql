-- Allow anyone to read collections that are the "favorites" type
create policy "Favorites collections are public"
  on public.collections
  for select
  using (type = 'favorites');

-- Allow anyone to read collection_items that belong to a favorites collection
create policy "Favorites collection items are public"
  on public.collection_items
  for select
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
      and c.type = 'favorites'
    )
  );
