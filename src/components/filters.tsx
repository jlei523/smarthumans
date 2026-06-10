import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/status-badge";
import type { ClaimStatus } from "@/db/schema";

/**
 * The site-wide filter language. Every page speaks it the same way:
 *  - a FILTER is a pill — optional status dot, mono count, solid when active
 *  - a SORT is a text link — semibold ink when active
 *  - a VIEW SWITCH is a boxed segmented control
 * Server pages pass `href` (URL-driven); client components pass `onClick`.
 */

/** Reddit-style rolling date windows over when the claim was stated. */
export const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
] as const;
export type DateRange = (typeof DATE_RANGES)[number]["key"];

const RANGE_DAYS: Record<Exclude<DateRange, "all">, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

export function inDateRange(
  dateISO: string | null | undefined,
  range: DateRange,
): boolean {
  if (range === "all") return true;
  if (!dateISO) return false;
  const cutoff = new Date(Date.now() - RANGE_DAYS[range] * 86400_000)
    .toISOString()
    .slice(0, 10);
  return dateISO.slice(0, 10) >= cutoff;
}


/** Pills on the left, sort/view controls on the right, hairline below. */
export function FilterBar({
  children,
  end,
  className,
}: {
  children: React.ReactNode;
  end?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      {end && <div className="flex flex-wrap items-center gap-3">{end}</div>}
    </div>
  );
}

export function FilterPill({
  href,
  onClick,
  active,
  label,
  count,
  dot,
  title,
}: {
  href?: string;
  onClick?: () => void;
  active: boolean;
  label: string;
  count?: number;
  dot?: ClaimStatus;
  title?: string;
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
    active
      ? "border-foreground bg-foreground text-background"
      : "bg-card text-ink-2 hover:border-ink-3 hover:text-foreground",
  );
  const inner = (
    <>
      {dot && <StatusDot status={dot} className="size-2" />}
      {label}
      {count !== undefined && (
        <span className="font-mono tabular-nums opacity-70">{count}</span>
      )}
    </>
  );
  if (href !== undefined) {
    return (
      <Link href={href} title={title} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} title={title} className={cls}>
      {inner}
    </button>
  );
}

export function SortGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs", className)}>
      {children}
    </div>
  );
}

export function SortLink({
  href,
  onClick,
  active,
  label,
}: {
  href?: string;
  onClick?: () => void;
  active: boolean;
  label: string;
}) {
  const cls = cn(
    "transition-colors",
    active
      ? "font-semibold text-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
  if (href !== undefined) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  );
}

/** Boxed segmented control for switching views (boards, list/timeline). */
export function SegTabs({
  tabs,
  className,
}: {
  tabs: Array<{
    key: string;
    label: React.ReactNode;
    active: boolean;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-[9px] border bg-paper-2 p-[3px]",
        className,
      )}
    >
      {tabs.map((t) => {
        const cls = cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium",
          t.active
            ? "bg-card text-foreground shadow-xs"
            : "text-ink-2 hover:text-foreground",
        );
        return t.href !== undefined ? (
          <Link key={t.key} href={t.href} className={cls}>
            {t.label}
          </Link>
        ) : (
          <button key={t.key} type="button" onClick={t.onClick} className={cls}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
