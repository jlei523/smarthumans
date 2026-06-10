import Link from "next/link";
import type { Metadata } from "next";
import { PersonChip } from "@/components/person-chip";
import { CategoryChip } from "@/components/claim-card";
import { FollowButton } from "@/components/follow-button";
import { StanceButtons } from "@/components/stance-buttons";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getFollowedPropositionIds,
  getResolvingSoon,
  getUserStanceMap,
  primaryStance,
} from "@/lib/queries";
import { fmtDate, deadlineLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Resolves soon",
  description: "Pending propositions nearest their resolution deadline.",
};

export const dynamic = "force-dynamic";

export default async function ResolvingSoonPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [claims, followedIds, stanceMap] = await Promise.all([
    getResolvingSoon(30),
    getFollowedPropositionIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-9 pb-20">
      <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
        Resolves soon
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">
        Approaching deadlines
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-3">
        Pending propositions nearest to their resolution deadline. Follow one
        to be notified the moment it&apos;s settled.
      </p>
      <div className="mt-7 grid gap-3">
        {claims.map((p) => {
          const first = primaryStance(p);
          return (
            <div
              key={p.id}
              className="relative flex items-center gap-4 rounded-[11px] border border-l-[3px] border-l-st-pending bg-card p-4 shadow-xs transition-shadow hover:shadow-md sm:gap-5"
            >
              <div className="w-[88px] shrink-0 text-center">
                <p className="font-meta text-[13px] font-semibold text-st-pending-tx">
                  {deadlineLabel(p.deadline)}
                </p>
                <p className="mt-0.5 text-[11px] italic text-ink-3">
                  {p.deadline ? fmtDate(p.deadline) : "no date"}
                </p>
              </div>
              <div className="min-w-0 flex-1 border-l pl-4 sm:pl-5">
                <p className="font-serif text-[16.5px] leading-snug">
                  <Link
                    href={`/claims/${p.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {p.statement}
                  </Link>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-ink-3">
                  {first && <PersonChip person={first.person} size="sm" />}
                  <CategoryChip category={p.category} />
                </div>
              </div>
              <div className="relative z-10 flex shrink-0 items-center gap-2">
                <StanceButtons propositionId={p.id} initial={stanceMap[p.id] ?? null} />
                <FollowButton
                  target="proposition"
                  targetId={p.id}
                  count={p.followerCount}
                  initialFollowing={followedIds.has(p.id)}
                />
              </div>
            </div>
          );
        })}
        {claims.length === 0 && (
          <p className="rounded-[14px] border border-dashed p-10 text-center text-sm text-ink-3">
            Nothing approaching a deadline right now.
          </p>
        )}
      </div>
    </div>
  );
}
