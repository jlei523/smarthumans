import Link from "next/link";
import { PersonAvatar } from "@/components/person-chip";
import { accuracyTextClass } from "@/components/charts";
import { ClaimCard } from "@/components/claim-card";
import { Section } from "@/components/section";
import { LedgerSortBar, type LedgerItem } from "@/components/ledger-sort-bar";
import { DOMAIN_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getCallOfTheWeek,
  getCommentCounts,
  getFollowedPropositionIds,
  getUserStanceMap,
  getClaimWire,
  getRecentlyResolved,
  getResolvingSoon,
  getAllPersonScores,
  getSmartestUsers,
  primaryStance,
  type PersonScore,
} from "@/lib/queries";
import { currentSeason } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [
    wire,
    commentCounts,
    justResolved,
    resolvingSoon,
    scores,
    followedIds,
    stanceMap,
    smartestUsers,
    callOfTheWeek,
  ] = await Promise.all([
    getClaimWire(18, session?.user?.id),
    getCommentCounts(),
    getRecentlyResolved(4),
    getResolvingSoon(4),
    getAllPersonScores(),
    getFollowedPropositionIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
    getSmartestUsers(),
    getCallOfTheWeek(),
  ]);
  const topForecasters = smartestUsers.slice(0, 3);

  const ranked = [...scores]
    .filter((s) => s.scorecard.hasEnoughData)
    .sort((a, b) => (b.scorecard.accuracy ?? 0) - (a.scorecard.accuracy ?? 0));
  const best = ranked.slice(0, 3);
  // never repeat someone across the two boards
  const worst = [...ranked]
    .reverse()
    .filter((s) => !best.includes(s))
    .slice(0, 3);

  const feedItems: LedgerItem[] = wire.map((p) => ({
    proposition: p,
    stance: primaryStance(p),
    stances: p.stances,
    commentCount: commentCounts[p.id] ?? 0,
    following: followedIds.has(p.id),
    myStance: stanceMap[p.id] ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4">
      <h1 className="sr-only">SmartHumans — public track records</h1>
      {/* Just resolved — the payoff feed */}
      <Section title="Just resolved" className="mt-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {justResolved.map((p) => (
            <ClaimCard
              key={p.id}
              proposition={p}
              stance={primaryStance(p)}
              stances={p.stances}
              showFollow={false}
              myStance={stanceMap[p.id] ?? null}
              commentCount={commentCounts[p.id] ?? 0}
            />
          ))}
        </div>
      </Section>

      {/* Resolves soon — the open questions nearest their deadline */}
      <Section
        title="Resolves soon"
        href="/resolving-soon"
        className="mt-10"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resolvingSoon.map((p) => (
            <ClaimCard
              key={p.id}
              proposition={p}
              stance={primaryStance(p)}
              stances={p.stances}
              following={followedIds.has(p.id)}
              myStance={stanceMap[p.id] ?? null}
              commentCount={commentCounts[p.id] ?? 0}
            />
          ))}
        </div>
      </Section>

      {/* The claim wire — same sort-led bar as every claim list + records sidebar */}
      <div className="grid gap-x-10 lg:grid-cols-[1fr_300px]">
        <section className="mt-12">
          <LedgerSortBar items={feedItems} />
        </section>
        <aside>
          <Section title="Best records" href="/leaderboards">
            <RecordsList entries={best} />
          </Section>
          <Section title="Worst records" href="/leaderboards">
            <RecordsList entries={worst} />
          </Section>
          <p className="mt-3 text-xs italic text-ink-3">
            Minimum 3 resolved claims to appear on a leaderboard.
          </p>

          {/* the community is on the same scoreboard as the famous */}
          <Section
            title="Top forecasters"
            sub={currentSeason()}
            href="/leaderboards?tab=users"
          >
            <ul className="term-rows divide-y">
              {topForecasters.map((u, i) => (
                <li key={u.id}>
                  <Link
                    href={`/u/${u.id}`}
                    className="flex items-center gap-3 py-2.5 hover:bg-accent/40"
                  >
                    <span className="w-3 text-xs text-ink-3 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-accent font-mono text-[10px] font-medium uppercase text-ink-2">
                      {u.name.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        @{u.name}
                      </span>
                      <span className="block text-xs text-ink-3">
                        {u.scorecard.resolved} resolved · rep{" "}
                        {u.reputation.toLocaleString()}
                      </span>
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {u.seasonPoints.toLocaleString()} pts
                    </span>
                  </Link>
                </li>
              ))}
              {topForecasters.length === 0 && (
                <li className="py-2.5 text-sm text-ink-3">
                  No community calls resolved yet this season.
                </li>
              )}
            </ul>
          </Section>

          {callOfTheWeek && (
            <Section title="Call of the week">
              <div className="rounded-xl border bg-st-true-bg p-4 shadow-xs">
                <p className="text-sm leading-relaxed">
                  <Link
                    href={`/u/${callOfTheWeek.id}`}
                    className="font-semibold hover:underline underline-offset-2"
                  >
                    @{callOfTheWeek.name}
                  </Link>{" "}
                  staked{" "}
                  <span className="font-semibold">
                    {callOfTheWeek.position === "affirm" ? "Yes" : "No"}
                  </span>{" "}
                  when {callOfTheWeek.sharePct < 50 ? "only " : ""}
                  <span className="font-mono tabular-nums">
                    {callOfTheWeek.sharePct}%
                  </span>{" "}
                  agreed — and was right.
                </p>
                <p className="mt-2 font-serif text-sm leading-snug text-ink-2">
                  <Link
                    href={`/claims/${callOfTheWeek.proposition.slug}`}
                    className="hover:underline underline-offset-2"
                  >
                    {callOfTheWeek.proposition.statement}
                  </Link>
                </p>
                {callOfTheWeek.pointsEarned !== null && (
                  <p className="mt-2 font-mono text-xs font-semibold text-st-true-tx">
                    +{callOfTheWeek.pointsEarned.toLocaleString()} pts
                  </p>
                )}
              </div>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}

function RecordsList({ entries }: { entries: PersonScore[] }) {
  return (
    <ul className="term-rows divide-y">
      {entries.map(({ person, scorecard }, i) => (
        <li key={person.id}>
          <Link
            href={`/p/${person.slug}`}
            className="flex items-center gap-3 py-2.5 hover:bg-accent/40"
          >
            <span className="w-3 text-xs text-ink-3 tabular-nums">{i + 1}</span>
            <PersonAvatar person={person} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {person.name}
              </span>
              <span className="block text-xs text-ink-3">
                {DOMAIN_LABEL[person.domain]}
              </span>
            </span>
            <span className="text-right">
              <span
                className={cn(
                  "block font-mono text-base font-semibold tabular-nums",
                  accuracyTextClass(scorecard.accuracy),
                )}
              >
                {scorecard.accuracy === null
                  ? "—"
                  : `${(scorecard.accuracy * 100).toFixed(1)}%`}
              </span>
              <span className="block text-xs italic text-ink-3">
                {scorecard.resolved} resolved
              </span>
            </span>
          </Link>
        </li>
      ))}
      {entries.length === 0 && (
        <li className="py-2.5 text-sm text-ink-3">
          Not enough resolved claims yet.
        </li>
      )}
    </ul>
  );
}

