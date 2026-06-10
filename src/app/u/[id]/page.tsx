import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { getSmartestUsers, getUserScore } from "@/lib/queries";
import { BADGES, currentSeason, topPercent } from "@/lib/gamification";
import { ScoreGauge, DistributionBar } from "@/components/charts";
import { FilterPill } from "@/components/filters";
import { StatusBadge } from "@/components/status-badge";

import { MIN_RESOLVED_FOR_SCORE } from "@/lib/scoring";
import { CATEGORY_LABEL } from "@/lib/status";
import { deadlineLabel, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const score = await getUserScore(id);
  return score ? { title: `@${score.name} — community scorecard` } : {};
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ f?: string }>;
}) {
  const { id } = await params;
  const { f = "all" } = await searchParams;
  const [score, allUsers] = await Promise.all([
    getUserScore(id),
    getSmartestUsers(),
  ]);
  if (!score) notFound();
  const { scorecard } = score;
  const pctile = topPercent(
    score.seasonPoints,
    allUsers.map((u) => u.seasonPoints),
  );

  const initials = score.name.slice(0, 2).toUpperCase();
  const calledIt = score.entries
    .filter((e) => e.outcome === "correct")
    .sort((a, b) => b.proposition.followerCount - a.proposition.followerCount)[0];

  const shown = score.entries.filter(
    (e) =>
      f === "all" ||
      (f === "correct" && e.outcome === "correct") ||
      (f === "wrong" && e.outcome === "incorrect") ||
      (f === "open" && ["pending", "disputed"].includes(e.outcome)),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-20">
      <div className="grid gap-7">
        {/* hero */}
        <div className="flex flex-wrap items-start gap-5">
          <span className="flex size-[84px] shrink-0 items-center justify-center rounded-[18px] border bg-accent font-mono text-[28px] font-medium uppercase text-ink-2">
            {initials}
          </span>
          <div className="min-w-[260px] flex-1">
            <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Community member · joined {format(score.joined, "yyyy")}
            </p>
            <h1 className="mt-1.5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight">
              @{score.name}
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md bg-st-partly-bg px-2 py-0.5 font-mono text-[11.5px] font-semibold text-st-partly-tx tabular-nums"
                title="Prediction points — contrarian-weighted, earned only when calls resolve. Never governance weight."
              >
                {score.points.toLocaleString()} pts
              </span>
              {pctile !== null && (
                <span className="rounded-md border bg-card px-2 py-0.5 text-[11.5px] font-medium text-ink-2">
                  Top {pctile}% · {currentSeason()}
                </span>
              )}
              <span
                className="rounded-md border bg-card px-2 py-0.5 font-mono text-[11.5px] font-medium text-ink-2"
                title="Reputation — governance weight from accepted submissions and resolution votes. Never game points."
              >
                rep {score.reputation.toLocaleString()}
              </span>
              {score.badges.map((b) => (
                <span
                  key={b}
                  title={BADGES[b].desc}
                  className="rounded-md bg-st-true-bg px-2 py-0.5 text-[11.5px] font-semibold text-st-true-tx"
                >
                  ✓ {BADGES[b].label}
                </span>
              ))}
              {score.titles.map((t) => (
                <span
                  key={t.season}
                  className="rounded-md border border-st-partly bg-card px-2 py-0.5 text-[11.5px] font-medium text-st-partly-tx"
                  title="Permanent end-of-season title"
                >
                  {t.title} — {t.season}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* scorecard — same template figures get */}
        <div className="rounded-[14px] border bg-card p-5 sm:p-6">
          <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-5">
              <ScoreGauge
                accuracy={scorecard.hasEnoughData ? scorecard.accuracy : null}
                resolved={scorecard.resolved}
                size={140}
              />
              <div className="max-w-[180px]">
                {scorecard.hasEnoughData ? (
                  <>
                    <p className="text-[13px] font-semibold text-ink-2">
                      Prediction accuracy
                    </p>
                    <p className="mt-1.5 text-[11px] italic text-ink-3">
                      {scorecard.correct} of {scorecard.resolved} resolved
                      stances were correct.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink-2">
                      Not enough data to score
                    </p>
                    <p className="mt-1.5 text-[11px] italic text-ink-3">
                      Only {scorecard.resolved} stance
                      {scorecard.resolved === 1 ? "" : "s"} resolved — needs at
                      least {MIN_RESOLVED_FOR_SCORE}.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
                Stance record
              </p>
              <DistributionBar scorecard={scorecard} />
            </div>
          </div>
          <p className="mt-4 border-t pt-4 text-[11px] italic text-ink-3">
            Same scorecard every figure gets. Based on {scorecard.resolved}{" "}
            resolved of {scorecard.total} total stances.
          </p>
        </div>

        {/* called-it highlight */}
        {calledIt && (
          <div className="rounded-[14px] border border-l-[3px] border-l-st-true bg-card p-5">
            <p className="mb-2.5 font-meta text-[11px] uppercase tracking-[0.14em] text-st-true">
              Called it · biggest correct call
            </p>
            <p className="font-serif text-[17px] leading-snug">
              {calledIt.proposition.statement}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2.5">
              <span className="rounded-[5px] bg-st-true-bg px-2 py-0.5 text-xs font-semibold text-st-true-tx">
                called {calledIt.position === "affirm" ? "Yes" : "No"} — and{" "}
                {calledIt.position === "affirm" ? "it came true" : "it didn't happen"}
              </span>
              <Link
                href={`/claims/${calledIt.proposition.slug}`}
                className="rounded-md border px-3 py-1 text-sm font-medium hover:bg-accent"
              >
                Open →
              </Link>
            </div>
          </div>
        )}

        {/* stance ledger */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-[22px] font-semibold tracking-tight">
                Stances
              </h2>
              <p className="text-[13px] text-ink-3">
                {score.entries.length} positions taken · scored on resolution
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  ["all", "All", score.entries.length],
                  [
                    "correct",
                    "Correct",
                    score.entries.filter((e) => e.outcome === "correct").length,
                  ],
                  [
                    "wrong",
                    "Wrong",
                    score.entries.filter((e) => e.outcome === "incorrect").length,
                  ],
                  [
                    "open",
                    "Open",
                    score.entries.filter((e) =>
                      ["pending", "disputed"].includes(e.outcome),
                    ).length,
                  ],
                ] as const
              ).map(([k, label, count]) => (
                <FilterPill
                  key={k}
                  href={k === "all" || f === k ? `/u/${id}` : `/u/${id}?f=${k}`}
                  active={f === k}
                  label={label}
                  count={count}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {shown.map((e) => (
              <Link
                key={e.proposition.id}
                href={`/claims/${e.proposition.slug}`}
                className="rounded-[11px] border bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "rounded-[5px] px-2 py-0.5 text-xs font-semibold",
                      e.position === "affirm"
                        ? "bg-st-true-bg text-st-true-tx"
                        : "bg-st-false-bg text-st-false-tx",
                    )}
                  >
                    called {e.position === "affirm" ? "Yes" : "No"}
                  </span>
                  {["pending", "disputed"].includes(e.outcome) ? (
                    <StatusBadge status={e.proposition.status} size="sm" />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        e.outcome === "correct" && "bg-st-true-bg text-st-true-tx",
                        e.outcome === "incorrect" && "bg-st-false-bg text-st-false-tx",
                        !["correct", "incorrect"].includes(e.outcome) &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {e.outcome === "correct"
                        ? "✓ Called it"
                        : e.outcome === "incorrect"
                          ? "✗ Missed"
                          : "—"}
                    </span>
                  )}
                  {e.pointsEarned !== null && e.pointsEarned > 0 && (
                    <span
                      className="font-mono text-xs font-semibold text-st-partly-tx tabular-nums"
                      title={
                        e.sideSharePct !== null
                          ? `${e.sideSharePct}% agreed with you at stake time — contrarian calls pay more`
                          : undefined
                      }
                    >
                      +{e.pointsEarned} pts
                    </span>
                  )}
                </div>
                <p className="font-serif text-base leading-snug">
                  {e.proposition.statement}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                  <span className="uppercase tracking-[0.08em]">
                    {CATEGORY_LABEL[e.proposition.category]}
                  </span>
                  <span>· staked {fmtDate(e.positionAt)}</span>
                  {e.switchCount > 0 && <span>· switched ×{e.switchCount}</span>}
                  <span>· {deadlineLabel(e.proposition.deadline)}</span>
                </div>
              </Link>
            ))}
            {shown.length === 0 && (
              <p className="rounded-[14px] border bg-card p-8 text-center text-sm text-ink-3">
                No stances match this filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
