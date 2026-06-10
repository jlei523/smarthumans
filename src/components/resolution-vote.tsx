"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { certifyResolution, voteOnResolution } from "@/app/actions";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { ClaimStatus } from "@/db/schema";

export function ResolutionVoteWidget({
  proposal,
  locked,
  myVote = null,
}: {
  proposal: {
    id: number;
    proposedStatus: ClaimStatus;
    rationale: string;
    aiBrief: string | null;
    voteThreshold: number;
    agreeWeight: number;
    disagreeWeight: number;
    voterCount: number;
  };
  locked: boolean;
  /** the signed-in user's current vote, if any */
  myVote?: "agree" | "disagree" | null;
}) {
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const totalWeight = proposal.agreeWeight + proposal.disagreeWeight;
  const progress = Math.min(1, proposal.agreeWeight / proposal.voteThreshold);

  function vote(agree: boolean) {
    startTransition(async () => {
      const res = await voteOnResolution(proposal.id, agree, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      }
    });
  }

  function certify() {
    startTransition(async () => {
      const res = await certifyResolution(proposal.id, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      }
    });
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Resolution vote in progress</p>
        {locked && (
          <span className="text-xs text-muted-foreground">Resolution locked</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        Proposed verdict
        <StatusBadge status={proposal.proposedStatus} size="sm" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{proposal.rationale}</p>

      {proposal.aiBrief && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground">
            AI-assembled evidence brief — awaiting human verification
          </summary>
          <pre className="mt-2 whitespace-pre-wrap border-l pl-3 font-sans text-xs leading-relaxed text-muted-foreground">
            {proposal.aiBrief}
          </pre>
        </details>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>
            {proposal.agreeWeight} agree · {proposal.disagreeWeight} disagree (
            {proposal.voterCount} voters)
          </span>
          <span>threshold {proposal.voteThreshold}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-foreground"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Votes are weighted by reputation; the jury composition and full vote
          log are public in the audit trail.
          {totalWeight > 0 &&
            ` Current margin: ${Math.round((proposal.agreeWeight / totalWeight) * 100)}% agree.`}
          {proposal.agreeWeight >= proposal.voteThreshold &&
            " Threshold reached — awaiting jury certification."}
        </p>
      </div>

      {!locked && (
        <>
          <div className="mt-3 flex gap-2">
            <button
              disabled={pending}
              onClick={() => vote(true)}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                myVote === "agree"
                  ? "border-st-true text-st-true-tx"
                  : "hover:border-st-true hover:text-st-true-tx",
                pending && "opacity-60",
              )}
            >
              {myVote === "agree" ? "✓ You agreed" : "Agree with verdict"}
            </button>
            <button
              disabled={pending}
              onClick={() => vote(false)}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                myVote === "disagree"
                  ? "border-st-false text-st-false-tx"
                  : "hover:border-st-false hover:text-st-false-tx",
                pending && "opacity-60",
              )}
            >
              {myVote === "disagree" ? "✓ You disagreed" : "Disagree"}
            </button>
          </div>
          {myVote && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Your vote is recorded — pick the other option to change it.
            </p>
          )}
          {proposal.agreeWeight >= proposal.voteThreshold && (
            <button
              disabled={pending}
              onClick={certify}
              className="mt-2 w-full rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
            >
              Certify the verdict — apply{" "}
              {STATUS_META[proposal.proposedStatus].label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
