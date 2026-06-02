-- Perry Bags: dynamic homepage sections.
-- The admin can compose the homepage out of reorderable sections. Each section
-- is one of two kinds:
--   - 'category' : renders category tiles (the selected categories).
--   - 'product'  : renders a product grid, sourced either from selected
--                  categories ('categories') or hand-picked products ('manual').
-- Text content (kicker / heading / description / background) is optional.
-- Paste into Supabase SQL editor. Safe to re-run.

-- ──────────────────────────────────────────────────────────────────────────
-- home_sections
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_sections (
  id              uuid primary key default gen_random_uuid(),
  type            text not null
                    check (type in ('category', 'product')),
  kicker          text,
  heading         text,
  description     text,
  -- Product sections only: optional CSS background colour for the band.
  background      text,
  -- Product sections only: where the products come from.
  product_source  text not null default 'manual'
                    check (product_source in ('categories', 'manual')),
  -- Optional cap on how many items render.
  item_limit      integer check (item_limit is null or item_limit > 0),
  -- Optional "view all" CTA.
  view_all_href   text,
  view_all_label  text,
  sort_order      integer not null default 0,
  published       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists home_sections_sort_idx
  on public.home_sections (sort_order, created_at);
create index if not exists home_sections_published_idx
  on public.home_sections (published) where published;

drop trigger if exists home_sections_set_updated_at on public.home_sections;
create trigger home_sections_set_updated_at
before update on public.home_sections
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- home_section_categories
--   Categories shown by a 'category' section, OR the categories whose products
--   feed a 'product' section with product_source = 'categories'.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_section_categories (
  section_id   uuid not null references public.home_sections(id) on delete cascade,
  category_id  uuid not null references public.categories(id)    on delete cascade,
  sort_order   integer not null default 0,
  primary key (section_id, category_id)
);

create index if not exists home_section_categories_section_idx
  on public.home_section_categories (section_id, sort_order);

-- ──────────────────────────────────────────────────────────────────────────
-- home_section_products
--   Hand-picked products for a 'product' section with product_source = 'manual'.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_section_products (
  section_id  uuid not null references public.home_sections(id) on delete cascade,
  product_id  uuid not null references public.products(id)      on delete cascade,
  sort_order  integer not null default 0,
  primary key (section_id, product_id)
);

create index if not exists home_section_products_section_idx
  on public.home_section_products (section_id, sort_order);

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.home_sections enable row level security;
alter table public.home_section_categories enable row level security;
alter table public.home_section_products enable row level security;

-- Sections: storefront reads published rows; admin manages everything.
drop policy if exists "home_sections_public_read" on public.home_sections;
create policy "home_sections_public_read"
on public.home_sections for select
to anon, authenticated
using (published = true);

drop policy if exists "home_sections_admin_all" on public.home_sections;
create policy "home_sections_admin_all"
on public.home_sections for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Join rows: public read (just id links; the referenced rows are themselves
-- RLS-protected). Admin manages writes.
drop policy if exists "home_section_categories_public_read" on public.home_section_categories;
create policy "home_section_categories_public_read"
on public.home_section_categories for select
to anon, authenticated
using (true);

drop policy if exists "home_section_categories_admin_all" on public.home_section_categories;
create policy "home_section_categories_admin_all"
on public.home_section_categories for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "home_section_products_public_read" on public.home_section_products;
create policy "home_section_products_public_read"
on public.home_section_products for select
to anon, authenticated
using (true);

drop policy if exists "home_section_products_admin_all" on public.home_section_products;
create policy "home_section_products_admin_all"
on public.home_section_products for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
