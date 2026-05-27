"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNav, isNavActive } from "./nav-items";
import { getUser } from "@/lib/auth";

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-5", collapsed ? "px-2" : "px-3")}>
      {adminNav.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.label && !collapsed && (
            <span className="text-muted-foreground/80 px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex h-9 items-center rounded-lg text-sm transition-all",
                  collapsed
                    ? "justify-center px-0"
                    : "gap-2.5 px-3",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-[0_1px_2px_oklch(0_0_0/0.04),inset_0_0_0_1px_oklch(0_0_0/0.04)] dark:shadow-[0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(1_0_0/0.06)]"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {active && !collapsed && (
                  <span
                    aria-hidden
                    className="bg-foreground absolute top-1.5 -left-3 h-6 w-[3px] rounded-r-full"
                  />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge != null && (
                      <span className="bg-foreground text-background inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && item.badge == null && (
                      <kbd className="bg-muted/60 text-muted-foreground border-border/60 hidden h-5 min-w-[1.25rem] items-center justify-center rounded border px-1 font-mono text-[10px] font-medium group-hover:inline-flex">
                        {item.shortcut}
                      </kbd>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
