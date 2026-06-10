import {
  Clock,
  Check,
  CircleCheck,
  X,
  Undo2,
  CircleHelp,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { ClaimStatus } from "@/db/schema";

const ICONS = {
  clock: Clock,
  check: Check,
  halfCheck: CircleCheck,
  x: X,
  undo: Undo2,
  question: CircleHelp,
  scale: Scale,
} as const;

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: ClaimStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = ICONS[meta.icon];
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        meta.badge,
        size === "sm" && "px-1.5 py-0 text-[11px]",
        size === "md" && "px-2 py-0.5 text-xs",
        size === "lg" && "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "size-3" : size === "md" ? "size-3" : "size-4",
        )}
        strokeWidth={2.5}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}

export function StatusDot({
  status,
  className,
}: {
  status: ClaimStatus;
  className?: string;
}) {
  return (
    <span
      title={STATUS_META[status].label}
      className={cn(
        "inline-block size-2.5 rounded-full",
        STATUS_META[status].dot,
        status === "disputed" && "ring-1 ring-offset-1 ring-st-disputed",
        className,
      )}
    />
  );
}
