import type { Metadata } from "next";
import { ClaimCard } from "@/components/claim-card";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getCommentCounts,
  getFollowedPropositionIds,
  getResolvingSoon,
  getUserStanceMap,
  primaryStance,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Resolves soon",
  description: "Pending propositions nearest their resolution deadline.",
};

export const dynamic = "force-dynamic";

export default async function ResolvingSoonPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [claims, commentCounts, followedIds, stanceMap] = await Promise.all([
    getResolvingSoon(30),
    getCommentCounts(),
    getFollowedPropositionIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-9 pb-20">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Resolves soon
      </h1>
      <div className="mt-6 grid gap-3">
        {claims.map((p) => (
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
        {claims.length === 0 && (
          <p className="rounded-[14px] border border-dashed p-10 text-center text-sm text-ink-3">
            Nothing approaching a deadline right now.
          </p>
        )}
      </div>
    </div>
  );
}
