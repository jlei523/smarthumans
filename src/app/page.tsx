import Link from "next/link";
import { ClaimCard } from "@/components/claim-card";
import { PersonAvatar } from "@/components/person-chip";
import { accuracyTextClass } from "@/components/charts";
import { HeroSearch, type FigureHit } from "@/components/hero-search";
import { Section } from "@/components/section";
import { HomeSkin } from "@/components/home-hybrid";
import { ClaimFeed, type FeedItem } from "@/components/claim-feed";
import { TopicGlyph } from "@/components/topic-glyph";
import { fmtCount, deadlineLabel } from "@/lib/format";
import { CATEGORY_LABEL, DOMAIN_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getFollowedPropositionIds,
  getUserStanceMap,
  getSiteStats,
  getRecentlyResolved,
  getTrending,
  getMostFollowedPending,
  getResolvingSoon,
  getAllPersonScores,
  getTopicsIndex,
  primaryStance,
  type PersonScore,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [stats, recentlyResolved, trending, pending, resolvingSoon, scores, topics, followedIds, stanceMap] =
    await Promise.all([
      getSiteStats(),
      getRecentlyResolved(6),
      getTrending(6),
      getMostFollowedPending(6),
      getResolvingSoon(4),
      getAllPersonScores(),
      getTopicsIndex(),
      getFollowedPropositionIds(session?.user?.id),
      getUserStanceMap(session?.user?.id),
    ]);

  const ranked = [...scores]
    .filter((s) => s.scorecard.hasEnoughData)
    .sort((a, b) => (b.scorecard.accuracy ?? 0) - (a.scorecard.accuracy ?? 0));
  const best = ranked.slice(0, 3);
  // never repeat someone across the two boards
  const worst = [...ranked]
    .reverse()
    .filter((s) => !best.includes(s))
    .slice(0, 3);

  const toFeed = (
    list: Awaited<ReturnType<typeof getRecentlyResolved>>,
  ): FeedItem[] =>
    list.map((p) => ({
      proposition: p,
      stance: primaryStance(p),
      following: followedIds.has(p.id),
      myStance: stanceMap[p.id] ?? null,
    }));

  const figureHits: FigureHit[] = scores.map((s) => ({
    slug: s.person.slug,
    name: s.person.name,
    domainLabel: DOMAIN_LABEL[s.person.domain],
    claims: s.scorecard.total,
    accuracy: s.scorecard.hasEnoughData ? s.scorecard.accuracy : null,
    imageUrl: s.person.imageUrl,
  }));

  return (
    <HomeSkin>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:pt-20">
          <p className="font-meta text-[11px] uppercase tracking-[0.22em] text-ink-3">
            Crowdsourced accountability · Every verdict sourced
          </p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            <span className="paper-only">
              They said it.
              <br />
              We tracked it.
            </span>
            <span className="broadsheet-only">See who saw it coming.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-ink-2">
            A permanent, sourced, community-verified record of what people
            predicted and promised — presidents, pundits, and anyone willing
            to go on the record — and whether it actually happened.
          </p>
          <HeroSearch figures={figureHits} className="mx-auto mt-8 max-w-xl" />
          <dl className="term-stats mt-10 flex justify-center gap-10 sm:gap-16">
            {[
              { label: "claims tracked", value: stats.tracked },
              { label: "claims resolved", value: stats.resolved },
              { label: "follows", value: stats.followers },
            ].map((s) => (
              <div key={s.label}>
                <dd className="font-mono text-3xl font-semibold tabular-nums">
                  {s.value.toLocaleString("en-US")}
                </dd>
                <dt className="mt-1 font-meta text-[10px] uppercase tracking-[0.18em] text-ink-3">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        {/* Topics — the browse spine of the site */}
        <Section
          title="Topics"
          sub="Aggregate track records by domain"
          href="/browse"
          linkLabel="All topics"
          className="mt-10"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topics.map(({ category, scorecard }) => (
              <Link
                key={category}
                href={`/browse/${category}`}
                className="group rounded-lg border bg-card p-3.5 shadow-xs transition-shadow hover:shadow-md"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="glyph-box flex size-8 items-center justify-center rounded-md bg-paper-2 text-foreground">
                    <TopicGlyph category={category} size={18} />
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold tabular-nums",
                      accuracyTextClass(scorecard.accuracy),
                    )}
                  >
                    {scorecard.accuracy === null
                      ? "—"
                      : `${Math.round(scorecard.accuracy * 100)}%`}
                  </span>
                </span>
                <span className="mt-2.5 block font-serif text-[15px] font-semibold leading-tight group-hover:underline underline-offset-2">
                  {CATEGORY_LABEL[category]}
                </span>
                <span className="mt-0.5 block text-xs text-ink-3">
                  {scorecard.total} claims · {scorecard.resolved} resolved
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Resolves soon */}
        <Section
          title="Resolves soon"
          sub="Deadlines approaching — the calls about to be settled"
          href="/resolving-soon"
          linkLabel="All deadlines"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resolvingSoon.map((p) => {
              const first = primaryStance(p);
              return (
                <Link
                  key={p.id}
                  href={`/claims/${p.slug}`}
                  className="group flex flex-col gap-2.5 rounded-lg border bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
                >
                  <span className="flex items-center justify-between gap-2">
                    {first ? (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <PersonAvatar person={first.person} size="sm" />
                        <span className="truncate text-xs font-medium">
                          {first.person.name}
                        </span>
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="font-meta text-[11px] font-medium text-st-pending-tx whitespace-nowrap">
                      {deadlineLabel(p.deadline)}
                    </span>
                  </span>
                  <span className="font-serif text-[15px] font-semibold leading-snug group-hover:underline underline-offset-2">
                    {p.statement}
                  </span>
                  <span className="mt-auto flex items-center gap-2 pt-1 text-xs text-ink-3">
                    <span className="uppercase tracking-[0.08em]">
                      {CATEGORY_LABEL[p.category]}
                    </span>
                    <span>· {fmtCount(p.followerCount)} following</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* One claim feed, three filters + records sidebar */}
        <div className="grid gap-x-10 lg:grid-cols-[1fr_300px]">
          <ClaimFeed
            tabs={[
              {
                key: "resolved",
                label: "Recently resolved",
                sub: "Verified by community jury",
                items: toFeed(recentlyResolved),
              },
              {
                key: "followed",
                label: "Most followed",
                sub: "Open questions the community is watching",
                items: toFeed(pending),
              },
              {
                key: "trending",
                label: "Trending",
                sub: "Gaining the most follows this week",
                items: toFeed(trending),
              },
            ]}
          />
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
          </aside>
        </div>
      </div>
    </HomeSkin>
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

