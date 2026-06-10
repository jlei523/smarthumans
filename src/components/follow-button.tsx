"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtCount } from "@/lib/format";
import {
  toggleFollowPerson,
  toggleFollowProposition,
} from "@/app/actions";

export function FollowButton({
  target,
  targetId,
  count,
  initialFollowing = false,
  size = "md",
  className,
}: {
  target: "proposition" | "person";
  targetId: number;
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
      const fn =
        target === "proposition" ? toggleFollowProposition : toggleFollowPerson;
      const res = await fn(targetId, pathname);
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

  const Icon = following ? Check : Plus;
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title={
        target === "proposition"
          ? "Follow — get notified when this resolves"
          : "Follow this person"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card font-medium shadow-xs transition-colors tabular-nums",
        following
          ? "border-foreground bg-foreground text-background"
          : "text-ink-2 hover:border-ink-3 hover:text-foreground",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
        pending && "opacity-60",
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} strokeWidth={2.5} />
      {size !== "sm" && (following ? "Following" : "Follow")}
      <span className="font-mono">{fmtCount(optimisticCount)}</span>
    </button>
  );
}
