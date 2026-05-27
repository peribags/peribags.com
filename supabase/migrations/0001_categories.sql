-- Perry Bags: nested category tree (adjacency list).
-- Paste into Supabase SQL editor.

-- ──────────────────────────────────────────────────────────────────────────
-- Shared helper
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- categories
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.categories(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- A category can't be its own parent.
  constraint categories_no_self_parent check (parent_id is null or parent_id <> id),

  -- Siblings (rows sharing the same parent) can't share a slug.
  -- `nulls not distinct` treats top-level rows (parent_id = null) as siblings.
  constraint categories_unique_sibling_slug unique nulls not distinct (parent_id, slug)
);

create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_sort_idx on public.categories (parent_id, sort_order);
create index if not exists categories_published_idx on public.categories (published) where published;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- Cycle prevention (e.g. don't let A become a descendant of B if B is already
-- a descendant of A). Walks up from the new parent_id; throws if it reaches
-- the row's own id.
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.categories_prevent_cycle()
returns trigger
language plpgsql
as $$
declare
  cursor_id uuid := NEW.parent_id;
  steps     integer := 0;
begin
  while cursor_id is not null loop
    if cursor_id = NEW.id then
      raise exception 'Cycle detected: % cannot be a descendant of itself', NEW.id;
    end if;
    steps := steps + 1;
    if steps > 64 then
      raise exception 'Category depth limit (64) exceeded';
    end if;
    select parent_id into cursor_id from public.categories where id = cursor_id;
  end loop;
  return NEW;
end;
$$;

drop trigger if exists categories_no_cycle on public.categories;
create trigger categories_no_cycle
before insert or update of parent_id on public.categories
for each row execute function public.categories_prevent_cycle();

-- ──────────────────────────────────────────────────────────────────────────
-- Recursive view: full tree with depth, slug path, and id path.
--   depth      → 1 for roots, +1 per level
--   slug_path  → ['bags', 'totes', 'leather']
--   id_path    → [uuid, uuid, uuid]   (useful for ordering display)
-- ──────────────────────────────────────────────────────────────────────────

create or replace view public.category_tree
with (security_invoker = on) as
with recursive tree as (
  select
    id,
    parent_id,
    slug,
    name,
    description,
    image_url,
    sort_order,
    published,
    1                       as depth,
    array[slug]             as slug_path,
    array[id]               as id_path
  from public.categories
  where parent_id is null

  union all

  select
    c.id,
    c.parent_id,
    c.slug,
    c.name,
    c.description,
    c.image_url,
    c.sort_order,
    c.published,
    t.depth + 1,
    t.slug_path || c.slug,
    t.id_path   || c.id
  from public.categories c
  join tree t on c.parent_id = t.id
)
select * from tree;

-- ──────────────────────────────────────────────────────────────────────────
-- Helper RPCs
-- ──────────────────────────────────────────────────────────────────────────

-- Ancestors of a given category, ordered root → self. Use for breadcrumbs.
create or replace function public.category_ancestors(p_id uuid)
returns table (
  id uuid, parent_id uuid, slug text, name text, depth integer
)
language sql stable as $$
  with recursive walk as (
    select c.id, c.parent_id, c.slug, c.name, 0 as up
    from public.categories c where c.id = p_id

    union all

    select c.id, c.parent_id, c.slug, c.name, w.up + 1
    from public.categories c
    join walk w on c.id = w.parent_id
  )
  select w.id, w.parent_id, w.slug, w.name,
         (select max(up) from walk) - w.up + 1 as depth
  from walk w
  order by w.up desc;
$$;

-- All descendants (any depth) of a category, including itself.
create or replace function public.category_descendants(p_id uuid)
returns table (
  id uuid, parent_id uuid, slug text, name text, depth integer
)
language sql stable as $$
  with recursive walk as (
    select c.id, c.parent_id, c.slug, c.name, 0 as depth
    from public.categories c where c.id = p_id

    union all

    select c.id, c.parent_id, c.slug, c.name, w.depth + 1
    from public.categories c
    join walk w on c.parent_id = w.id
  )
  select * from walk;
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.categories enable row level security;

-- Storefront: anyone can read published rows.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories for select
to anon, authenticated
using (published = true);

-- Admin: full access (relies on app_metadata.role = 'admin' in the JWT).
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
on public.categories for all
to authenticated
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');
