import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { propositionFollows } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  getRecentlyResolved,
  getResolvingSoon,
  getSmartestUsers,
  getUserScore,
  paydayOf,
} from "@/lib/queries";
import { topPercent, currentSeason } from "@/lib/gamification";
import { StatusBadge } from "@/components/status-badge";
import { Clock } from "lucide-react";
import { fmtDate, deadlineLabel } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;
  const [resolved, soon, session] = await Promise.all([
    getRecentlyResolved(5),
    getResolvingSoon(4),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const me = session?.user ? await getUserScore(session.user.id) : null;
  const payday = me ? paydayOf(me) : null;
  let pctile: number | null = null;
  if (me && me.seasonPoints > 0) {
    const all = await getSmartestUsers();
    pctile = topPercent(me.seasonPoints, all.map((u) => u.seasonPoints));
  }

  const followedIds = new Set<number>();
  if (session?.user) {
    const rows = await db.query.propositionFollows.findMany({
      where: eq(propositionFollows.userId, session.user.id),
    });
    rows.forEach((r) => followedIds.add(r.propositionId));
  }

  type Notif = {
    kind: "resolved" | "deadline";
    slug: string;
    title: string;
    status: (typeof resolved)[number]["status"];
    when: string;
    deadline: string | null;
    followed: boolean;
  };
  const notifs: Notif[] = [
    ...resolved.map((p) => ({
      kind: "resolved" as const,
      slug: p.slug,
      title: p.statement,
      status: p.status,
      when: p.resolvedAt!.toISOString(),
      deadline: p.deadline,
      followed: followedIds.has(p.id),
    })),
    ...soon.map((p) => ({
      kind: "deadline" as const,
      slug: p.slug,
      title: p.statement,
      status: p.status,
      when: p.deadline ?? "",
      deadline: p.deadline,
      followed: followedIds.has(p.id),
    })),
  ].sort(
    (a, b) =>
      Number(b.followed) - Number(a.followed) || b.when.localeCompare(a.when),
  );

  const shown = notifs.filter((n) => tab === "all" || n.followed);

  return (
    <div className="mx-auto max-w-3xl px-4 py-9 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Notifications
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Resolution alerts
          </h1>
        </div>
        <Link
          href="/digest"
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          View weekly digest →
        </Link>
      </div>

      {payday && payday.settled.length > 0 && (
        <div className="mt-6 rounded-md border p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Your week settled
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {payday.settled.length} of your calls resolved this week. You went{" "}
            <span className="font-semibold">
              {payday.wins}-for-{payday.settled.length}
            </span>
            {payday.partly > 0 && ` (${payday.partly} partly)`} and earned{" "}
            <span className="font-mono text-base font-semibold text-st-partly-tx tabular-nums">
              +{payday.pointsEarned}
            </span>{" "}
            points
            {pctile !== null && (
              <> — top {pctile}% this season ({currentSeason()})</>
            )}
            .
          </p>
        </div>
      )}

      <div className="mt-5 inline-flex rounded-[9px] border bg-paper-2 p-[3px]">
        {(
          [
            { k: "all", label: "All", href: "/notifications" },
            { k: "following", label: "Claims I follow", href: "/notifications?tab=following" },
          ] as const
        ).map((t) => (
          <Link
            key={t.k}
            href={t.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-[12.5px] font-medium",
              tab === t.k ? "bg-card text-foreground shadow-xs" : "text-ink-2 hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-[14px] border bg-card">
        {shown.map((n, i) => (
          <Link
            key={`${n.slug}-${n.kind}`}
            href={`/claims/${n.slug}`}
            className={cn(
              "flex items-start gap-3.5 px-[18px] py-[15px] hover:bg-accent/50",
              i > 0 && "border-t",
            )}
          >
            <span className="mt-0.5 flex shrink-0">
              {n.kind === "resolved" ? (
                <StatusBadge status={n.status} size="sm" />
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-st-pending-bg px-2 py-0.5 text-[11px] font-medium text-st-pending-tx">
                  <Clock className="size-3" />
                  {deadlineLabel(n.deadline)}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-relaxed">
                {n.kind === "resolved" ? (
                  <>
                    Resolved <b>{STATUS_META[n.status].label}</b> — “{n.title}”
                  </>
                ) : (
                  <>Deadline approaching — “{n.title}”</>
                )}
              </span>
              <span className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-3">
                {n.followed && (
                  <span className="rounded-[5px] border px-1.5 py-px font-medium">
                    following
                  </span>
                )}
                <span className="font-meta">{fmtDate(n.when)}</span>
              </span>
            </span>
          </Link>
        ))}
        {shown.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-ink-3">
            {session?.user
              ? "You're not following any claims yet — follow one to get resolution alerts."
              : "Sign in and follow claims to get resolution alerts here."}
          </p>
        )}
      </div>
      <p className="mt-3.5 text-[11px] italic text-ink-3">
        You're notified the moment a claim you follow resolves, and before its
        deadline.
      </p>
    </div>
  );
}
