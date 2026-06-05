-- Perry Bags: catalog search (categories + products).
-- Fuzzy, typo-tolerant search built on pg_trgm (trigram similarity) combined
-- with simple full-text matching, ranked in SQL:
--   prefix match > substring match > trigram similarity > full-text hit,
--   with a small boost for featured products.
-- Runs as `security invoker`, so RLS still applies (anon sees published only).
-- Paste into Supabase SQL editor. Safe to re-run.

create extension if not exists pg_trgm;

-- Trigram indexes for fast fuzzy matching.
-- If your pg_trgm lives in the `extensions` schema and this errors, qualify
-- the opclass as `extensions.gin_trgm_ops`.
create index if not exists products_name_trgm_idx
  on public.products using gin (name gin_trgm_ops);
create index if not exists categories_name_trgm_idx
  on public.categories using gin (name gin_trgm_ops);

create or replace function public.search_catalog(
  q text,
  max_categories integer default 6,
  max_products integer default 12
)
returns table (
  kind        text,
  id          uuid,
  name        text,
  slug        text,
  image_url   text,
  price_paise integer,
  in_stock    boolean,
  rank        real
)
language sql
stable
set search_path = public, extensions
as $$
  with input as (
    select trim(coalesce(q, '')) as term
  ),
  cats as (
    select
      'category'::text as kind,
      c.id,
      c.name,
      c.slug,
      c.image_url,
      null::integer    as price_paise,
      null::boolean    as in_stock,
      (
        (case when c.name ilike i.term || '%' then 1.0 else 0.0 end) +
        (case when c.name ilike '%' || i.term || '%' then 0.5 else 0.0 end) +
        similarity(c.name, i.term)
      )::real as rank
    from public.categories c
    cross join input i
    where i.term <> ''
      and c.published
      and (
        c.name ilike '%' || i.term || '%'
        or similarity(c.name, i.term) > 0.15
      )
    order by rank desc, c.name asc
    limit max_categories
  ),
  prods as (
    select
      'product'::text as kind,
      p.id,
      p.name,
      p.slug,
      (p.images)[1]   as image_url,
      p.price_paise,
      p.in_stock,
      (
        (case when p.name ilike i.term || '%' then 1.0 else 0.0 end) +
        (case when p.name ilike '%' || i.term || '%' then 0.5 else 0.0 end) +
        greatest(
          similarity(p.name, i.term),
          similarity(coalesce(p.short_description, ''), i.term) * 0.4
        ) +
        (case
          when to_tsvector('simple', p.name || ' ' || coalesce(p.short_description, ''))
               @@ websearch_to_tsquery('simple', i.term)
          then 0.4 else 0.0
        end) +
        (case when p.featured then 0.1 else 0.0 end)
      )::real as rank
    from public.products p
    cross join input i
    where i.term <> ''
      and p.published
      and (
        p.name ilike '%' || i.term || '%'
        or similarity(p.name, i.term) > 0.15
        or to_tsvector('simple', p.name || ' ' || coalesce(p.short_description, ''))
           @@ websearch_to_tsquery('simple', i.term)
      )
    order by rank desc, p.name asc
    limit max_products
  )
  select * from cats
  union all
  select * from prods;
$$;

grant execute on function public.search_catalog(text, integer, integer)
  to anon, authenticated;
