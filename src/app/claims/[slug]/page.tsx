import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/status-badge";
import { Section } from "@/components/section";
import { FollowButton } from "@/components/follow-button";
import { UserStanceWidget } from "@/components/user-stance-widget";
import { ResolutionVoteWidget } from "@/components/resolution-vote";
import { CommentsSection, type CommentView } from "@/components/comments-section";
import {
  getAllPeople,
  getClaim,
  getDomainRecords,
  getFollowedPropositionIds,
  getRelatedClaims,
  getStakedFromComments,
  primaryStance,
  type StanceWithPerson,
} from "@/lib/queries";
import {
  AddEvidenceForm,
  AddPositionForm,
  ProposeResolutionForm,
} from "@/components/contribute-forms";
import type { ClaimStatus, Stance } from "@/db/schema";
import { stanceOutcome, type StanceOutcome } from "@/lib/scoring";
import { STATUS_META, TYPE_LABEL, CATEGORY_LABEL } from "@/lib/status";
import { fmtCount, fmtDate, fmtDateLong, deadlineLabel } from "@/lib/format";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/*
 * Type scale (5 sizes, no exceptions):
 *   1. text-3xl — proposition headline (serif)
 *   2. text-xl  — hero blockquote (serif) + large stat numerals (mono)
 *   3. text-sm  — body: quotes in lists, rationale, rows
 *   4. text-xs  — metadata, small-caps section heads, labels
 *   5. text-5xl — (unused here; reserved)
 */

const STATUS_TEXT: Record<ClaimStatus, string> = {
  pending: "text-st-pending-tx",
  came_true: "text-st-true-tx",
  partly_true: "text-st-partly-tx",
  didnt_come_true: "text-st-false-tx",
  walked_back: "text-st-walked-tx",
  unverifiable: "text-st-unverifiable-tx",
  disputed: "text-st-disputed-tx",
};

