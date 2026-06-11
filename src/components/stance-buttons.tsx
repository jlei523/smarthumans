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

/**
 * Compact take-a-side control for claim cards. One tap, no friction:
 * signed-out stakes are kept locally and migrate on sign-in. After the
 * third anonymous call, a quiet "save your record" nudge appears.
 */
export function StanceButtons({
  propositionId,
  initial = null,
  className,
}: {
  propositionId: number;
  initial?: "affirm" | "deny" | null;
  className?: string;
}) {
  const { data: session, isPending: sessionLoading } = useSession();
  const signedIn = !!session?.user;
  const [mine, setMine] = useState<"affirm" | "deny" | null>(initial);
  const [confirmSwitch, setConfirmSwitch] = useState<"affirm" | "deny" | null>(null);
  const [nudge, setNudge] = useState(false);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();

  // hydrate anonymous stake after mount (localStorage isn't SSR-visible)
  useEffect(() => {
    if (!sessionLoading && !signedIn) {
      setMine(getAnonStake(propositionId));
      setNudge(anonStakeCount() >= 3);
    }
  }, [sessionLoading, signedIn, propositionId]);

  function take(position: "affirm" | "deny", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (mine !== null && mine !== position && confirmSwitch !== position) {
      setConfirmSwitch(position);
      setTimeout(() => setConfirmSwitch(null), 2500);
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
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {nudge && !signedIn && (
        <Link
          href={`/sign-in?next=${encodeURIComponent(pathname)}`}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 text-[11px] font-medium text-st-pending-tx underline decoration-border underline-offset-2 hover:decoration-current whitespace-nowrap"
        >
          Save your record →
        </Link>
      )}
      <span
        className={cn(
          "inline-flex items-center overflow-hidden rounded-full border bg-card text-xs font-medium shadow-xs",
          pending && "opacity-60",
        )}
        title="Your call on this claim — scored on resolution, feeds your track record"
      >
        <span className="pl-2.5 pr-1 text-[11px] text-ink-3 whitespace-nowrap @max-[26rem]:hidden">
          Your call
        </span>
        <button
          onClick={(e) => take("affirm", e)}
          disabled={pending}
          className={cn(
            "px-3 py-[5px] text-xs font-semibold transition-colors",
            mine === "affirm"
              ? "bg-st-true-bg text-st-true-tx hover:bg-st-true-bg/70"
              : "text-ink-3 hover:bg-paper-2 hover:text-st-true-tx",
          )}
        >
          {confirmSwitch === "affirm" ? "Sure?" : "Yes"}
        </button>
        <span className="h-4 w-px bg-border" />
        <button
          onClick={(e) => take("deny", e)}
          disabled={pending}
          className={cn(
            "px-3 py-[5px] text-xs font-semibold transition-colors",
            mine === "deny"
              ? "bg-st-false-bg text-st-false-tx hover:bg-st-false-bg/70"
              : "text-ink-3 hover:bg-paper-2 hover:text-st-false-tx",
          )}
        >
          {confirmSwitch === "deny" ? "Sure?" : "No"}
        </button>
      </span>
    </span>
  );
}
