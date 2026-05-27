"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { LogOut, Menu, PanelLeft, Store } from "lucide-react";
import { logoutAction } from "@/app/(admin)/admin/(shell)/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

const STORAGE_KEY = "admin-sidebar-collapsed";
const W_EXPANDED = "16rem";
const W_COLLAPSED = "4rem";

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2.5",
        collapsed ? "justify-center px-2" : "px-5",
      )}
    >
      <span className="bg-foreground text-background grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-bold tracking-tight">
        PB
      </span>
      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col leading-none">
          <Link
            href="/admin"
            className="text-foreground truncate text-sm font-semibold tracking-tight"
          >
            Perry Bags
          </Link>
          <span className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-[10px] tracking-wide uppercase">
            <Store className="size-2.5" />
            Main store
          </span>
        </div>
      )}
    </div>
  );
}

function initials(email: string | null) {
  if (!email) return "PB";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._\-\s]+/).filter(Boolean);
  return (
    (parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") ||
      email[0]?.toUpperCase() ||
      "PB").slice(0, 2)
  );
}

function SidebarFooter({
  collapsed,
  userEmail,
}: {
  collapsed: boolean;
  userEmail: string | null;
}) {
  const ini = initials(userEmail);

  return (
    <div className="border-sidebar-border border-t p-2 space-y-1">
      {userEmail && (
        <div
          title={collapsed ? userEmail : undefined}
          className={cn(
            "flex items-center rounded-lg",
            collapsed ? "justify-center px-0 py-1" : "gap-2.5 px-2 py-1.5",
          )}
        >
          <span className="bg-foreground text-background grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold tracking-wide">
            {ini}
          </span>
          {!collapsed && (
            <span className="text-sidebar-foreground/85 min-w-0 flex-1 truncate text-xs">
              {userEmail}
            </span>
          )}
        </div>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          title={collapsed ? "Sign out" : undefined}
          aria-label={collapsed ? "Sign out" : undefined}
          className={cn(
            "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground group flex h-9 w-full items-center rounded-lg text-sm transition-colors",
            collapsed ? "justify-center px-0" : "gap-2.5 px-3",
          )}
        >
          <LogOut className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors" />
          {!collapsed && <span className="flex-1 text-left">Sign out</span>}
        </button>
      </form>
    </div>
  );
}

function SidebarBody({
  collapsed,
  onNavigate,
  userEmail,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  userEmail: string | null;
}) {
  return (
    <>
      <SidebarHeader collapsed={collapsed} />
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      <SidebarFooter collapsed={collapsed} userEmail={userEmail} />
    </>
  );
}

export function SidebarShell({
  children,
  userEmail = null,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed, hydrated]);

  const sidebarWidth = collapsed ? W_COLLAPSED : W_EXPANDED;
  const layoutStyle = { "--sb-w": sidebarWidth } as CSSProperties;

  return (
    <div className="min-h-screen" style={layoutStyle}>
      <aside
        className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-40 hidden flex-col border-r transition-[width] duration-200 ease-in-out md:flex"
        style={{ width: sidebarWidth }}
      >
        <SidebarBody collapsed={collapsed} userEmail={userEmail} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="bg-sidebar text-sidebar-foreground flex flex-col gap-0 p-0"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
            userEmail={userEmail}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col transition-[padding-left] duration-200 ease-in-out md:pl-[var(--sb-w)]">
        <header className="bg-background/80 border-border/70 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur-md md:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            <PanelLeft
              className={cn(
                "size-5 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </Button>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>

      <ThemeToggle />
    </div>
  );
}
