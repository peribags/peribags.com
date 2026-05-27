import { redirect } from "next/navigation";
import { Lock, Settings as SettingsIcon, UserCircle2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const user = await getUser();
  if (!user || !user.email) {
    redirect("/admin/login?from=/admin/settings");
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    typeof meta.display_name === "string" ? meta.display_name : "";
  const phone = typeof meta.phone === "string" ? meta.phone : "";

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
          <SettingsIcon className="size-3" />
          Account · Settings
        </p>
        <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          Settings
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Manage your admin account. Email is fixed — to change it, contact
          whoever provisioned this account.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <Section
          icon={UserCircle2}
          kicker="Profile"
          title="General details"
          description="How you appear inside the admin panel."
        >
          <ProfileForm
            email={user.email}
            defaultDisplayName={displayName}
            defaultPhone={phone}
          />
        </Section>

        <Section
          icon={Lock}
          kicker="Security"
          title="Password"
          description="You’ll need your current password to set a new one."
        >
          <PasswordForm />
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  kicker,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  kicker: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card space-y-6 rounded-2xl border p-6 lg:p-8">
      <div className="space-y-1.5">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
          <Icon className="size-3" />
          {kicker}
        </p>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
