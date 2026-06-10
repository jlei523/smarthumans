import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { BadgeCheck } from "lucide-react";
import { db } from "@/db";
import { userStances } from "@/db/schema";
import { auth } from "@/lib/auth";
import { buildScorecard, stanceOutcome } from "@/lib/scoring";
import { ScoreGauge, DistributionBar } from "@/components/charts";
import { StatusBadge } from "@/components/status-badge";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My scorecard" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/account");

  const myStances = await db.query.userStances.findMany({
    where: eq(userStances.userId, session.user.id),
    with: { proposition: true },
  });

  const entries = myStances
    .map((s) => ({
      proposition: s.proposition,
      position: s.position,
      outcome: stanceOutcome(s.proposition.status, s.position),
    }))
    .sort((a, b) => b.proposition.followerCount - a.proposition.followerCount);

  const scorecard = buildScorecard(entries.map((e) => e.outcome));
  const reputation = (session.user as { reputation?: number }).reputation ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        My scorecard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Same template everyone gets. Your registered stances are scored when
        propositions resolve.{" "}
        <Link
          href={`/u/${session.user.id}`}
          className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
        >
          View your public profile
        </Link>
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <ScoreGauge accuracy={scorecard.hasEnoughData ? scorecard.accuracy : null} resolved={scorecard.resolved} />
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="size-3.5" />
            reputation <span className="font-mono font-medium text-foreground">{reputation}</span>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">
            {session.user.name}{" "}
            <span className="font-normal text-muted-foreground">
              · {scorecard.total} stances registered
            </span>
          </p>
          <DistributionBar scorecard={scorecard} className="mt-2" />
          {!scorecard.hasEnoughData && (
            <p className="mt-3 text-xs text-muted-foreground">
              Not enough resolved stances to score yet — take a position on
              claims that resolve soon to build your record.
            </p>
          )}
        </div>
      </div>

      <h2 className="mt-10 font-serif text-xl font-bold">My positions</h2>
      <ul className="mt-3 divide-y rounded-lg border">
        {entries.map((e) => (
          <li key={e.proposition.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                e.position === "affirm"
                  ? "border-st-true/40 bg-st-true-bg text-st-true"
                  : "border-st-false/40 bg-st-false-bg text-st-false",
              )}
            >
              {e.position === "affirm" ? "Called Yes" : "Called No"}
            </span>
            <Link
              href={`/claims/${e.proposition.slug}`}
              className="min-w-0 flex-1 font-serif text-sm font-semibold hover:underline underline-offset-2"
            >
              {e.proposition.statement}
            </Link>
            <StatusBadge status={e.proposition.status} size="sm" />
            <span className="text-xs text-muted-foreground font-mono">
              {e.proposition.deadline ? fmtDate(e.proposition.deadline) : "no deadline"}
            </span>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            You haven't registered a position yet. Find a pending claim and
            pick a side.
          </li>
        )}
      </ul>
    </div>
  );
}
