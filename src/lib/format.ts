import {
  format,
  differenceInCalendarDays,
  formatDistanceToNowStrict,
  parseISO,
} from "date-fns";

/** Reddit-style relative timestamp: "2d ago", "3mo ago". */
export function timeAgo(d: string | Date): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return formatDistanceToNowStrict(date, { addSuffix: true })
    .replace(" seconds", "s")
    .replace(" second", "s")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", "mo")
    .replace(" month", "mo")
    .replace(" years", "y")
    .replace(" year", "y");
}

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "MMM d, yyyy");
}

export function fmtDateLong(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "MMMM d, yyyy");
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  return differenceInCalendarDays(parseISO(deadline), new Date());
}

export function deadlineLabel(deadline: string | null): string {
  if (!deadline) return "resolves on event";
  const days = daysUntil(deadline);
  if (days === null) return "resolves on event";
  if (days < 0) return `deadline passed ${fmtDate(deadline)}`;
  if (days === 0) return "resolves today";
  if (days < 60) return `resolves in ${days} d`;
  if (days < 720) return `resolves in ${Math.round(days / 30)} mo`;
  return `resolves in ${(days / 365).toFixed(1)} yr`;
}

/** Compact remainder for the pending badge ("7 mo", "51 d"); null = no clock. */
export function deadlineCompact(deadline: string | null): string | null {
  const days = daysUntil(deadline);
  if (days === null) return null;
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days < 60) return `${days} d`;
  if (days < 720) return `${Math.round(days / 30)} mo`;
  return `${(days / 365).toFixed(1)} yr`;
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
