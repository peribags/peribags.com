-- Perry Bags: Shopify-style product variants.
--
-- A product defines OPTION GROUPS on `products.options` (jsonb), e.g.
--   [{"name":"Color","values":[{"name":"Red","swatch_image":"products/x.png"},
--                              {"name":"Black","swatch_image":null}]},
--    {"name":"Size","values":[{"name":"S","swatch_image":null},
--                             {"name":"M","swatch_image":null}]}]
--
-- Each row in `product_variants` is one COMBINATION of those values
-- (Red/S, Red/M, Black/S, Black/M …) with its own SKU, price override,
-- stock flag and image gallery. `option_values` holds the value names in the
-- same order as the product's options array; `title` is the denormalised
-- display name ("Red / S").
--
-- Paste into Supabase SQL editor. Safe to re-run. NOTE: this replaces the
-- earlier (pre-combination) variants table — it is dropped and recreated.

-- Option definitions live on the product row.
alter table public.products
  add column if not exists options jsonb not null default '[]'::jsonb;

alter table public.products
  drop constraint if exists products_options_is_array;
alter table public.products
  add constraint products_options_is_array
  check (jsonb_typeof(options) = 'array');

-- ──────────────────────────────────────────────────────────────────────────
-- product_variants — combinations
-- ──────────────────────────────────────────────────────────────────────────

drop table if exists public.product_variants cascade;

create table public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  -- Value names aligned with the product's options order, e.g. {Red,S}.
  option_values  text[] not null default '{}',
  -- Denormalised display title, e.g. "Red / S".
  title          text not null,
  sku            text,
  -- Nullable → variant inherits the product's price.
  price_paise    integer check (price_paise is null or price_paise >= 0),
  -- R2 keys. Empty → storefront falls back to the product gallery.
  images         text[] not null default '{}',
  in_stock       boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.product_variants enable row level security;

-- Storefront: variants are readable only when their product is published.
drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
on public.product_variants for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.published = true
  )
);

drop policy if exists "product_variants_admin_all" on public.product_variants;
create policy "product_variants_admin_all"
on public.product_variants for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
