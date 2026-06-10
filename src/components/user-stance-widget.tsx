"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { setUserStance } from "@/app/actions";
import {
  anonStakeCount,
  getAnonStake,
  toggleAnonStake,
} from "@/lib/anon-stakes";
import { useSession } from "@/lib/auth-client";
import { fmtCount, pct } from "@/lib/format";

/**
 * Stake-before-reveal: the community split stays hidden until you commit
 * to a side. Works signed-out (stakes kept locally, migrated on sign-in).
 */
export function UserStanceWidget({
  propositionId,
  affirmCount,
  denyCount,
  myPosition,
  resolved,
  locked = false,
  callsClosed = false,
}: {
  propositionId: number;
  affirmCount: number;
  denyCount: number;
  myPosition: "affirm" | "deny" | null;
  resolved: boolean;
  /** a resolution vote is open — calls are frozen */
  locked?: boolean;
  /** the deadline passed — no new positions, no switches */
  callsClosed?: boolean;
}) {
  const { data: session, isPending: sessionLoading } = useSession();
  const signedIn = !!session?.user;
  const [mine, setMine] = useState<"affirm" | "deny" | null>(myPosition);
  const [confirmSwitch, setConfirmSwitch] = useState<"affirm" | "deny" | null>(null);
  const [nudge, setNudge] = useState(false);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const total = affirmCount + denyCount;
  const committed = mine !== null;

  useEffect(() => {
    if (!sessionLoading && !signedIn && !resolved) {
      setMine(getAnonStake(propositionId));
      setNudge(anonStakeCount() >= 3);
    }
  }, [sessionLoading, signedIn, propositionId, resolved]);

  const frozen = locked || callsClosed;

  function take(position: "affirm" | "deny") {
    if (frozen) return;
    // switching sides is on the record and resets your contrarian
    // baseline — require a confirming second tap
    if (mine !== null && mine !== position && confirmSwitch !== position) {
      setConfirmSwitch(position);
      return;
    }
    setConfirmSwitch(null);
    if (!signedIn) {
      const next = toggleAnonStake(propositionId, position);
      setMine(next);
      setNudge(anonStakeCount() >= 3);
      return;
    }
    const next = mine === position ? null : position;
    startTransition(async () => {
      const res = await setUserStance(propositionId, position, pathname);
      if (res.ok) setMine(next);
    });
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {resolved ? "Where users stood" : "Make your call"}
      </p>
      {!resolved && (
        <div className="mt-2.5 flex gap-2">
          <button
            disabled={pending || frozen}
            onClick={() => take("affirm")}
            className={cn(
              "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              mine === "affirm"
                ? "border-st-true bg-st-true-bg text-st-true-tx"
                : "text-ink-2 hover:border-st-true hover:text-st-true-tx",
              frozen && "cursor-not-allowed opacity-50",
            )}
          >
            {confirmSwitch === "affirm" ? "Confirm switch?" : "Will happen"}
          </button>
          <button
            disabled={pending || frozen}
            onClick={() => take("deny")}
            className={cn(
              "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              mine === "deny"
                ? "border-st-false bg-st-false-bg text-st-false-tx"
                : "text-ink-2 hover:border-st-false hover:text-st-false-tx",
              frozen && "cursor-not-allowed opacity-50",
            )}
          >
            {confirmSwitch === "deny" ? "Confirm switch?" : "Won't happen"}
          </button>
        </div>
      )}
      {!resolved && locked && (
        <p className="mt-2 text-xs text-muted-foreground">
          Calls are frozen while the resolution vote is open.
        </p>
      )}
      {!resolved && !locked && callsClosed && (
        <p className="mt-2 text-xs text-muted-foreground">
          The deadline has passed — calls closed while resolution is pending.
        </p>
      )}
      {!resolved && !frozen && confirmSwitch !== null && (
        <p className="mt-2 text-xs text-st-partly-tx">
          Switching resets your contrarian baseline to today's split and is
          counted on your record. Tap again to confirm.
        </p>
      )}

      {/* the split is the reward for committing */}
      {resolved || committed ? (
        total > 0 ? (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-mono text-xl font-semibold text-foreground tabular-nums">
                {pct(affirmCount / total)}
              </span>{" "}
              of {fmtCount(total)} users say{resolved ? " it would" : " it'll"}{" "}
              happen
            </p>
          </div>
        ) : (
          <p className="mt-2.5 text-xs text-muted-foreground">
            {resolved
              ? "No user stances were registered before this resolved."
              : "You're first on the record — the split shows as others commit."}
          </p>
        )
      ) : (
        <p className="mt-2.5 text-xs text-muted-foreground">
          Commit to see where the community stands.
        </p>
      )}

      {!resolved && nudge && !signedIn && (
        <p className="mt-2 text-xs">
          <Link
            href={`/sign-in?next=${encodeURIComponent(pathname)}`}
            className="font-medium text-st-pending-tx underline decoration-border underline-offset-2 hover:decoration-current"
          >
            You've made {anonStakeCount()} calls — sign up to save your record →
          </Link>
        </p>
      )}
      {!resolved && committed && (
        <p className="mt-2 text-xs text-muted-foreground">
          Scored at resolution — contrarian calls that land pay more.
        </p>
      )}
    </div>
  );
}
