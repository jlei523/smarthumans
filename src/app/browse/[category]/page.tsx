import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PersonChip, PersonAvatar } from "@/components/person-chip";
import {
  DistributionBar,
  ScoreGauge,
  accuracyTextClass,
} from "@/components/charts";
import { StatusBadge } from "@/components/status-badge";
import { LedgerSortBar } from "@/components/ledger-sort-bar";
import { FollowButton } from "@/components/follow-button";
import { TopicGlyph } from "@/components/topic-glyph";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getCommentCounts,
  getFollowedPropositionIds,
  getTopicData,
  getUserStanceMap,
  primaryStance,
} from "@/lib/queries";
import { TOPIC_BLURBS } from "@/lib/topics";
import { CATEGORY_LABEL, DOMAIN_LABEL } from "@/lib/status";
import { categoryEnum, type Category } from "@/db/schema";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABEL[category as Category];
  return {
    title: label ? `${label} — claims by topic` : "Browse",
    description: TOPIC_BLURBS[category as Category],
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; window?: string; status?: string }>;
}) {
  const { category } = await params;
  const { sort, window: windowScope, status } = await searchParams;
  if (!categoryEnum.enumValues.includes(category as Category)) notFound();
  const cat = category as Category;
  const session = await auth.api.getSession({ headers: await headers() });
  const [
    { claims, scorecard, topForecasters, mostFollowed },
    commentCounts,
    followedIds,
    stanceMap,
  ] = await Promise.all([
    getTopicData(cat),
    getCommentCounts(),
    getFollowedPropositionIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 pb-20">
      {/* compact header — the claims are the page */}
      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">Topic</Link>
      </p>
      <h1 className="mt-1 font-serif text-3xl font-bold leading-tight tracking-tight">
        {CATEGORY_LABEL[cat]}
        <span className="ml-3 align-middle font-sans text-sm font-normal text-muted-foreground">
          {scorecard.total} claims · {scorecard.resolved} resolved
        </span>
      </h1>

      <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ----- main: the claims behind the sort-led bar ----- */}
        <main className="min-w-0">
          <LedgerSortBar
            items={claims.map((p) => ({
              proposition: p,
              stance: primaryStance(p),
              commentCount: commentCounts[p.id] ?? 0,
              following: followedIds.has(p.id),
              myStance: stanceMap[p.id] ?? null,
            }))}
            showCategory={false}
            initialSort={sort}
            initialWindow={windowScope}
            initialStatus={status}
          />
        </main>

        {/* ----- sidebar: everything else ----- */}
        <aside className="space-y-8">
          <section>
            <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              About this topic
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <span className="glyph-box flex size-10 shrink-0 items-center justify-center rounded-lg border bg-paper-2 text-foreground">
                <TopicGlyph category={cat} size={22} />
              </span>
              <p className="text-sm leading-relaxed text-ink-2">
                {TOPIC_BLURBS[cat]}
              </p>
            </div>
          </section>

          <section>
            <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Topic scorecard
            </h2>
            <div className="mt-3 flex justify-center">
              <ScoreGauge
                accuracy={scorecard.accuracy}
                resolved={scorecard.resolved}
                size={130}
              />
            </div>
            <DistributionBar scorecard={scorecard} className="mt-2" />
            <p className="mt-2 text-[11px] italic text-ink-3">
              Resolved-true rate across every claim filed under{" "}
              {CATEGORY_LABEL[cat]}.
            </p>
          </section>

          {topForecasters.length > 0 && (
            <section>
              <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Top forecasters
              </h2>
              <ul className="divide-y">
                {topForecasters.map(({ person, scorecard: sc }) => (
                  <li key={person.id}>
                    <Link
                      href={`/p/${person.slug}`}
                      className="flex items-center gap-2.5 py-2.5 hover:bg-accent/40"
                    >
                      <PersonAvatar person={person} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {person.name}
                        </span>
                        <span className="block text-[11px] text-ink-3">
                          {DOMAIN_LABEL[person.domain]} · {sc.total} claims
                        </span>
                      </span>
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold tabular-nums",
                          accuracyTextClass(sc.accuracy),
                        )}
                      >
                        {sc.accuracy === null
                          ? "—"
                          : `${Math.round(sc.accuracy * 100)}%`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {mostFollowed && (
            <section>
              <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Most followed
              </h2>
              <div className="mt-3">
                {primaryStance(mostFollowed) && (
                  <PersonChip person={primaryStance(mostFollowed)!.person} size="sm" />
                )}
                <p className="mt-2 font-serif text-sm leading-snug">
                  <Link
                    href={`/claims/${mostFollowed.slug}`}
                    className="hover:underline underline-offset-2"
                  >
                    “
                    {(primaryStance(mostFollowed)?.quote ?? mostFollowed.statement).slice(0, 118)}
                    {(primaryStance(mostFollowed)?.quote ?? "").length > 118 ? "…" : ""}”
                  </Link>
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <FollowButton
                    target="proposition"
                    targetId={mostFollowed.id}
                    count={mostFollowed.followerCount}
                    initialFollowing={followedIds.has(mostFollowed.id)}
                    size="sm"
                  />
                  <StatusBadge status={mostFollowed.status} size="sm" />
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
