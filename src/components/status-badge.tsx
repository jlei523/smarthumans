import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { ClaimStatus } from "@/db/schema";

/** Tinted label-only verdict pill — the tint never carries meaning alone. */
export function StatusBadge({
  status,
  size = "md",
  detail,
  className,
}: {
  status: ClaimStatus;
  size?: "sm" | "md" | "lg";
  /** countdown remainder rendered after a divider ("7 mo") */
  detail?: string | null;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center rounded-md border font-semibold whitespace-nowrap",
        meta.badge,
        size === "sm" && "px-1.5 py-0 text-[11px]",
        size === "md" && "px-[9px] py-[5px] text-xs",
        size === "lg" && "px-3 py-1 text-sm",
        detail != null && "gap-1.5",
        className,
      )}
    >
      {/* short label inside narrow @container cards; full label everywhere else */}
      <span className="@max-[26rem]:hidden">{meta.label}</span>
      <span className="hidden @max-[26rem]:inline">{meta.shortLabel}</span>
      {detail != null && (
        <>
          <span aria-hidden className="h-3 w-px self-center bg-current opacity-25" />
          <span className="font-mono font-medium">{detail}</span>
        </>
      )}
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
