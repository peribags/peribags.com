import {
  Cable,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  shortcut?: string;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const adminNav: NavGroup[] = [
  {
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        shortcut: "D",
      },
      {
        href: "/admin/category",
        label: "Category",
        icon:FolderTree,
        shortcut: "C",
      },
      {
        href: "/admin/products",
        label: "Products",
        icon: Package,
        shortcut: "P",
      },
      {
        href: "/admin/enquiry",
        label: "Enquiry",
        icon: MessageSquare,
        shortcut: "E",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        shortcut: "S",
      },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
