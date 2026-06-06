import {
  Briefcase,
  Cable,
  Clapperboard,
  FolderTree,
  GalleryHorizontalEnd,
  Images,
  LayoutDashboard,
  LayoutTemplate,
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
        href: "/admin/media",
        label: "Media",
        icon: Images,
        shortcut: "M",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        shortcut: "S",
      },
    ],
  },
  {
    label: "Storefront",
    items: [
      {
        href: "/admin/storefront/home-banner",
        label: "Home Banner",
        icon: GalleryHorizontalEnd,
        shortcut: "B",
      },
      {
        href: "/admin/storefront/home-sections",
        label: "Home Sections",
        icon: LayoutTemplate,
      },
      {
        href: "/admin/storefront/reels",
        label: "Reels",
        icon: Clapperboard,
      },
      {
        href: "/admin/storefront/our-work",
        label: "Our Work",
        icon: Briefcase,
      },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
