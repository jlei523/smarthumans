import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClaimCard } from "@/components/claim-card";
import { PersonChip, PersonAvatar } from "@/components/person-chip";
import {
  DistributionBar,
  ScoreGauge,
  accuracyTextClass,
} from "@/components/charts";
import { StatusBadge, StatusDot } from "@/components/status-badge";
import { FollowButton } from "@/components/follow-button";
import { TopicGlyph } from "@/components/topic-glyph";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getFollowedPropositionIds,
  getTopicData,
  getUserStanceMap,
  primaryStance,
} from "@/lib/queries";
import { TOPIC_BLURBS } from "@/lib/topics";
import { CATEGORY_LABEL, DOMAIN_LABEL, STATUS_META, STATUS_ORDER } from "@/lib/status";
import { categoryEnum, type Category, type ClaimStatus } from "@/db/schema";
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

const SORTS = [
  { key: "followers", label: "Most followed" },
  { key: "newest", label: "Newest" },
  { key: "deadline", label: "Deadline" },
] as const;

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const { category } = await params;
  const { status: statusFilter, sort = "followers" } = await searchParams;
  if (!categoryEnum.enumValues.includes(category as Category)) notFound();
  const cat = category as Category;
  const session = await auth.api.getSession({ headers: await headers() });
  const [{ claims, scorecard, topForecasters, mostFollowed }, followedIds, stanceMap] =
    await Promise.all([
      getTopicData(cat),
      getFollowedPropositionIds(session?.user?.id),
      getUserStanceMap(session?.user?.id),
    ]);

  const statusCounts = new Map<ClaimStatus, number>();
  for (const c of claims) {
    statusCounts.set(c.status, (statusCounts.get(c.status) ?? 0) + 1);
  }
  const shown = (
    statusFilter ? claims.filter((c) => c.status === statusFilter) : claims
  ).sort((a, b) => {
    if (sort === "newest") {
      const da = primaryStance(a)?.dateStated ?? "0000";
      const db = primaryStance(b)?.dateStated ?? "0000";
      return db.localeCompare(da);
    }
    if (sort === "deadline") {
      return (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31");
    }
    return b.followerCount - a.followerCount;
  });

  const qs = (next: { status?: string | null; sort?: string | null }) => {
    const p = new URLSearchParams();
    const st = next.status === undefined ? statusFilter : next.status;
    const so = next.sort === undefined ? sort : next.sort;
    if (st) p.set("status", st);
    if (so && so !== "followers") p.set("sort", so);
    const str = p.toString();
    return `/browse/${cat}${str ? `?${str}` : ""}`;
  };

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
        {/* ----- main: the claims, with sort + filter ----- */}
        <main className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                href={qs({ status: null })}
                active={!statusFilter}
                label="All"
                count={claims.length}
              />
              {STATUS_ORDER.filter((st) => (statusCounts.get(st) ?? 0) > 0).map(
                (st) => (
                  <FilterPill
                    key={st}
                    href={qs({ status: statusFilter === st ? null : st })}
                    active={statusFilter === st}
                    label={STATUS_META[st].shortLabel}
                    count={statusCounts.get(st)!}
                    dot={st}
                  />
                ),
              )}
            </div>
            <div className="flex gap-3 text-xs">
              {SORTS.map((so) => (
                <Link
                  key={so.key}
                  href={qs({ sort: so.key })}
                  className={cn(
                    sort === so.key
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {so.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {shown.map((p) => (
              <ClaimCard
                key={p.id}
                proposition={p}
                stance={primaryStance(p)}
                following={followedIds.has(p.id)}
                myStance={stanceMap[p.id] ?? null}
              />
            ))}
            {shown.length === 0 && (
              <p className="rounded-lg border bg-card p-6 text-center text-sm text-ink-3">
                No claims match this filter.
              </p>
            )}
          </div>
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

function FilterPill({
  href,
  active,
  label,
  count,
  dot,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  dot?: ClaimStatus;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card text-ink-2 hover:border-ink-3 hover:text-foreground",
      )}
    >
      {dot && <StatusDot status={dot} className="size-2" />}
      {label}
      <span className="font-mono opacity-70">{count}</span>
    </Link>
  );
}
