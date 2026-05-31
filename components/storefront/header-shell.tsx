"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { categoryTiles } from "@/lib/category-tiles";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types";
import { HeaderSearchModal } from "./header-search";

const STATIC_LINKS: { href: string; label: string }[] = [
  { href: "/category", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SCROLL_HIDE_THRESHOLD = 80; // px down before hide kicks in
const AT_TOP_THRESHOLD = 10; // px from top to count as "at top"

export function HeaderShell({ categories: _categories }: { categories: CategoryNode[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Close panels on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close mega when header hides on scroll-down.
  useEffect(() => {
    if (hidden) setMegaOpen(false);
  }, [hidden]);

  // Escape closes mega.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset visibility on route change so the header is always visible on entry.
  useEffect(() => {
    setHidden(false);
    setAtTop(window.scrollY < AT_TOP_THRESHOLD);
    lastScrollY.current = window.scrollY;
  }, [pathname]);

  // Track scroll direction + atTop.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < AT_TOP_THRESHOLD);

      // Don't hide while mobile sheet is open.
      if (mobileOpen) {
        lastScrollY.current = y;
        return;
      }

      if (y > lastScrollY.current && y > SCROLL_HIDE_THRESHOLD) {
        setHidden(true); // scrolling down → slide up
      } else if (y < lastScrollY.current) {
        setHidden(false); // scrolling up → slide down
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  // Transparent only on home page top. Any open panel forces white.
  const transparent = isHome && atTop && !mobileOpen && !megaOpen && !searchOpen;

  return (
    <>
      {/* Spacer — reserves layout space when the header is fixed + solid (non-home pages).
          Home keeps the hero flush under the transparent header. */}
      {!isHome && <div aria-hidden className="h-16 lg:h-20" />}

      <header
      style={{
        transitionProperty: "transform, background-color, border-color, color",
        transitionDuration: "500ms, 300ms, 300ms, 300ms",
        transitionTimingFunction:
          "cubic-bezier(0.22, 1, 0.36, 1), ease-out, ease-out, ease-out",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        willChange: "transform",
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-40",
        transparent
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b border-zinc-200 bg-white text-zinc-950 backdrop-blur ",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6 lg:h-20 lg:px-[4vw]">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold uppercase transition-opacity hover:opacity-70 lg:text-xl"
        >
          {siteConfig.name}
        </Link>

        {/* Nav — right (desktop) */}
        <nav className="hidden items-center gap-8 lg:flex">
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
                        showUnderline ? "text-white after:scale-x-100" : "text-white hover:text-white",
                      )
                    : cn(
                        "after:bg-zinc-950",
                        showUnderline ? "text-zinc-950 after:scale-x-100" : "text-zinc-600 hover:text-zinc-950",
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

          {/* Search trigger — desktop */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className={cn(
              "ml-2 grid size-9 place-items-center transition-colors",
              transparent ? "text-white hover:bg-white/10" : "text-zinc-900 hover:bg-zinc-100",
            )}
          >
            <Search className="size-4" />
          </button>
        </nav>

        {/* Mobile actions — search + hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className={cn(
              "grid size-10 place-items-center transition-colors",
              transparent ? "text-white hover:bg-white/10" : "text-zinc-900 hover:bg-zinc-100",
            )}
          >
            <Search className="size-5" />
          </button>

        {/* Hamburger — right (mobile) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className={cn(
                "grid size-10 place-items-center transition-colors lg:hidden",
                transparent ? "text-white hover:bg-white/10" : "text-zinc-900 hover:bg-zinc-100",
              )}
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm bg-white p-0" showCloseButton={false}>
            <div className="flex h-full flex-col">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
                <span className="text-lg font-semibold tracking-tight text-zinc-950">
                  {siteConfig.name}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="grid size-10 place-items-center text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-1">
                  {STATIC_LINKS.map((l) => {
                    const active = pathname === l.href;
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block border-b border-zinc-100 py-4 text-base font-medium tracking-tight transition-colors",
                            active ? "text-zinc-950" : "text-zinc-700 hover:text-zinc-950",
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        </div>
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
        <MegaPanel onItemClick={() => setMegaOpen(false)} />
      </div>
    </header>

      {/* Search modal — sits outside the header so it stays put when header slides */}
      <HeaderSearchModal
        open={searchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mega panel — full-width, editorial layout
// ────────────────────────────────────────────────────────────────────────────

function MegaPanel({ onItemClick }: { onItemClick: () => void }) {
  const featured = categoryTiles.slice(0, 2);
  const list = categoryTiles;

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
          <p className="mt-3 max-w-sm text-sm text-zinc-600">
            From everyday totes to occasion clutches — find the bag that moves with you.
          </p>

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
              className="group/feat relative block aspect-[4/5] overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={"/sling.jpg"}
                alt={tile.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/feat:scale-[1.04]"
              />
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
