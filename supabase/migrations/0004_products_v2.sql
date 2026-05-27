-- Perry Bags: products v2.
-- - Price becomes nullable (for "Price on request" listings).
-- - Free-form specs as JSONB array of {label, value} rows (order preserved).
-- - SEO meta_title / meta_description columns.

alter table public.products
  alter column price_paise drop not null;

alter table public.products
  add column if not exists specs jsonb not null default '[]'::jsonb,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

-- Specs must be a JSON array. Each element is checked at the app layer.
alter table public.products
  drop constraint if exists products_specs_is_array;
alter table public.products
  add constraint products_specs_is_array
  check (jsonb_typeof(specs) = 'array');
