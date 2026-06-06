-- peribags: sling-bag catalogue seed (9 products).
-- Re-runnable: upserts by slug, refreshes specs + SEO, then links each
-- product to the sling category.
--
-- 1) Set the sling category slug below to match your live category (currently 'sling-bag').
-- 2) Paste the whole file into Supabase SQL editor and run.
-- 3) Prices are left NULL → storefront will show "Price on request".
--    If you want a price tag visible, set price_paise (e.g. 28500 = ₹285).
-- 4) images stays empty here — upload via the admin panel after seed.

begin;

-- Resolve the sling category id once. Change the slug if your category
-- uses something other than 'sling-bags' (e.g. 'sling-bag' or 'slings').
do $$
declare
  v_sling_id uuid;
begin
  select id into v_sling_id
  from public.categories
  where slug = 'sling-bag'
  limit 1;

  if v_sling_id is null then
    raise exception
      'No category found with slug "sling-bag". Create it (or change the slug at the top of this script) before seeding.';
  end if;

  -- ───────────────────────────────────────────────────────────────────────
  -- 1. Grace Glide Sling Bag
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'grace-glide-sling-bag',
    'Grace Glide Sling Bag',
    'PU leather sling in a clean blue finish with an adjustable strap — built for everyday carry.',
    $html$
<p>The <strong>Grace Glide Sling Bag</strong> is a refined everyday companion crafted in soft PU leather with a plain, understated finish. Its rich blue tone is paired with a fully adjustable strap so it sits exactly where you want it — at the hip, across the shoulder, or worn cross-body.</p>
<p>Roomy enough for a phone, wallet, keys and small essentials, the Grace Glide is built for the way you move through a day — coffee runs, commutes, casual evenings, weekend errands.</p>
<h3>Why you'll love it</h3>
<ul>
  <li>Soft-touch PU leather with a clean, plain face</li>
  <li>Adjustable strap for cross-body or shoulder wear</li>
  <li>Compact silhouette — light, hands-free, fuss-free</li>
  <li>Made in India by skilled artisans</li>
