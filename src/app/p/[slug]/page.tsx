import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftRight, Share2, TrendingDown, TrendingUp } from "lucide-react";
import { PersonAvatar } from "@/components/person-chip";
import { FollowButton } from "@/components/follow-button";
import { ScoreGauge, DistributionBar, Sparkline } from "@/components/charts";
import { ClaimLedger } from "@/components/claim-ledger";
import { StatusBadge } from "@/components/status-badge";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getAllPeople,
  getFollowedPersonIds,
  getFollowedPropositionIds,
  getHeadToHead,
  getPersonScore,
  getUserStanceMap,
} from "@/lib/queries";
import { CATEGORY_LABEL, DOMAIN_LABEL } from "@/lib/status";
import { pct } from "@/lib/format";
import { MIN_RESOLVED_FOR_SCORE } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const score = await getPersonScore(slug);
  if (!score) return {};
  const { person, scorecard } = score;
  return {
    title: `${person.name} — track record`,
    description: `${person.name}'s prediction & promise scorecard: ${scorecard.correct} came true, ${scorecard.incorrect} didn't, out of ${scorecard.resolved} resolved claims.`,
    openGraph: {
      images: [`/api/og/person/${person.slug}`],
    },
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const [score, followedProps, followedPeople, stanceMap] = await Promise.all([
    getPersonScore(slug),
    getFollowedPropositionIds(session?.user?.id),
    getFollowedPersonIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
  ]);
  if (!score) notFound();
  const h2h = session?.user
    ? await getHeadToHead(session.user.id, score.person.id)
    : null;

  const {
    person,
    scorecard,
    ledger,
    categoryBreakdown,
    accuracySeries,
    notableHit,
    notableMiss,
  } = score;
  const others = (await getAllPeople()).filter((p) => p.id !== person.id);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Breadcrumb */}
      <nav className="py-3 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/leaderboards" className="hover:text-foreground">People</Link>
        {" / "}
        <span className="text-foreground">{person.name}</span>
      </nav>

      {/* Hero */}
      <header className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start">
        <PersonAvatar person={person} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold tracking-tight">
              {person.name}
            </h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {DOMAIN_LABEL[person.domain]}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {person.title}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {person.bio}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FollowButton
              target="person"
              targetId={person.id}
              count={person.followerCount}
              initialFollowing={followedPeople.has(person.id)}
              size="lg"
            />
            <a
              href={`/api/og/person/${person.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              <Share2 className="size-4" /> Share scorecard
            </a>
            {others[0] && (
              <Link
                href={`/compare?a=${person.slug}&b=${others[0].slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <ArrowLeftRight className="size-4" /> Compare
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Scorecard panel */}
      <section className="grid gap-6 border-b py-6 lg:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col items-center gap-1">
          {scorecard.hasEnoughData ? (
            <ScoreGauge
              accuracy={scorecard.accuracy}
              resolved={scorecard.resolved}
            />
          ) : (
            <div className="flex h-full w-44 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
              <p className="font-mono text-2xl text-muted-foreground">—</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Not enough data to score ({scorecard.resolved} of{" "}
                {MIN_RESOLVED_FOR_SCORE} resolved claims needed)
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Full record{" "}
            <span className="font-normal text-muted-foreground">
              ({scorecard.total} claims tracked)
            </span>
          </p>
          <DistributionBar scorecard={scorecard} className="mt-2" />
          <div className="spark-block mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Accuracy over time</p>
            <Sparkline series={accuracySeries} className="mt-1.5" />
          </div>
        </div>

        {/* Category breakdown */}
        <div className="lg:w-72">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">By category</p>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {categoryBreakdown.map(({ category, scorecard: sc }) => (
                <tr key={category} className="border-b last:border-0">
                  <td className="py-1.5 pr-2 text-muted-foreground">
                    {CATEGORY_LABEL[category]}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-xs tabular-nums text-muted-foreground">
                    {sc.resolved > 0 ? `${sc.resolved} resolved` : `${sc.total} open`}
                  </td>
                  <td className="py-1.5 text-right font-mono font-medium tabular-nums">
                    {sc.accuracy === null ? "—" : pct(sc.accuracy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notable calls */}
      {(notableHit || notableMiss) && (
        <section className="grid gap-3 border-b py-6 md:grid-cols-2">
          {notableHit && (
            <NotableCall
              icon={<TrendingUp className="size-4 text-st-true" />}
              label="Biggest correct call"
              entry={notableHit}
            />
          )}
          {notableMiss && (
            <NotableCall
              icon={<TrendingDown className="size-4 text-st-false" />}
              label="Biggest miss"
              entry={notableMiss}
            />
          )}
        </section>
      )}

      {/* You vs them */}
      {h2h && (
        <section className="border-b py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {h2h.shared > 0 ? (
              <p className="text-sm leading-relaxed">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  You vs {person.name}
                </span>{" "}
                <span className="ml-2">
                  {h2h.me > h2h.them ? (
                    <>
                      You&apos;re ahead — right on{" "}
                      <b className="font-mono tabular-nums">{h2h.me}</b> of{" "}
                      {h2h.shared} shared calls vs their{" "}
                      <b className="font-mono tabular-nums">{h2h.them}</b>.
                    </>
                  ) : h2h.me === h2h.them ? (
                    <>
                      Dead even — you&apos;re both right on{" "}
                      <b className="font-mono tabular-nums">{h2h.me}</b> of{" "}
                      {h2h.shared} shared calls.
                    </>
                  ) : (
                    <>
                      {person.name} leads — right on{" "}
                      <b className="font-mono tabular-nums">{h2h.them}</b> of{" "}
                      {h2h.shared} shared calls vs your{" "}
                      <b className="font-mono tabular-nums">{h2h.me}</b>.
                    </>
                  )}
                  {h2h.open > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      {h2h.open} still open.
                    </span>
                  )}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                  You vs {person.name}
                </span>{" "}
                <span className="ml-2">
                  Take a side on claims {person.name.split(" ")[0]} has called
                  to start a head-to-head record.
                </span>
              </p>
            )}
            {h2h.shared > 0 && (
              <a
                href={`/api/og/h2h/${person.slug}`}
                target="_blank"
                className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                Shareable card ↗
              </a>
            )}
          </div>
        </section>
      )}

      {/* Ledger */}
      <section className="py-6">
        <h2 className="mb-4 border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Claim ledger</h2>
        <ClaimLedger
          entries={ledger.map(({ proposition, stance }) => ({
            proposition,
            stance,
            following: followedProps.has(proposition.id),
            myStance: stanceMap[proposition.id] ?? null,
          }))}
          person={person}
        />
      </section>
    </div>
  );
}

function NotableCall({
  icon,
  label,
  entry,
}: {
  icon: React.ReactNode;
  label: string;
  entry: {
    proposition: { slug: string; statement: string; status: "pending" | "came_true" | "partly_true" | "didnt_come_true" | "walked_back" | "unverifiable" | "disputed"; followerCount: number };
    stance: { quote: string };
  };
}) {
  return (
    <Link
      href={`/claims/${entry.proposition.slug}`}
      className="group rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
    >
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-serif font-semibold leading-snug group-hover:underline underline-offset-2">
        {entry.proposition.statement}
      </p>
      <div className="mt-2">
        <StatusBadge status={entry.proposition.status} size="sm" />
      </div>
    </Link>
  );
}
