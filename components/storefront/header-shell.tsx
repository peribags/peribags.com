"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { CategoryTile } from "@/lib/category-tiles";
import { formatPhone, mailHref, siteConfig, telHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { HeaderSearchModal } from "./header-search";

const STATIC_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/category", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/our-work", label: "Our Work" },
  { href: "/contact", label: "Contact" },
];

const AT_TOP_THRESHOLD = 10; // px from top to count as "at hero / top"
const SCROLL_DELTA = 5; // ignore micro-jitter scrolls

export function HeaderShell({ tiles }: { tiles: CategoryTile[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Scroll-driven UI state. Both default to "show + at top" so the SSR
  // and first client render produce identical HTML — no hydration flash.
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const openMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);

  const scheduleCloseMega = useCallback((delay = 140) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), delay);
  }, []);

  // Close panels on navigation; reset scroll state so a new route always
  // starts with a visible header.
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
    setHidden(false);
    setAtTop(true);
    lastScrollY.current = 0;
  }, [pathname]);

  // Escape closes mega.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll listener — standard editorial header pattern:
  //   - Scrolling DOWN → hide header (slides up, giving more content space)
  //   - Scrolling UP   → show header (slides back in, user wants nav)
  //   - At top of page → show, and on home reset to transparent
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const isAtTop = y < AT_TOP_THRESHOLD;
      setAtTop(isAtTop);

      if (mobileOpen || megaOpen || searchOpen) {
        lastScrollY.current = y;
        return;
      }

      const diff = y - lastScrollY.current;
      if (isAtTop) {
        // Always visible at top of page.
        setHidden(false);
      } else if (diff > SCROLL_DELTA) {
        // Scrolling DOWN → hide.
        setHidden(true);
      } else if (diff < -SCROLL_DELTA) {
        // Scrolling UP → show.
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen, megaOpen, searchOpen]);

  // Transparency: only on home, only while still at the top of the page.
  // Once user scrolls past the hero (`atTop` flips false), the header gets a
  // solid white bg — even on home — so it reads against page content.
  const transparent =
    isHome && atTop && !mobileOpen && !megaOpen && !searchOpen;

  return (
    <>
      {/* Spacer — ALWAYS rendered, same DOM node on every route. Only its
          height switches. */}
      <div
        aria-hidden
        className={cn(isHome ? "h-0" : "h-[7.25rem] lg:h-20")}
      />

      <header
        style={{
          // Inline so a stale prod CSS / specificity bug can't ever drop
          // these. Identical inline keys on every route — only className
          // and transform values vary.
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          transitionProperty: "transform, background-color, color",
          transitionDuration: "400ms, 300ms, 300ms",
          transitionTimingFunction:
            "cubic-bezier(0.22, 1, 0.36, 1), ease-out, ease-out",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          willChange: "transform",
        }}
        className={cn(
          transparent ? "bg-transparent text-white" : "bg-white text-zinc-950",
        )}
      >
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-3 items-center px-4 md:px-6 lg:h-20 lg:px-[4vw]">
          {/* Logo — left */}
          <Link
            href="/"
            aria-label={siteConfig.name}
            className="justify-self-start transition-opacity hover:opacity-70"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt={siteConfig.name}
              width={44}
              height={44}
              className="h-10 w-auto lg:h-12"
            />
          </Link>

          {/* Nav — centered (desktop) */}
          <nav className="hidden items-center justify-self-center gap-8 lg:flex">
            {STATIC_LINKS.map((l) => {
              const active = pathname === l.href;
              const isShop = l.href === "/category";
              const showUnderline = active || (isShop && megaOpen);
              const linkEl = (
                <Link
                  href={l.href}
                  aria-expanded={isShop ? megaOpen : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1 text-sm font-medium tracking-tight transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:transition-transform after:duration-300 after:ease-out after:content-['']",
                    "hover:after:scale-x-100",
                    transparent
                      ? cn(
                          "after:bg-white",
                          showUnderline
                            ? "text-white after:scale-x-100"
                            : "text-white hover:text-white",
                        )
                      : cn(
                          "after:bg-zinc-950",
                          showUnderline
                            ? "text-zinc-950 after:scale-x-100"
                            : "text-zinc-600 hover:text-zinc-950",
                        ),
                  )}
                >
                  {l.label}
                  {isShop && (
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-3.5 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                        megaOpen ? "rotate-180" : "rotate-0",
                        transparent ? "text-white/70" : "text-zinc-500",
                      )}
                    />
                  )}
                </Link>
              );

              return isShop ? (
                <div
                  key={l.href}
                  onMouseEnter={openMega}
                  onMouseLeave={() => scheduleCloseMega()}
                  className="relative flex items-center"
                >
                  {linkEl}
                </div>
              ) : (
                <div key={l.href}>{linkEl}</div>
              );
            })}
          </nav>

          {/* Right side — search pill (desktop) + hamburger (mobile).
              col-start-3 keeps it in the right column even when the centered
              nav is hidden (mobile), where it would otherwise slot into col 2. */}
          <div className="col-start-3 flex items-center justify-self-end gap-2">
            {/* Search pill — desktop */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className={cn(
                "hidden w-56 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors lg:inline-flex xl:w-72",
                transparent
                  ? "border-white/40 text-white/80 hover:border-white hover:text-white"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-900 hover:text-zinc-700",
              )}
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search bags, categories…</span>
            </button>

            {/* Hamburger — mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className={cn(
                    "grid size-10 place-items-center transition-colors lg:hidden",
                    transparent
                      ? "text-white hover:bg-white/10"
                      : "text-zinc-900 hover:bg-zinc-100",
                  )}
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={cn(
                  // Full-width on every breakpoint — beats the primitive's
                  // `w-3/4` / `sm:max-w-sm` / any container `max-w-*` defaults.
                  "w-screen max-w-none data-[side=right]:w-screen data-[side=right]:sm:max-w-none",
                  // Smooth open/close — slide the full panel width from the
                  // right edge instead of the primitive's 40px slide-and-fade.
                  "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "data-[side=right]:data-open:slide-in-from-right-full",
                  "data-[side=right]:data-closed:slide-out-to-right-full",
                  "bg-white p-0",
                )}
                showCloseButton={false}
              >
                <MobileDrawer
                  pathname={pathname}
                  tiles={tiles}
                  onClose={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search — second row, below the main bar */}
        <div className="px-4 pb-3 md:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-full border px-4 text-left text-sm transition-colors",
              transparent
                ? "border-white/40 bg-white/10 text-white/85 backdrop-blur-sm"
                : "border-zinc-300 bg-zinc-50 text-zinc-500",
            )}
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search bags, categories…</span>
          </button>
        </div>

        {/* ── Mega menu — full width, sits below the header bar ─────────── */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={() => scheduleCloseMega()}
          aria-hidden={!megaOpen}
          style={{
            transitionProperty: "opacity, translate",
            transitionDuration: "400ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: megaOpen ? 1 : 0,
            translate: megaOpen ? "0 0" : "0 -0.75rem",
            pointerEvents: megaOpen ? "auto" : "none",
          }}
          className="absolute inset-x-0 top-full hidden border-t border-zinc-200 bg-white lg:block"
        >
          <MegaPanel tiles={tiles} onItemClick={() => setMegaOpen(false)} />
        </div>
      </header>

      {/* Search modal — sits outside the header so it stays put when header slides */}
      <HeaderSearchModal
        open={searchOpen}
        query={searchQuery}
        tiles={tiles}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mega panel — full-width, editorial layout
// ────────────────────────────────────────────────────────────────────────────

function MegaPanel({
  tiles,
  onItemClick,
}: {
  tiles: CategoryTile[];
  onItemClick: () => void;
}) {
  const featured = tiles.slice(0, 2);
  const list = tiles;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 lg:px-[4vw] lg:py-12">
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        {/* Left — heading + category list */}
        <div className="col-span-12 lg:col-span-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            Shop by Category
          </p>
          <h3 className="mt-3 text-3xl font-normal tracking-tight text-zinc-950">
            Every collection.
          </h3>
          {/* <p className="mt-3 max-w-sm text-sm text-zinc-600">
            From everyday totes to occasion clutches — find the bag that moves with you.
          </p> */}

          <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2.5">
            {list.map((tile) => (
              <li key={tile.id}>
                <Link
                  href={tile.href}
                  onClick={onItemClick}
                  className="group/item inline-flex items-center gap-1.5 text-sm font-medium tracking-tight text-zinc-700 transition-colors hover:text-zinc-950"
                >
                  {tile.name}
                  <ArrowUpRight
                    className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/category"
            onClick={onItemClick}
            className="group/all mt-8 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-950"
          >
            View all categories
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
          </Link>
        </div>

        {/* Right — featured cards */}
        <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-7">
          {featured.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              onClick={onItemClick}
              className="group/feat relative block aspect-[4/5] overflow-hidden bg-zinc-100"
            >
              {tile.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.imageUrl}
                  alt={tile.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/feat:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/75">
                    {tile.kicker ?? "Featured"}
                  </p>
                  <h4 className="mt-1.5 text-lg font-medium tracking-tight text-white">
                    {tile.name}
                  </h4>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-white/75 transition-all duration-300 ease-out group-hover/feat:-translate-y-0.5 group-hover/feat:translate-x-0.5 group-hover/feat:text-white"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mobile drawer — main links + categories + featured + contact
// ────────────────────────────────────────────────────────────────────────────

function MobileDrawer({
  pathname,
  tiles,
  onClose,
}: {
  pathname: string;
  tiles: CategoryTile[];
  onClose: () => void;
}) {
  const featured = tiles.slice(0, 2);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt={siteConfig.name}
          width={36}
          height={36}
          className="h-9 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-10 place-items-center rounded-full text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Main links */}
        <nav className="border-b border-zinc-100 px-5 py-2">
          <ul>
            {STATIC_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between border-b border-zinc-100 py-3.5 text-base font-medium tracking-tight transition-colors last:border-b-0",
                      active
                        ? "text-zinc-950"
                        : "text-zinc-700 hover:text-zinc-950",
                    )}
                  >
                    {l.label}
                    <ChevronRight className="size-4 text-zinc-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Shop by Category */}
        {tiles.length > 0 && (
          <div className="border-b border-zinc-100 px-5 py-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Shop by Category
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {tiles.map((tile) => (
                <li key={tile.id}>
                  <Link
                    href={tile.href}
                    onClick={onClose}
                    className="block text-sm font-medium tracking-tight text-zinc-700 transition-colors hover:text-zinc-950"
                  >
                    {tile.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/category"
              onClick={onClose}
              className="mt-6 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-950"
            >
              View all categories
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <div className="border-b border-zinc-100 px-5 py-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Featured
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {featured.map((tile) => (
                <Link
                  key={tile.id}
                  href={tile.href}
                  onClick={onClose}
                  className="group/m-feat relative block aspect-[4/5] overflow-hidden rounded-md bg-zinc-100"
                >
                  {tile.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tile.imageUrl}
                      alt={tile.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h4 className="text-sm font-medium tracking-tight text-white">
                      {tile.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="px-5 py-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            Get in touch
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={mailHref(siteConfig.email)}
                className="text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={telHref(siteConfig.phone)}
                className="text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
              >
                {formatPhone(siteConfig.phone)}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