</ul>
$html$,
    null, '{}', true, true, false, 10,
    $specs$[
      {"label":"Material","value":"PU Leather"},
      {"label":"Pattern","value":"Plain"},
      {"label":"Color","value":"Blue"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Type Of Hand Bags","value":"Shoulder Bag"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Grace Glide Sling Bag — PU Leather Blue Sling | peribags',
    'Shop the Grace Glide Sling Bag in soft blue PU leather. Adjustable strap, hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 2. Sojourn Style Slings
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'sojourn-style-slings',
    'Sojourn Style Slings',
    'Embroidered foam-bodied sling in a compact 10x7 inch frame — available in eight colour stories.',
    $html$
<p>The <strong>Sojourn Style Sling</strong> brings a touch of craft to your everyday. A foam-bodied sling worn across the body, its embroidered face turns a small essential into a quiet talking point — perfect for carrying a phone, wallet and keys without fuss.</p>
<p>At a compact 10 x 7 inches, the Sojourn keeps things light and close to the body. Choose from eight curated colour stories to suit your wardrobe and mood.</p>
<h3>Highlights</h3>
<ul>
  <li>Hand-finished embroidered face</li>
  <li>Foam-grade body — lightweight and form-holding</li>
  <li>Compact 10 x 7 inch silhouette</li>
  <li>Available in eight colours</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 20,
    $specs$[
      {"label":"Bag Type","value":"Sling Bag"},
      {"label":"Design / Pattern","value":"Embroidered"},
      {"label":"Material Grade","value":"Foam Material"},
      {"label":"Color","value":"Available in 8 colours"},
      {"label":"Size","value":"10 x 7 inch"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Sojourn Style Sling Bag — Embroidered Cross-Body | peribags',
    'Compact 10x7 inch embroidered sling, available in 8 colours. Lightweight foam body, hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 3. Urban Haul Sling
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'urban-haul-sling',
    'Urban Haul Sling',
    'Clean-faced sling for the daily commute — adjustable strap, ten colour options.',
    $html$
<p>The <strong>Urban Haul Sling</strong> is built for the rhythm of the city. A plain, considered face keeps it versatile across outfits, while the adjustable strap moves it from shoulder to cross-body in a beat.</p>
<p>Carry your phone, wallet, cards, transit pass and a small notebook — everything you reach for between meetings, transit, and coffee. Available in ten colour stories so you can find the one that fits the way you dress.</p>
<h3>Highlights</h3>
<ul>
  <li>Plain, minimal face — pairs with any outfit</li>
  <li>Adjustable strap for shoulder or cross-body wear</li>
  <li>Choose from ten colour stories</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 30,
    $specs$[
      {"label":"Brand","value":"Peri"},
      {"label":"Type Of Hand Bags","value":"Sling Bag"},
      {"label":"Pattern","value":"Plain"},
      {"label":"Color","value":"Available in 10 colours"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Urban Haul Sling Bag — Minimal Daily Cross-Body | peribags',
    'Minimal sling for daily carry, available in ten colours. Adjustable strap, hands-free convenience. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 4. Moda Pack Sling Bag
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'moda-pack-sling-bag',
    'Moda Pack Sling Bag',
    'Printed PU leather sling in classic black — compact, hands-free everyday carry.',
    $html$
<p>The <strong>Moda Pack Sling Bag</strong> is the everyday workhorse, dressed up. A printed PU leather face brings quiet personality to a piece you'll reach for again and again, while the classic black palette keeps it grounded in any wardrobe.</p>
<p>Hands-free by design with an adjustable strap, the Moda Pack holds your phone, wallet, and small essentials with ease.</p>
<h3>Highlights</h3>
<ul>
  <li>Printed PU leather face — subtle personality on a classic frame</li>
  <li>Adjustable strap, hands-free wear</li>
  <li>Compact silhouette for daily carry</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 40,
    $specs$[
      {"label":"Material","value":"PU Leather"},
      {"label":"Pattern","value":"Printed"},
      {"label":"Color","value":"Black"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Type Of Hand Bags","value":"Handheld Bag"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Moda Pack Sling Bag — Printed Black PU Leather | peribags',
    'Printed PU leather sling in classic black with an adjustable strap. Hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 5. Elite Sling Bags
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'elite-sling-bags',
    'Elite Sling Bag',
    'Embroidered polyester sling in fresh green — adjustable strap and multiple compartments for hands-free convenience.',
    $html$
<p>The <strong>Elite Sling Bag</strong> is a chic, versatile sling built for the way you actually carry — phone, cards, keys, lipstick — without losing anything to the bottom of the bag. An embroidered polyester face brings craft and softness; a fresh green palette keeps the whole thing modern.</p>
<p>Multiple compartments organise your essentials. The adjustable strap moves it from shoulder to cross-body in seconds.</p>
<h3>Highlights</h3>
<ul>
  <li>Embroidered polyester face — soft, lightweight, hand-finished</li>
  <li>Multiple compartments for organised carry</li>
  <li>Adjustable strap for shoulder or cross-body wear</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 50,
    $specs$[
      {"label":"Material","value":"Polyester"},
      {"label":"Pattern","value":"Embroidered"},
      {"label":"Color","value":"Green"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Type Of Hand Bags","value":"Handheld Bag"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Elite Sling Bag — Embroidered Polyester in Green | peribags',
    'Embroidered polyester sling in green with multiple compartments and an adjustable strap. Hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 6. Denim Sling Bags
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'denim-sling-bags',
    'Denim Sling Bag',
    'Embroidered PU leather sling in rich brown — denim-inspired styling for relaxed everyday wear.',
    $html$
<p>The <strong>Denim Sling Bag</strong> takes a denim-inspired sensibility and lands it on a refined PU leather frame. An embroidered face in rich brown brings warmth and texture; the adjustable strap keeps it functional from morning to evening.</p>
<p>Built for hands-free convenience, the Denim Sling pairs with everything from a casual tee-and-jeans look to a smart-casual weekend outfit.</p>
<h3>Highlights</h3>
<ul>
  <li>Soft PU leather body with an embroidered face</li>
  <li>Warm brown palette — pairs across the wardrobe</li>
  <li>Adjustable strap for shoulder or cross-body wear</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 60,
    $specs$[
      {"label":"Brand","value":"Peri"},
      {"label":"Material","value":"PU Leather"},
      {"label":"Pattern","value":"Embroidered"},
      {"label":"Type Of Hand Bags","value":"Sling Bag"},
      {"label":"Color","value":"Brown"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Denim Sling Bag — Embroidered PU Leather in Brown | peribags',
    'Embroidered PU leather sling in warm brown. Adjustable strap, hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 7. Urbanite Utopia Sling Bag
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'urbanite-utopia-sling-bag',
    'Urbanite Utopia Sling Bag',
    'Sleek printed leather sling in a compact 8.5x8.5 inch frame — ten colour stories, built for the city.',
    $html$
<p>The <strong>Urbanite Utopia Sling Bag</strong> brings urban styling and quiet functionality together. A sleek 8.5 x 8.5 inch silhouette in printed leather keeps essentials close, while multiple compartments organise the small things you actually reach for during a day.</p>
<p>Choose from ten colour stories to fit your wardrobe — the Urbanite Utopia pairs as easily with a structured workwear look as it does with a weekend tee.</p>
<h3>Highlights</h3>
<ul>
  <li>Sleek 8.5 x 8.5 inch printed leather body</li>
  <li>Multiple compartments for organised carry</li>
  <li>Adjustable strap, hands-free convenience</li>
  <li>Available in ten colour stories</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 70,
    $specs$[
      {"label":"Brand","value":"peribags"},
      {"label":"Material","value":"Leather"},
      {"label":"Pattern","value":"Printed"},
      {"label":"Type Of Hand Bags","value":"Sling Bag"},
      {"label":"Color","value":"Available in 10 colours"},
      {"label":"Size","value":"8.5 x 8.5 inch"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Urbanite Utopia Sling Bag — Printed Leather Cross-Body | peribags',
    'Sleek 8.5x8.5 inch printed leather sling, available in 10 colours. Multiple compartments, adjustable strap. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 8. Pastel Dream Sling
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'pastel-dream-sling',
    'Pastel Dream Sling',
    'Handmade PU leather sling in soft pastel hues — 10.5 x 6 inch silhouette, eight colourways.',
    $html$
<p>The <strong>Pastel Dream Sling</strong> brings softness to your everyday. Crafted by hand in PU leather, its plain face is finished in gentle pastel hues that read effortlessly across seasons.</p>
<p>At 10.5 x 6 inches, the silhouette is slender and easy on the shoulder — built to hold a phone, wallet and cards without bulk. Choose from eight pastel colourways to find the one that fits your mood.</p>
<h3>Highlights</h3>
<ul>
  <li>Handmade by skilled artisans in India</li>
  <li>Soft PU leather body in pastel finishes</li>
  <li>Slender 10.5 x 6 inch silhouette</li>
  <li>Adjustable strap for shoulder or cross-body wear</li>
  <li>Eight pastel colourways</li>
</ul>
$html$,
    null, '{}', true, true, false, 80,
    $specs$[
      {"label":"Brand","value":"Peri"},
      {"label":"Material","value":"PU Leather"},
      {"label":"Pattern","value":"Plain"},
      {"label":"Color","value":"Available in 8 pastel colours"},
      {"label":"Size","value":"10.5 x 6 inch"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Handmade","value":"Handmade"},
      {"label":"Waterproof","value":"Non-Waterproof"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Pastel Dream Sling Bag — Handmade Pastel PU Leather | peribags',
    'Handmade pastel PU leather sling in a slender 10.5 x 6 inch silhouette. Eight pastel colourways, adjustable strap. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- 9. Enchant Sling Bag
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.products (
    slug, name, short_description, description,
    price_paise, images, in_stock, published, featured, sort_order,
    specs, meta_title, meta_description
  ) values (
    'enchant-sling-bag',
    'Enchant Sling Bag',
    'Plain polyester shoulder sling in classic black — lightweight everyday carry with an adjustable strap.',
    $html$
<p>The <strong>Enchant Sling Bag</strong> is the workhorse of the line — a clean, plain polyester shoulder sling in classic black, built for the way you carry on the most ordinary days.</p>
<p>Lightweight, hands-free, and durable, the Enchant pairs with anything and goes anywhere — work runs, weekend errands, casual evenings out.</p>
<h3>Highlights</h3>
<ul>
  <li>Plain polyester face in classic black</li>
  <li>Lightweight, hands-free shoulder sling</li>
  <li>Adjustable strap, fuss-free everyday wear</li>
  <li>Handcrafted in India</li>
</ul>
$html$,
    null, '{}', true, true, false, 90,
    $specs$[
      {"label":"Material","value":"Polyester"},
      {"label":"Pattern","value":"Plain"},
      {"label":"Color","value":"Black"},
      {"label":"Usage/Application","value":"Casual Wear"},
      {"label":"Strap Type","value":"Adjustable"},
      {"label":"Type Of Hand Bags","value":"Shoulder Bag"},
      {"label":"Country of Origin","value":"Made in India"}
    ]$specs$::jsonb,
    'Enchant Sling Bag — Plain Polyester Black Shoulder Sling | peribags',
    'Lightweight plain polyester sling in classic black with an adjustable strap. Hands-free everyday carry. Handcrafted in India by peribags.'
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    specs = excluded.specs,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    published = excluded.published;

  -- ───────────────────────────────────────────────────────────────────────
  -- Link every product above to the sling category (idempotent).
  -- ───────────────────────────────────────────────────────────────────────
  insert into public.product_categories (product_id, category_id)
  select p.id, v_sling_id
  from public.products p
  where p.slug in (
    'grace-glide-sling-bag',
    'sojourn-style-slings',
    'urban-haul-sling',
    'moda-pack-sling-bag',
    'elite-sling-bags',
    'denim-sling-bags',
    'urbanite-utopia-sling-bag',
    'pastel-dream-sling',
    'enchant-sling-bag'
  )
  on conflict (product_id, category_id) do nothing;
end$$;

commit;

-- Sanity check (optional — run on its own to verify):
-- select p.slug, p.name, p.published, jsonb_array_length(p.specs) as spec_count,
--        (select count(*) from public.product_categories pc where pc.product_id = p.id) as category_links
-- from public.products p
-- where p.slug in (
--   'grace-glide-sling-bag','sojourn-style-slings','urban-haul-sling',
--   'moda-pack-sling-bag','elite-sling-bags','denim-sling-bags',
--   'urbanite-utopia-sling-bag','pastel-dream-sling','enchant-sling-bag'
-- )
-- order by p.sort_order;
