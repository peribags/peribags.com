-- Perry Bags: categories SEO fields.
-- Both nullable — fall back to name and description on the storefront.

alter table public.categories
  add column if not exists meta_title text,
  add column if not exists meta_description text;
