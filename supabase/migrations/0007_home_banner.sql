-- Perry Bags: home (hero) banner — admin-managed slides + banner config.
-- - A single-row `home_banner` config holds the banner height for desktop and
--   mobile separately (CSS values).
-- - `home_banner_slides` holds the carousel slides. Each slide carries a
--   desktop media item (image OR video) plus an OPTIONAL mobile override, plus
--   optional text/CTA. All fields except the primary key are optional so the
--   admin can fill in as little as one image.
-- Paste into Supabase SQL editor. Safe to re-run.

-- ──────────────────────────────────────────────────────────────────────────
-- home_banner (singleton config)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_banner (
  -- Singleton: a single row whose id is always TRUE.
  id              boolean primary key default true check (id),
  -- CSS height values applied to the banner on the storefront, e.g. "640px"
  -- or "80vh". NULL falls back to the storefront's responsive default.
  height_desktop  text,
  height_mobile   text,
  updated_at      timestamptz not null default now()
);

-- Forward-compat: bring earlier drafts of this table up to the current shape.
alter table public.home_banner add column if not exists height_desktop text;
alter table public.home_banner add column if not exists height_mobile text;
-- Migrate an old single `height` column (if present) into the desktop slot.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'home_banner'
      and column_name = 'height'
  ) then
    update public.home_banner
      set height_desktop = coalesce(height_desktop, height);
    alter table public.home_banner drop column height;
  end if;
end $$;

-- Reuse the shared updated_at helper created in 0001_categories.sql.
drop trigger if exists home_banner_set_updated_at on public.home_banner;
create trigger home_banner_set_updated_at
before update on public.home_banner
for each row execute function public.set_updated_at();

-- Seed the single config row (no-op if it already exists).
insert into public.home_banner (id) values (true)
on conflict (id) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- home_banner_slides
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.home_banner_slides (
  id                  uuid primary key default gen_random_uuid(),
  -- Desktop / default media. `media_type` says what `media_url` points at.
  media_type          text not null default 'image'
                        check (media_type in ('image', 'video')),
  -- R2 key (relative path) for the slide's image or video. Optional — a slide
  -- with no media renders text over a plain backdrop.
  media_url           text,
  -- Optional mobile override. When set, it replaces the desktop media on small
  -- screens. When null, the desktop media is used everywhere.
  mobile_media_type   text
                        check (mobile_media_type is null
                               or mobile_media_type in ('image', 'video')),
  mobile_media_url    text,
  -- Optional alt text (images) / accessible label.
  alt                 text,
  -- Optional overlay copy.
  kicker              text,
  heading             text,
  description         text,
  -- Optional call-to-action.
  cta_label           text,
  cta_href            text,
  sort_order          integer not null default 0,
  published           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Forward-compat: add the mobile-override columns to earlier drafts.
alter table public.home_banner_slides
  add column if not exists mobile_media_type text;
alter table public.home_banner_slides
  add column if not exists mobile_media_url text;
alter table public.home_banner_slides
  drop constraint if exists home_banner_slides_mobile_media_type_check;
alter table public.home_banner_slides
  add constraint home_banner_slides_mobile_media_type_check
  check (mobile_media_type is null or mobile_media_type in ('image', 'video'));

create index if not exists home_banner_slides_sort_idx
  on public.home_banner_slides (sort_order, created_at);
create index if not exists home_banner_slides_published_idx
  on public.home_banner_slides (published) where published;

drop trigger if exists home_banner_slides_set_updated_at on public.home_banner_slides;
create trigger home_banner_slides_set_updated_at
before update on public.home_banner_slides
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

alter table public.home_banner enable row level security;
alter table public.home_banner_slides enable row level security;

-- Banner config: anyone can read it; only admin can change it.
drop policy if exists "home_banner_public_read" on public.home_banner;
create policy "home_banner_public_read"
on public.home_banner for select
to anon, authenticated
using (true);

drop policy if exists "home_banner_admin_all" on public.home_banner;
create policy "home_banner_admin_all"
on public.home_banner for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Slides: storefront can read published rows; admin manages everything.
drop policy if exists "home_banner_slides_public_read" on public.home_banner_slides;
create policy "home_banner_slides_public_read"
on public.home_banner_slides for select
to anon, authenticated
using (published = true);

drop policy if exists "home_banner_slides_admin_all" on public.home_banner_slides;
create policy "home_banner_slides_admin_all"
on public.home_banner_slides for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
