import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<{ from?: string; error?: string }>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from, error } = await searchParams;

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link
            href="/"
            aria-label="peribags"
            className="inline-block transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="peribags"
              width={56}
              height={56}
              className="mx-auto h-14 w-auto"
            />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight">
            Sign in to Admin
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your admin credentials to continue.
          </p>
        </div>

        {error === "not_admin" && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-md border px-3 py-2 text-sm">
            Your account is not an admin.
          </div>
        )}

        <LoginForm from={from} />

        <p className="text-muted-foreground mt-10 text-center text-xs">
          &copy; {new Date().getFullYear()} peribags
        </p>
      </div>
    </main>
  );
}
