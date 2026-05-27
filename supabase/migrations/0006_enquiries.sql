-- Perry Bags: enquiries inbox.
-- Public (anon) can INSERT only — submission from storefront. Admin reads + manages.
-- Product link is optional (supports both PDP enquiries and general /contact).

create table if not exists public.enquiries (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references public.products(id) on delete set null,
  customer_name   text not null,
  customer_email  text,
  customer_phone  text,
  message         text not null,
  status          text not null default 'new',
  source_url      text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint enquiries_name_not_blank
    check (length(trim(customer_name)) > 0),
  constraint enquiries_message_not_blank
    check (length(trim(message)) > 0),
  constraint enquiries_contact_required
    check (customer_email is not null or customer_phone is not null),
  constraint enquiries_status_valid
    check (status in ('new', 'responded', 'archived'))
);

create index if not exists enquiries_status_created_idx
  on public.enquiries (status, created_at desc);
create index if not exists enquiries_product_idx
  on public.enquiries (product_id, created_at desc);
create index if not exists enquiries_created_idx
  on public.enquiries (created_at desc);

-- Reuse the shared updated_at helper.
drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at
before update on public.enquiries
for each row execute function public.set_updated_at();

alter table public.enquiries enable row level security;

-- Public submissions: anon + authenticated can INSERT a new enquiry, but only as
-- status='new' (cannot pre-set responded/archived from outside).
-- Notes column can only be written by admin (enforced by separate column-level
-- check below — the column default is NULL and the public can set it but admin
-- update policy is what matters for changes).
drop policy if exists "enquiries_public_insert" on public.enquiries;
create policy "enquiries_public_insert"
on public.enquiries for insert
to anon, authenticated
with check (status = 'new' and notes is null);

-- Admin: full access.
drop policy if exists "enquiries_admin_all" on public.enquiries;
create policy "enquiries_admin_all"
on public.enquiries for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
