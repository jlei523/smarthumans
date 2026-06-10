import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { format, startOfWeek } from "date-fns";
import { auth } from "@/lib/auth";
import {
  getRecentlyResolved,
  getResolvingSoon,
  getSmartestUsers,
  getUserScore,
  paydayOf,
} from "@/lib/queries";
import { currentSeason, topPercent } from "@/lib/gamification";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";
import { DistributionBar, ScoreGauge } from "@/components/charts";
import { primaryStance } from "@/lib/queries";
import { deadlineLabel } from "@/lib/format";
import { STATUS_META } from "@/lib/status";

export const metadata: Metadata = { title: "Weekly digest" };
export const dynamic = "force-dynamic";

export default async function DigestPage() {
  const [resolved, soon, session] = await Promise.all([
    getRecentlyResolved(3),
    getResolvingSoon(3),
    auth.api.getSession({ headers: await headers() }),
  ]);
  const me = session?.user ? await getUserScore(session.user.id) : null;
  const payday = me ? paydayOf(me) : null;
  let pctile: number | null = null;
  if (me && me.seasonPoints > 0) {
    const all = await getSmartestUsers();
    pctile = topPercent(me.seasonPoints, all.map((u) => u.seasonPoints));
  }
  const weekOf = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d, yyyy");

  return (
    <div className="min-h-screen bg-paper-2 px-5 py-9 pb-16">
      <div className="mx-auto max-w-[600px]">
        <div className="mb-4 text-center">
          <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Email template · weekly digest
          </p>
          <Link
            href="/notifications"
            className="mt-2.5 inline-block rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            ← Back to notifications
          </Link>
        </div>

        {/* email body */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="bg-foreground px-8 py-7 text-center text-background">
            <span className="inline-flex items-center gap-2">
              <BrandMark size={22} />
              <span className="font-serif text-[17px] font-semibold">
                SmartHumans
              </span>
            </span>
            <p className="mt-4 font-serif text-[22px] leading-tight">
              Your week in predictions
            </p>
            <p className="mt-1.5 text-[13px] text-ink-4">
              Week of {weekOf}
              {session?.user ? ` · for ${session.user.name}` : ""}
            </p>
          </div>

          <div className="px-8 py-7">
            <p className="mb-3 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {session?.user
                ? `${resolved.length} claims you follow resolved this week`
                : `${resolved.length} claims resolved this week`}
            </p>
            <div className="grid gap-2.5">
              {resolved.map((p) => (
                <Link
                  key={p.id}
                  href={`/claims/${p.slug}`}
                  className="flex items-start gap-3 rounded-[9px] border p-3 hover:bg-accent/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] leading-snug">
                      {p.statement}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-ink-3">
                      {STATUS_META[p.status].label}
                      {primaryStance(p) ? ` · ${primaryStance(p)!.person.name}` : ""}
                    </span>
                  </span>
                  <StatusBadge status={p.status} size="sm" />
                </Link>
              ))}
            </div>

            <hr className="my-6 border-border" />

            <p className="mb-3 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Your record
            </p>
            {payday && payday.settled.length > 0 && (
              <p className="mb-3 text-sm leading-relaxed">
                You went{" "}
                <b>
                  {payday.wins}-for-{payday.settled.length}
                </b>{" "}
                on calls that settled this week, earning{" "}
                <b className="font-mono text-st-partly-tx">+{payday.pointsEarned}</b>{" "}
                points
                {pctile !== null && <> — top {pctile}% this season</>}.
              </p>
            )}
            {me && me.scorecard.total > 0 ? (
              <div className="flex items-center gap-4 py-1">
                <ScoreGauge
                  accuracy={me.scorecard.hasEnoughData ? me.scorecard.accuracy : null}
                  resolved={me.scorecard.resolved}
                  size={110}
                />
                <div className="flex-1 text-[13.5px] leading-relaxed text-ink-2">
                  You&apos;re at{" "}
                  <b className="font-mono text-foreground">
                    {me.scorecard.accuracy === null
                      ? "—"
                      : `${Math.round(me.scorecard.accuracy * 100)}%`}
                  </b>{" "}
                  across {me.scorecard.resolved} resolved stances.
                  <DistributionBar
                    scorecard={me.scorecard}
                    showLegend={false}
                    className="mt-2"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] text-ink-3">
                {session?.user
                  ? "Take a position on an open claim to start your record."
                  : "Sign in and take positions to build your personal record."}
              </p>
            )}

            <hr className="my-6 border-border" />

            <p className="mb-3 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Closing soon — make your call
            </p>
            <div className="grid gap-2">
              {soon.map((p) => (
                <Link
                  key={p.id}
                  href={`/claims/${p.slug}`}
                  className="flex items-center justify-between gap-2.5 rounded-[9px] bg-paper-2 px-3 py-2.5 hover:bg-paper-3"
                >
                  <span className="min-w-0 flex-1 text-[13px] leading-snug">
                    {p.statement}
                  </span>
                  <span className="shrink-0 font-meta text-[11.5px] font-semibold text-st-pending-tx">
                    {deadlineLabel(p.deadline)}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Open SmartHumans
              </Link>
            </div>
          </div>
          <div className="border-t px-8 py-4 text-center">
            <span className="text-[11px] italic text-ink-3">
              You receive this because you follow claims on SmartHumans ·
              Unsubscribe · Manage alerts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