const OUTCOME_TEXT: Record<StanceOutcome, { label: string; cls: string }> = {
  correct: { label: "✓ Right", cls: "text-st-true-tx" },
  incorrect: { label: "✗ Wrong", cls: "text-st-false-tx" },
  partly: { label: "◐ Partly", cls: "text-st-partly-tx" },
  walked_back: { label: "↩ Walked back", cls: "text-st-walked-tx" },
  pending: { label: "—", cls: "text-muted-foreground" },
  unverifiable: { label: "—", cls: "text-muted-foreground" },
  disputed: { label: "—", cls: "text-muted-foreground" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const claim = await getClaim(slug);
  if (!claim) return {};
  const title = claim.question || claim.statement;
  return {
    title: `${title} Verdict: ${STATUS_META[claim.status].label}`,
    description: claim.resolutionRationale ?? claim.resolutionCriteria,
    openGraph: { images: [`/api/og/claim/${claim.slug}`] },
  };
}

function SrcLink({ stance, label = "Source" }: { stance: Stance; label?: string }) {
  if (stance.quoteReported) {
    return (
      <>
        <span
          className="whitespace-nowrap text-xs italic text-st-partly-tx"
          title="No recording exists — quote corroborated by independent contemporaneous news reports"
        >
          quote reported, not primary-sourced
        </span>
        <a
          href={stance.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
        >
          Report 1 ↗
        </a>
        {stance.corroborationUrl && (
          <a
            href={stance.corroborationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
          >
            Report 2 ↗
          </a>
        )}
        {stance.sourceArchiveUrl && (
          <a
            href={stance.sourceArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            archived ↗
          </a>
        )}
      </>
    );
  }
  return (
    <>
      <a
        href={stance.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
      >
        {stance.sourceType === "broadcast" ? "Clip" : label}
        {stance.videoTimestamp ? ` @${stance.videoTimestamp}` : ""} ↗
      </a>
      {stance.sourceArchiveUrl && (
        <a
          href={stance.sourceArchiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          archived ↗
        </a>
      )}
    </>
  );
}

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claim = await getClaim(slug);
  if (!claim) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const [related, followedIds, allPeople, domainRecords, stakedFrom] =
    await Promise.all([
      getRelatedClaims(claim),
      getFollowedPropositionIds(session?.user?.id),
      getAllPeople(),
      getDomainRecords(claim.category),
      getStakedFromComments(claim.comments.map((c) => c.id)),
    ]);
  const stakedByComment = new Map(
    stakedFrom.map((p) => [p.sourceCommentId!, p]),
  );

  const first = primaryStance(claim);
  const affirmers = claim.stances.filter((s) => s.position === "affirm");
  const deniers = claim.stances.filter((s) => s.position === "deny");
  const supports = claim.evidence.filter((e) => e.side === "supports");
  const refutes = claim.evidence.filter((e) => e.side === "refutes");
  const isResolved = !["pending", "disputed"].includes(claim.status);

  const affirmCount = claim.userStances.filter((s) => s.position === "affirm").length;
  const denyCount = claim.userStances.filter((s) => s.position === "deny").length;
  const myStance = session?.user
    ? (claim.userStances.find((s) => s.userId === session.user.id)?.position ?? null)
    : null;

  const stanceByUser = new Map(claim.userStances.map((s) => [s.userId, s.position]));
  const commentViews: CommentView[] = claim.comments.map((c) => {
    const stance = stanceByUser.get(c.userId) ?? null;
    const calledIt =
      stance !== null && isResolved && stanceOutcome(claim.status, stance) === "correct";
    const myVote = session?.user
      ? ((c.votes.find((v) => v.userId === session.user.id)?.value ?? 0) as 1 | -1 | 0)
      : (0 as const);
    const domain = domainRecords[c.userId];
    const staked = stakedByComment.get(c.id);
    return {
      id: c.id,
      parentId: c.parentId,
      score: c.score,
      myVote,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      authorId: c.userId,
      authorName: c.user.name,
      authorReputation: c.user.reputation,
      // domain-scoped credential, never global karma
      authorDomain:
        domain && domain.resolved > 0
          ? {
              label: CATEGORY_LABEL[claim.category],
              resolved: domain.resolved,
              topPct: domain.topPct,
            }
          : null,
      stakedTo: staked
        ? { slug: staked.slug, statement: staked.statement, status: staked.status }
        : null,
      stance,
      calledIt,
    };
  });

  const openProposal = claim.proposals.find((p) => p.state === "open");

  // Community members merge into the positions ledger: each user with a
  // registered stance appears on their side, with their top comment (if any)
  // as the excerpt.
  const topCommentByUser = new Map<string, string>();
  for (const c of [...claim.comments].sort((a, b) => b.score - a.score)) {
    if (!c.parentId && !topCommentByUser.has(c.userId)) {
      topCommentByUser.set(c.userId, c.body);
    }
  }
  const communityFor = (side: "affirm" | "deny"): CommunityPosition[] =>
    claim.userStances
      .filter((s) => s.position === side)
      .map((s) => ({
        userId: s.userId,
        name: s.user.name,
        reputation: s.user.reputation,
        outcome: stanceOutcome(claim.status, s.position),
        comment: topCommentByUser.get(s.userId) ?? null,
        stakedAt: s.updatedAt.toISOString(),
        switchCount: s.switchCount,
      }))
      .sort(
        (a, b) =>
          Number(b.comment !== null) - Number(a.comment !== null) ||
          b.reputation - a.reputation,
      );

  // Follow + stance + share, merged into one quiet panel. Rendered in the
  // sidebar on desktop and inline after the verdict on small screens (where
  // the sidebar would otherwise land below the discussion thread).
  const actionPanel = (
    <div className="rounded-md border p-4">
      <FollowButton
        target="proposition"
        targetId={claim.id}
        count={claim.followerCount}
        initialFollowing={followedIds.has(claim.id)}
        size="lg"
        className="w-full justify-center"
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {fmtCount(claim.followerCount)} following — get notified when this
        resolves
      </p>

      <hr className="my-4 border-border" />

      <UserStanceWidget
        propositionId={claim.id}
        affirmCount={affirmCount}
        denyCount={denyCount}
        myPosition={myStance}
        resolved={isResolved}
        locked={!!openProposal}
        callsClosed={
          !!claim.deadline && new Date(claim.deadline) < new Date()
        }
      />

      <hr className="my-4 border-border" />

      <div className="space-y-1.5 text-xs">
        <a
          href={`/api/og/claim/${claim.slug}`}
          target="_blank"
          className="block text-muted-foreground hover:text-foreground"
        >
          Shareable verdict card ↗
        </a>
        {isResolved && claim.stances.length > 0 && (
          <Link
            href={`/scoreboard/${claim.slug}`}
            className="block text-muted-foreground hover:text-foreground"
          >
            Resolution-day scoreboard →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 overflow-hidden py-4 text-xs whitespace-nowrap text-muted-foreground">
        <Link href="/" className="shrink-0 hover:text-foreground">Home</Link>
        <span className="shrink-0">/</span>
        <Link
          href={`/browse/${claim.category}`}
          className="shrink-0 hover:text-foreground"
        >
          {CATEGORY_LABEL[claim.category]}
        </Link>
        <span className="shrink-0">/</span>
        <span className="truncate">{claim.question || claim.statement}</span>
      </nav>

      <div className="grid gap-12 pb-16 pt-2 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          {/* ----- the one hero: headline + quote ----- */}
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            {TYPE_LABEL[claim.claimType]} · {CATEGORY_LABEL[claim.category]}
            {claim.aiDrafted && <> · AI-drafted, human-verified</>}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight">
            {claim.statement}
          </h1>

          {first && (
            <figure className="mt-6 border-l-2 border-foreground pl-5">
              <blockquote className="font-serif text-xl italic leading-relaxed">
                “{first.quote}”
              </blockquote>
              <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <Link
                  href={`/p/${first.person.slug}`}
                  className="font-semibold text-foreground hover:underline underline-offset-2"
                >
                  {first.person.name}
                </Link>
                <span>· {fmtDateLong(first.dateStated)}</span>
                <span>· {first.venue}</span>
                <span>·</span>
                <SrcLink stance={first} />
              </figcaption>
            </figure>
          )}

          {/* ----- verdict (the only pill on the page) ----- */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusBadge status={claim.status} size="lg" />
            <span className="text-xs text-muted-foreground">
              {isResolved
                ? `resolved ${fmtDate(claim.resolvedAt)}`
                : `${deadlineLabel(claim.deadline)}${claim.deadline ? ` · deadline ${fmtDate(claim.deadline)}` : ""}`}
            </span>
          </div>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed">
            {claim.resolutionRationale ??
              (claim.status === "disputed"
                ? "An early resolution has been proposed and is under weighted community vote — see the resolution module below."
                : "This claim has not resolved yet. It will be scored against the resolution criteria.")}
          </p>
          <details className="mt-2 max-w-2xl">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground">
              Resolution criteria
            </summary>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {claim.resolutionCriteria}
            </p>
          </details>

          {/* action panel inline on small screens */}
          <div className="mt-8 lg:hidden">{actionPanel}</div>

          {/* ----- positions: figures + community, side by side ----- */}
          <Section title={isResolved ? "Who was right" : "Positions"}>
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <PositionList
                heading="Said it would happen"
                stances={affirmers}
                community={communityFor("affirm")}
                status={claim.status}
                isResolved={isResolved}
              />
              <PositionList
                heading="Said it wouldn't"
                stances={deniers}
                community={communityFor("deny")}
                status={claim.status}
                isResolved={isResolved}
              />
            </div>
            <div className="mt-5">
              <AddPositionForm
                propositionId={claim.id}
                propositionSlug={claim.slug}
                propositionStatement={claim.statement}
                people={allPeople.map((p) => ({
                  name: p.name,
                  domain: p.domain,
                  imageUrl: p.imageUrl,
                }))}
              />
            </div>
          </Section>

          {/* ----- evidence ----- */}
          <Section title="Evidence">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <EvidenceList heading="That it came true" items={supports} />
              <EvidenceList heading="That it didn't" items={refutes} />
            </div>
            <div className="mt-5">
              <AddEvidenceForm propositionId={claim.id} />
            </div>
          </Section>

          {/* ----- resolution (the one active zone keeps its box) ----- */}
          {!openProposal && !isResolved && (
            <Section title="Resolution">
              <ProposeResolutionForm propositionId={claim.id} />
            </Section>
          )}
          {openProposal && (
            <Section title="Resolution">
              <ResolutionVoteWidget
                locked={claim.resolutionLocked}
                myVote={
                  session?.user
                    ? (() => {
                        const v = openProposal.votes.find(
                          (x) => x.userId === session.user.id,
                        );
                        return v ? (v.agree ? "agree" : "disagree") : null;
                      })()
                    : null
                }
                proposal={{
                  id: openProposal.id,
                  proposedStatus: openProposal.proposedStatus,
                  rationale: openProposal.rationale,
                  aiBrief: openProposal.aiBrief,
                  voteThreshold: openProposal.voteThreshold,
                  agreeWeight: openProposal.votes
                    .filter((v) => v.agree)
                    .reduce((s, v) => s + v.weight, 0),
                  disagreeWeight: openProposal.votes
                    .filter((v) => !v.agree)
                    .reduce((s, v) => s + v.weight, 0),
                  voterCount: openProposal.votes.length,
                }}
              />
            </Section>
          )}

          {/* ----- audit trail ----- */}
          {claim.auditTrail.length > 0 && (
            <Section title="Audit trail">
              <ol className="divide-y">
                {claim.auditTrail.map((a) => (
                  <li key={a.id} className="py-3">
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(a.createdAt)} · {a.actor}
                    </p>
                    <p className="mt-1 text-sm">
                      {a.fromStatus && (
                        <>
                          <span className={cn("font-semibold", STATUS_TEXT[a.fromStatus])}>
                            {STATUS_META[a.fromStatus].label}
                          </span>
                          {" → "}
                        </>
                      )}
                      <span className={cn("font-semibold", STATUS_TEXT[a.toStatus])}>
                        {STATUS_META[a.toStatus].label}
                      </span>
                      <span className="text-muted-foreground"> — {a.rationale}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* ----- discussion ----- */}
          <div id="discussion" className="mt-12 scroll-mt-20">
            <CommentsSection
              propositionId={claim.id}
              comments={commentViews}
              resolved={isResolved}
              signedIn={!!session?.user}
            />
          </div>
        </main>

        {/* ----- sidebar: secondary by design ----- */}
        <aside>
          <div className="hidden lg:block">{actionPanel}</div>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="border-b pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Related claims
              </h2>
              <ul className="divide-y">
                {related.map((p) => {
                  const ps = primaryStance(p);
                  return (
                    <li key={p.id}>
                      <Link href={`/claims/${p.slug}`} className="group block py-3">
                        <p className="text-sm leading-snug line-clamp-2 group-hover:underline underline-offset-2">
                          {ps ? `“${ps.quote}”` : p.statement}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className={cn("font-semibold", STATUS_TEXT[p.status])}>
                            {STATUS_META[p.status].label}
                          </span>
                          {ps && <> · {ps.person.name}</>}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

type CommunityPosition = {
  userId: string;
  name: string;
  reputation: number;
  outcome: StanceOutcome;
  comment: string | null;
  stakedAt: string;
  switchCount: number;
};

function PositionList({
  heading,
  stances,
  community,
  status,
  isResolved,
}: {
  heading: string;
  stances: StanceWithPerson[];
  community: CommunityPosition[];
  status: ClaimStatus;
  isResolved: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{heading}</p>
      <ul className="mt-1 divide-y">
        {stances.map((s) => {
          const outcome = OUTCOME_TEXT[stanceOutcome(status, s.position)];
          return (
            <li key={s.id} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/p/${s.person.slug}`}
                  className="text-sm font-semibold hover:underline underline-offset-2"
                >
                  {s.person.name}
                </Link>
                {isResolved && (
                  <span className={cn("text-xs font-semibold whitespace-nowrap", outcome.cls)}>
                    {outcome.label}
                  </span>
                )}
              </div>
              <blockquote className="mt-1 font-serif text-sm italic leading-relaxed text-ink-2">
                “{s.quote}”
              </blockquote>
              <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span>{fmtDate(s.dateStated)}</span>
                <span>· {s.venue}</span>
                <span>·</span>
                <SrcLink stance={s} />
              </p>
            </li>
          );
        })}
        {stances.length === 0 && community.length === 0 && (
          <li className="py-3 text-xs text-muted-foreground">
            No recorded stances on this side yet.
          </li>
        )}
        {community.map((u) => {
          const outcome = OUTCOME_TEXT[u.outcome];
          return (
            <li key={u.userId} className="py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  <Link
                    href={`/u/${u.userId}`}
                    className="font-semibold text-foreground hover:underline underline-offset-2"
                  >
                    u/{u.name}
                  </Link>{" "}
                  · rep {fmtCount(u.reputation)} · staked {fmtDate(u.stakedAt)}
                  {u.switchCount > 0 && ` · switched ×${u.switchCount}`}
                </p>
                {isResolved && (
                  <span className={cn("text-xs font-semibold whitespace-nowrap", outcome.cls)}>
                    {outcome.label}
                  </span>
                )}
              </div>
              {u.comment && (
                <p className="mt-1 text-xs leading-relaxed text-ink-2 line-clamp-2">
                  {u.comment}{" "}
                  <a href="#discussion" className="text-muted-foreground hover:text-foreground">
                    — in discussion ↓
                  </a>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EvidenceList({
  heading,
  items,
}: {
  heading: string;
  items: Array<{
    id: number;
    title: string;
    sourceUrl: string;
    sourceName: string;
    aiDrafted: boolean;
  }>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{heading}</p>
      <ul className="mt-1 divide-y">
        {items.map((e) => (
          <li key={e.id} className="py-3">
            <a
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium leading-snug hover:underline underline-offset-2"
            >
              {e.title} ↗
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {e.sourceName}
              {e.aiDrafted && " · AI-found, human-verified"}
            </p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-3 text-xs text-muted-foreground">Nothing submitted yet.</li>
        )}
      </ul>
    </div>
  );
}
