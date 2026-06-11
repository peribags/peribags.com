import { createAnonClient } from "@/lib/supabase/anon";

/**
 * Keep-alive ping for Supabase. Free-tier Supabase projects auto-pause after
 * ~7 days of inactivity — this endpoint runs a trivial SELECT so the project
 * stays active. Wire it to a cron service (Vercel Cron / cron-job.org /
 * GitHub Actions) hitting once every 2–3 days.
 *
 * Security: requires `Authorization: Bearer <CRON_SECRET>` so randoms can't
 * spam it. Vercel Cron sends this header automatically when `CRON_SECRET`
 * is set in your project's env vars.
 *
 * Curl test:
 *   curl -H "Authorization: Bearer <SECRET>" https://peribags.vercel.app/api/cron/keep-alive
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;

  // Hard fail if the env var is missing — better than silently letting
  // anyone hit the endpoint.
  if (!secret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  // Vercel Cron sends `Authorization: Bearer <secret>` automatically when
  // the env var is set. External cron services should send the same header.
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    const supabase = createAnonClient();

    // Cheapest possible query that still touches a table — keeps the project
    // active without doing real work. Limit 1 so even on a huge categories
    // table this stays sub-50ms.
    const { error } = await supabase
      .from("categories")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      return Response.json(
        {
          ok: false,
          error: error.message,
          durationMs: Date.now() - startedAt,
        },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
