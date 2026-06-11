import Link from "next/link";
import type { Metadata } from "next";
import { Trophy, TrendingDown } from "lucide-react";
import { PersonAvatar } from "@/components/person-chip";
import { DistributionBar } from "@/components/charts";
import { FilterBar, FilterPill, SegTabs } from "@/components/filters";
import {
  getAllPersonScores,
  getSmartestUsers,
  getTopContributors,
  type UserScore,
} from "@/lib/queries";
import { CATEGORY_LABEL, DOMAIN_LABEL, STATUS_META } from "@/lib/status";
import { pct } from "@/lib/format";
import { buildScorecard, MIN_RESOLVED_FOR_SCORE } from "@/lib/scoring";
import { BADGES, currentSeason, topPercent } from "@/lib/gamification";
import { getTopicsIndex } from "@/lib/queries";
import type { Category } from "@/db/schema";
import { accuracyTextClass } from "@/components/charts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leaderboards",
  description: "Best and worst track records among tracked public figures.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; tab?: string }>;
}) {
  const { topic = "all", tab = "figures" } = await searchParams;
  const [scores, topics] = await Promise.all([
    getAllPersonScores(),
    getTopicsIndex(),
  ]);
  const users = tab === "users" ? await getSmartestUsers() : [];
  const contributors = tab === "contributors" ? await getTopContributors() : [];

  // Topic-scoped scorecards: a person's record within the selected topic.
  const scoped = scores.map((s) => {
    const ledger =
      topic === "all"
        ? s.ledger
        : s.ledger.filter((l) => l.proposition.category === topic);
    return {
      person: s.person,
      ledger,
      scorecard: buildScorecard(ledger.map((l) => l.outcome)),
    };
  });
  // Site-wide boards keep the full sample-size bar; topic boards only need
  // one resolved claim in that topic.
  const minResolved = topic === "all" ? MIN_RESOLVED_FOR_SCORE : 1;
  const eligible = scoped.filter((s) => s.scorecard.resolved >= minResolved);
  const tooFew = scoped.filter(
    (s) => s.scorecard.total > 0 && s.scorecard.resolved < minResolved,
  );
  const ranked = [...eligible].sort(
    (a, b) => (b.scorecard.accuracy ?? 0) - (a.scorecard.accuracy ?? 0),
  );
  // Influence = accuracy × following. Being loudly wrong scores low;
  // being quietly right scores low; being followed AND right tops the board.
  const influence = (s: (typeof eligible)[number]) =>
    Math.round((s.scorecard.accuracy ?? 0) * s.person.followerCount);
  const rankedByInfluence = [...eligible].sort(
    (a, b) => influence(b) - influence(a),
  );
  const isInfluence = tab === "influence";
  const board = isInfluence ? rankedByInfluence : ranked;

  const bestCalls = scoped
    .flatMap((s) =>
      s.ledger
        .filter((l) => l.outcome === "correct")
        .map((l) => ({ ...l, person: s.person })),
    )
    .sort((a, b) => b.proposition.followerCount - a.proposition.followerCount);
  const worstMisses = scoped
    .flatMap((s) =>
      s.ledger
        .filter((l) => l.outcome === "incorrect")
        .map((l) => ({ ...l, person: s.person })),
    )
    .sort((a, b) => b.proposition.followerCount - a.proposition.followerCount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Leaderboards
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Accuracy = correct calls (partly true counts half) over resolved
        claims, rankable by topic. Influence = accuracy × followers. Site-wide
        boards require {MIN_RESOLVED_FOR_SCORE} resolved claims; topic boards
        require one.
      </p>

      {/* Figures | Users view tabs — two community ladders: being right
          (Smartest users) and building the record (Top contributors) */}
      <SegTabs
        className="mt-5"
        tabs={[
          { key: "figures", label: "By accuracy", href: "/leaderboards", active: tab === "figures" },
          { key: "influence", label: "By influence", href: "/leaderboards?tab=influence", active: tab === "influence" },
          { key: "users", label: "Smartest users", href: "/leaderboards?tab=users", active: tab === "users" },
          { key: "contributors", label: "Top contributors", href: "/leaderboards?tab=contributors", active: tab === "contributors" },
        ]}
      />

      {tab === "users" ? (
        <SmartestUsersTable users={users} />
      ) : tab === "contributors" ? (
        <TopContributorsTable users={contributors} />
      ) : (
        <>
      {/* Topic filter */}
      <FilterBar className="mt-5">
        <FilterPill
          href={isInfluence ? "/leaderboards?tab=influence" : "/leaderboards"}
          active={topic === "all"}
          label="All topics"
          count={topics.reduce((s, t) => s + t.scorecard.total, 0)}
        />
        {topics.map((t) => (
          <FilterPill
            key={t.category}
            href={
              topic === t.category
                ? isInfluence
                  ? "/leaderboards?tab=influence"
                  : "/leaderboards"
                : `/leaderboards?topic=${t.category}${isInfluence ? "&tab=influence" : ""}`
            }
            active={topic === t.category}
            label={CATEGORY_LABEL[t.category as Category]}
            count={t.scorecard.total}
          />
        ))}
      </FilterBar>

      {/* Ranked table */}
      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">#</th>
              <th className="px-4 py-2.5 font-medium">Person</th>
              {isInfluence && (
                <th className="px-4 py-2.5 font-medium text-right">Influence</th>
              )}
              <th className="px-4 py-2.5 font-medium text-right">Accuracy</th>
              {isInfluence ? (
                <th className="px-4 py-2.5 font-medium text-right">Followers</th>
              ) : (
                <th className="px-4 py-2.5 font-medium text-right">Resolved</th>
              )}
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell w-64">
                Record
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {board.map((entry, i) => {
              const { person, scorecard } = entry;
              return (
              <tr key={person.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/p/${person.slug}`} className="flex items-center gap-2.5 hover:underline underline-offset-2">
                    <PersonAvatar person={person} size="md" />
                    <span>
                      <span className="font-medium">{person.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {DOMAIN_LABEL[person.domain]}
                      </span>
                    </span>
                  </Link>
                </td>
                {isInfluence && (
                  <td className="px-4 py-3 text-right font-mono text-base font-semibold tabular-nums">
                    {influence(entry).toLocaleString("en-US")}
                  </td>
                )}
                <td className={cn(
                  "px-4 py-3 text-right font-mono tabular-nums",
                  isInfluence ? "text-muted-foreground" : "text-base font-semibold",
                )}>
                  {scorecard.accuracy === null ? "—" : pct(scorecard.accuracy)}
                </td>
                {isInfluence ? (
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {person.followerCount.toLocaleString("en-US")}
                  </td>
                ) : (
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {scorecard.resolved}
                  </td>
                )}
                <td className="hidden px-4 py-3 sm:table-cell">
                  <DistributionBar scorecard={scorecard} showLegend={false} />
                </td>
              </tr>
            );})}
            {board.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No scored claims in this topic yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tooFew.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Not yet scoreable (fewer than {MIN_RESOLVED_FOR_SCORE} resolved):{" "}
          {tooFew.map((s, i) => (
            <span key={s.person.id}>
              {i > 0 && ", "}
              <Link href={`/p/${s.person.slug}`} className="underline underline-offset-2">
                {s.person.name}
              </Link>
            </span>
          ))}
        </p>
      )}

      {/* Best call / worst miss */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <HighlightCard
          icon={<Trophy className="size-4 text-st-true" />}
          title="Best call"
          kind="hit"
          entry={bestCalls[0]}
        />
        <HighlightCard
          icon={<TrendingDown className="size-4 text-st-false" />}
          title="Worst miss"
          kind="miss"
          entry={worstMisses[0]}
        />
      </div>
        </>
      )}
    </div>
  );
}

/**
 * The contributor ladder — reputation earned by sourcing, reviewing, and
 * jury work. Deliberately separate from prediction accuracy: building the
 * record and being right are different skills, scored apart.
 */
function TopContributorsTable({ users }: { users: UserScore[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[14px] border bg-card">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-[0.07em] text-ink-3">
            <th className="w-11 px-3 py-2.5 font-semibold">#</th>
            <th className="px-3 py-2.5 font-semibold">Contributor</th>
            <th className="w-28 px-3 py-2.5 text-right font-semibold">Reputation</th>
            <th className="w-40 px-3 py-2.5 text-right font-semibold">
              Accepted submissions
            </th>
            <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Badges</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u, i) => (
            <tr key={u.id} className="hover:bg-paper-2">
              <td className="px-3 py-2.5 font-mono text-ink-3">{i + 1}</td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/u/${u.id}`}
                  className="flex items-center gap-2.5 font-semibold hover:underline underline-offset-2"
                >
                  <span className="flex size-7 items-center justify-center rounded-md border bg-accent font-meta text-[10px] uppercase text-ink-2">
                    {u.name.slice(0, 2)}
                  </span>
                  @{u.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums">
                {u.reputation.toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-ink-2">
                {u.approvedSubmissions.toLocaleString()}
              </td>
              <td className="hidden px-3 py-2.5 sm:table-cell">
                <span className="flex flex-wrap gap-1.5">
                  {u.badges.map((b) => (
                    <span
                      key={b}
                      title={BADGES[b].desc}
                      className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2"
                    >
                      {BADGES[b].label}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-sm text-ink-3">
                No contributor activity yet — accepted submissions and review
                work build reputation.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SmartestUsersTable({ users }: { users: UserScore[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[14px] border bg-card">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-[0.07em] text-ink-3">
            <th className="w-11 px-3 py-2.5 font-semibold">#</th>
            <th className="px-3 py-2.5 font-semibold">User</th>
            <th className="px-3 py-2.5 font-semibold">Badges</th>
            <th className="w-24 px-3 py-2.5 text-right font-semibold">Accuracy</th>
            <th className="hidden w-56 px-3 py-2.5 font-semibold sm:table-cell">Record</th>
            <th className="w-24 px-3 py-2.5 text-right font-semibold">Resolved</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u, i) => (
            <tr key={u.id} className="hover:bg-paper-2">
              <td className="px-3 py-2.5 font-mono text-ink-3">{i + 1}</td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/u/${u.id}`}
                  className="flex items-center gap-2.5 font-semibold hover:underline underline-offset-2"
                >
                  <span className="flex size-7 items-center justify-center rounded-md border bg-accent font-meta text-[10px] uppercase text-ink-2">
                    {u.name.slice(0, 2)}
                  </span>
                  @{u.name}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <span className="flex flex-wrap gap-1.5">
                  {u.scorecard.correct > 0 && (
                    <span className="rounded-md bg-st-true-bg px-1.5 py-0.5 text-[10px] font-semibold text-st-true-tx">
                      ✓ Called It
                    </span>
                  )}
                  {u.reputation >= 500 && (
                    <span className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2">
                      Jury Member
                    </span>
                  )}
                  <span className="rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2">
                    rep {u.reputation.toLocaleString()}
                  </span>
                </span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span
                  className={cn(
                    "font-mono text-[15px] font-semibold tabular-nums",
                    accuracyTextClass(
                      u.scorecard.hasEnoughData ? u.scorecard.accuracy : null,
                    ),
                  )}
                >
                  {u.scorecard.hasEnoughData && u.scorecard.accuracy !== null
                    ? pct(u.scorecard.accuracy)
                    : "—"}
                </span>
              </td>
              <td className="hidden px-3 py-2.5 sm:table-cell">
                <DistributionBar scorecard={u.scorecard} showLegend={false} />
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-ink-2">
                {u.scorecard.resolved}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink-3">
                No community stances registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  kind,
  entry,
}: {
  icon: React.ReactNode;
  title: string;
  kind: "hit" | "miss";
  entry?: {
    person: { name: string; slug: string };
    proposition: { slug: string; statement: string; status: "pending" | "came_true" | "partly_true" | "didnt_come_true" | "walked_back" | "unverifiable" | "disputed" };
    stance: { quote: string; position: "affirm" | "deny" };
  };
}) {
  if (!entry) return null;
  return (
    <Link
      href={`/claims/${entry.proposition.slug}`}
      className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon} {title} · {entry.person.name}
      </p>
      <blockquote className="mt-2 font-serif italic leading-snug text-foreground line-clamp-3">
        “{entry.stance.quote}”
      </blockquote>
      <p className="mt-2 text-xs">
        <span
          className={cn(
            "font-semibold",
            kind === "hit" ? "text-st-true-tx" : "text-st-false-tx",
          )}
        >
          {kind === "hit" ? "✓ Called it" : "✗ Missed"}
        </span>{" "}
        <span className="text-muted-foreground">
          — said it {entry.stance.position === "affirm" ? "would" : "wouldn't"}{" "}
          happen; resolved {STATUS_META[entry.proposition.status].label}.
        </span>
      </p>
    </Link>
  );
}
