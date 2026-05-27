"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types";

const STATIC_LINKS: { href: string; label: string }[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderShell({ categories }: { categories: CategoryNode[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile sheet whenever the user navigates.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header></header>
    // <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
    //   <NavigationMenu.Root
    //     className="relative z-10 w-full"
    //     delayDuration={120}
    //     skipDelayDuration={200}
    //   >
    //     <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
    //       {/* ── Left: Logo ───────────────────────────── */}
    //       <div className="flex shrink-0 items-center">
    //         <Link
    //           href="/"
    //           className="text-zinc-900 text-xl font-semibold tracking-tight transition-opacity hover:opacity-80 lg:text-2xl"
    //         >
    //           {siteConfig.name}
    //         </Link>
    //       </div>

    //       {/* ── Center: Desktop nav ──────────────────── */}
    //       <NavigationMenu.List className="hidden items-center gap-1 lg:flex">
    //         {categories.map((cat) => (
    //           <NavigationMenu.Item key={cat.id}>
    //             {cat.children.length > 0 ? (
    //               <>
    //                 <NavigationMenu.Trigger
    //                   className={cn(
    //                     "group inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium tracking-tight text-zinc-700 outline-none transition-colors",
    //                     "hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-900/20",
    //                     "data-[state=open]:text-zinc-950",
    //                   )}
    //                 >
    //                   {cat.name}
    //                   <ChevronDown
    //                     className="size-3.5 text-zinc-400 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-zinc-700"
    //                     aria-hidden
    //                   />
    //                 </NavigationMenu.Trigger>
    //                 <NavigationMenu.Content
    //                   className={cn(
    //                     "data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in-0 data-[motion=from-end]:slide-in-from-right-4",
    //                     "data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in-0 data-[motion=from-start]:slide-in-from-left-4",
    //                     "data-[motion=to-end]:animate-out data-[motion=to-end]:fade-out-0 data-[motion=to-end]:slide-out-to-right-4",
    //                     "data-[motion=to-start]:animate-out data-[motion=to-start]:fade-out-0 data-[motion=to-start]:slide-out-to-left-4",
    //                     "duration-200",
    //                   )}
    //                 >
    //                   <MegaPanel category={cat} />
    //                 </NavigationMenu.Content>
    //               </>
    //             ) : (
    //               <NavigationMenu.Link asChild>
    //                 <Link
    //                   href={`/category/${cat.slug}`}
    //                   className="inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium tracking-tight text-zinc-700 transition-colors hover:text-zinc-950"
    //                 >
    //                   {cat.name}
    //                 </Link>
    //               </NavigationMenu.Link>
    //             )}
    //           </NavigationMenu.Item>
    //         ))}

    //         {categories.length > 0 && (
    //           <span className="mx-2 h-4 w-px bg-zinc-200" aria-hidden />
    //         )}

    //         {STATIC_LINKS.map((l) => (
    //           <NavigationMenu.Item key={l.href}>
    //             <NavigationMenu.Link asChild>
    //               <Link
    //                 href={l.href}
    //                 className="inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium tracking-tight text-zinc-700 transition-colors hover:text-zinc-950"
    //               >
    //                 {l.label}
    //               </Link>
    //             </NavigationMenu.Link>
    //           </NavigationMenu.Item>
    //         ))}
    //       </NavigationMenu.List>

    //       {/* ── Right: Download + Mobile trigger ─────── */}
    //       <div className="flex shrink-0 items-center gap-2">
    //         <a
    //           href={siteConfig.catalogueUrl}
    //           download
    //           className={cn(
    //             "hidden items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-medium tracking-tight text-white transition-all lg:inline-flex",
    //             "hover:bg-zinc-800 hover:gap-2.5 hover:px-[1.05rem]",
    //             "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 focus-visible:ring-offset-2",
    //           )}
    //         >
    //           <Download className="size-3.5" />
    //           Download Catalogue
    //         </a>

    //         {/* Mobile-only download icon */}
    //         <a
    //           href={siteConfig.catalogueUrl}
    //           download
    //           aria-label="Download catalogue"
    //           className="grid size-10 place-items-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
    //         >
    //           <Download className="size-4" />
    //         </a>

    //         <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
    //           <SheetTrigger asChild>
    //             <button
    //               type="button"
    //               aria-label="Open menu"
    //               className="grid size-10 place-items-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
    //             >
    //               {mobileOpen ? (
    //                 <X className="size-5" />
    //               ) : (
    //                 <Menu className="size-5" />
    //               )}
    //             </button>
    //           </SheetTrigger>
    //           <SheetContent
    //             side="right"
    //             className="w-full max-w-md bg-white p-0 sm:max-w-md"
    //             showCloseButton={false}
    //           >
    //             <MobileMenu
    //               categories={categories}
    //               onClose={() => setMobileOpen(false)}
    //             />
    //           </SheetContent>
    //         </Sheet>
    //       </div>
    //     </div>

    //     {/* ── Mega menu viewport (full-width, below header) ── */}
    //     <div className="absolute left-0 right-0 top-full hidden justify-center lg:flex">
    //       <NavigationMenu.Viewport
    //         className={cn(
    //           "relative w-full origin-top overflow-hidden border-b border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,15,15,0.18)]",
    //           "h-[var(--radix-navigation-menu-viewport-height)] transition-[height,opacity] duration-300 ease-out",
    //           "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1",
    //           "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1",
    //           "data-[state=closed]:duration-150",
    //         )}
    //       />
    //     </div>
    //   </NavigationMenu.Root>
    // </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mega menu panel
// ────────────────────────────────────────────────────────────────────────────

function MegaPanel({ category }: { category: CategoryNode }) {
  const subCategories = category.children;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        {/* Lead column */}
        <div className="col-span-12 lg:col-span-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Collection
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {category.description}
            </p>
          )}
          <NavigationMenu.Link asChild>
            <Link
              href={`/category/${category.slug}`}
              className="group/cta mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 transition-all"
            >
              Shop all {category.name}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
            </Link>
          </NavigationMenu.Link>
        </div>

        {/* Sub-categories grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
            {subCategories.map((sub) => (
              <div key={sub.id} className="space-y-3">
                <NavigationMenu.Link asChild>
                  <Link
                    href={`/category/${sub.slug}`}
                    className="group/sub inline-flex items-center gap-1 text-sm font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-700"
                  >
                    {sub.name}
                    <ArrowRight className="size-3 opacity-0 transition-all duration-200 group-hover/sub:translate-x-0.5 group-hover/sub:opacity-100" />
                  </Link>
                </NavigationMenu.Link>
                {sub.children.length > 0 && (
                  <ul className="space-y-1.5">
                    {sub.children.map((leaf) => (
                      <li key={leaf.id}>
                        <NavigationMenu.Link asChild>
                          <Link
                            href={`/category/${leaf.slug}`}
                            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                          >
                            {leaf.name}
                          </Link>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mobile menu
// ────────────────────────────────────────────────────────────────────────────

function MobileMenu({
  categories,
  onClose,
}: {
  categories: CategoryNode[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
        <Link
          href="/"
          onClick={onClose}
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          {siteConfig.name}
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-10 place-items-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {categories.map((cat) => {
            const hasChildren = cat.children.length > 0;
            const open = expanded.has(cat.id);

            return (
              <li key={cat.id} className="border-b border-zinc-100 last:border-b-0">
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggle(cat.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-3 py-4 text-left"
                    >
                      <span className="text-base font-medium tracking-tight text-zinc-900">
                        {cat.name}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-zinc-400 transition-transform duration-200",
                          open && "rotate-180 text-zinc-700",
                        )}
                      />
                    </button>
                    {open && (
                      <div className="animate-in fade-in-0 slide-in-from-top-1 pb-4 duration-200">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                        >
                          Shop all {cat.name}
                          <ArrowRight className="size-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <ul className="mt-2 space-y-0.5 pl-3">
                          {cat.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/category/${sub.slug}`}
                                onClick={onClose}
                                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                              >
                                <span>{sub.name}</span>
                                <ChevronRight className="size-3.5 text-zinc-400" />
                              </Link>
                              {sub.children.length > 0 && (
                                <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3">
                                  {sub.children.map((leaf) => (
                                    <li key={leaf.id}>
                                      <Link
                                        href={`/category/${leaf.slug}`}
                                        onClick={onClose}
                                        className="block rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                      >
                                        {leaf.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="block py-4 text-base font-medium tracking-tight text-zinc-900"
                  >
                    {cat.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-1 border-t border-zinc-200 pt-6">
          {STATIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
            >
              {l.label}
              <ChevronRight className="size-4 text-zinc-400" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer CTA */}
      <div className="border-t border-zinc-200 p-4">
        <a
          href={siteConfig.catalogueUrl}
          download
          className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium tracking-tight text-white transition-colors hover:bg-zinc-800"
        >
          <Download className="size-4" />
          Download Catalogue
        </a>
      </div>
    </div>
  );
}
