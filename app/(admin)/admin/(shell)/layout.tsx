import { SidebarShell } from "@/components/admin/sidebar-shell";
import { getUser } from "@/lib/auth";

export default async function AdminShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  return (
    <SidebarShell userEmail={user?.email ?? null}>{children}</SidebarShell>
  );
}
