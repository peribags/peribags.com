-- Perry Bags: products + product_categories (many-to-many) — v1 schema.
-- Paste into Supabase SQL editor.

-- ──────────────────────────────────────────────────────────────────────────
-- products
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_description  text,
  description        text not null default '',
  price_paise        integer not null check (price_paise >= 0),
  -- R2 keys (relative paths). The first entry is the hero / thumbnail.
  images             text[] not null default '{}',
  in_stock           boolean not null default true,
  published          boolean not null default false,
  featured           boolean not null default false,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists products_published_idx
  on public.products (published) where published;
create index if not exists products_featured_idx
  on public.products (featured) where featured;
create index if not exists products_created_at_idx
  on public.products (created_at desc);
create index if not exists products_sort_idx
  on public.products (sort_order, created_at desc);

-- Reuse the shared updated_at helper created in 0001_categories.sql.
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products for select
to anon, authenticated
using (published = true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
on public.products for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ──────────────────────────────────────────────────────────────────────────
-- product_categories (join)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.product_categories (
  product_id   uuid not null references public.products(id)   on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (product_id, category_id)
);

-- The PK indexes (product_id, category_id). Add the reverse for
-- "all products in category X" lookups.
create index if not exists product_categories_category_idx
  on public.product_categories (category_id, product_id);

alter table public.product_categories enable row level security;

-- Public can read product↔category links, but only of *published* products.
-- This protects against listing drafts via a category-detail query.
drop policy if exists "product_categories_public_read" on public.product_categories;
create policy "product_categories_public_read"
on public.product_categories for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.published = true
  )
);

drop policy if exists "product_categories_admin_all" on public.product_categories;
create policy "product_categories_admin_all"
on public.product_categories for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
