"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const OPTIONS: { value: ThemeValue; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * Theme selector rendered inside the admin sidebar (above Sign out). Uses real
 * radio inputs — Light / Dark / System.
 */
export function ThemeRadio({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme as ThemeValue | undefined) : undefined;

  if (collapsed) {
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className="flex flex-col items-center gap-1 py-1"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const checked = current === value;
          return (
            <label
              key={value}
              title={label}
              className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-lg transition-colors",
                checked
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <input
                type="radio"
                name="admin-theme"
                value={value}
                checked={checked}
                onChange={() => setTheme(value)}
                className="sr-only"
              />
              <Icon className="size-4" />
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="border-sidebar-border/60 bg-sidebar-accent/30 flex items-center gap-1 rounded-lg border p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          title={label}
          className={cn(
            "text-muted-foreground flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md transition-colors",
            "hover:text-sidebar-foreground",
            "has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-sm",
          )}
        >
          <input
            type="radio"
            name="admin-theme"
            value={value}
            checked={current === value}
            onChange={() => setTheme(value)}
            aria-label={label}
            className="sr-only"
          />
          <Icon className="size-4" />
        </label>
      ))}
    </div>
  );
}
