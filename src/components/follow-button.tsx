"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { fmtCount } from "@/lib/format";
import {
  toggleFollowPerson,
  toggleFollowProposition,
  toggleFollowTopic,
  toggleFollowUser,
} from "@/app/actions";
import type { Category } from "@/db/schema";

export function FollowButton({
  target,
  targetId,
  count,
  initialFollowing = false,
  size = "md",
  className,
}: {
  target: "proposition" | "person" | "topic" | "user";
  /** numeric id for propositions/people, category key for topics, user id for users */
  targetId: number | Category | string;
  count: number;
  /** server-known follow state for the signed-in user */
  initialFollowing?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);
  const [optimisticCount, setOptimisticCount] = useState(count);
  const pathname = usePathname();
  const router = useRouter();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res =
        target === "topic"
          ? await toggleFollowTopic(targetId as Category, pathname)
          : target === "proposition"
            ? await toggleFollowProposition(targetId as number, pathname)
            : target === "user"
              ? await toggleFollowUser(String(targetId), pathname)
              : await toggleFollowPerson(targetId as number, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (res.ok && "following" in res) {
        setFollowing(!!res.following);
        setOptimisticCount((c) => c + (res.following ? 1 : -1));
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      title={
        target === "proposition"
          ? "Follow — get notified when this resolves"
          : target === "topic"
            ? "Follow this topic — its claims lead your homepage"
            : target === "user"
              ? "Follow this member — their stakes and submissions in your feed"
              : "Follow this person"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-input bg-card font-semibold shadow-xs transition-colors tabular-nums",
        following
          ? "border-foreground bg-foreground text-background hover:border-ink-2 hover:bg-ink-2"
          : "text-ink-2 hover:border-ink-3 hover:text-foreground",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-[11px] py-[5px] text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
        pending && "opacity-60",
        className,
      )}
    >
      {!following && <span aria-hidden>+</span>}
      {size !== "sm" && (following ? "Following" : "Follow")}
      <span className="font-mono text-[11.5px] opacity-75">
        {fmtCount(optimisticCount)}
      </span>
    </button>
  );
}
