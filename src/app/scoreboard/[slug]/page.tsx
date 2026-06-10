import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClaim } from "@/lib/queries";
import { stanceOutcome } from "@/lib/scoring";
import { StatusBadge } from "@/components/status-badge";
import { PersonAvatar } from "@/components/person-chip";
import { STATUS_META } from "@/lib/status";
import { fmtDate, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const claim = await getClaim(slug);
  if (!claim) return {};
  return {
    title: `Resolution day: ${claim.question || claim.statement}`,
  };
}

export default async function ScoreboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claim = await getClaim(slug);
  if (!claim) notFound();
  const isResolved = !["pending", "disputed"].includes(claim.status);
  if (!isResolved) notFound();

  const meta = STATUS_META[claim.status];
  const calls = claim.stances.map((s) => ({
    stance: s,
    outcome: stanceOutcome(claim.status, s.position),
  }));
  const right = calls.filter((c) => c.outcome === "correct").length;

  const affirm = claim.userStances.filter((s) => s.position === "affirm").length;
  const total = claim.userStances.length;
  const pctYes = total > 0 ? affirm / total : null;
  const crowdRight =
    pctYes !== null &&
    ((claim.status === "came_true" && pctYes >= 0.5) ||
      (claim.status === "didnt_come_true" && pctYes < 0.5));

  const userCalls = claim.userStances.map((s) => ({
    ...s,
    outcome: stanceOutcome(claim.status, s.position),
  }));
  const usersRight = userCalls.filter((u) => u.outcome === "correct").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-9 pb-20">
      <div className="grid gap-6">
        {/* masthead */}
        <div className="overflow-hidden rounded-[14px] border bg-card">
          <div className={cn("border-b px-6 py-5", meta.badge.split(" ").find((c) => c.startsWith("bg-")))}>
            <p className="font-meta text-[11px] uppercase tracking-[0.14em] opacity-85">
              Resolution day · {fmtDate(claim.resolvedAt)}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground">
              {claim.statement}
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
              <StatusBadge status={claim.status} size="lg" />
              <span className="text-[15px] font-medium text-ink-2">
                {calls.length} public figure{calls.length === 1 ? "" : "s"} made
                a call · <b className="font-mono">{right}</b>{" "}
                {right === 1 ? "was" : "were"} right.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 px-6 py-3.5">
            <a
              href={`/api/og/claim/${claim.slug}`}
              target="_blank"
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Share the verdict
            </a>
            <Link
              href={`/claims/${claim.slug}`}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Open full proposition →
            </Link>
          </div>
        </div>

        {/* call sheet */}
        <div className="rounded-[14px] border bg-card p-5 sm:p-6">
          <p className="mb-4 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
            Who called it
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.07em] text-ink-3">
                  <th className="px-2.5 py-2 font-semibold">Figure</th>
                  <th className="px-2.5 py-2 font-semibold">Their call</th>
                  <th className="px-2.5 py-2 font-semibold">What they said</th>
                  <th className="px-2.5 py-2 text-right font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {calls.map(({ stance: s, outcome }) => (
                  <tr key={s.id} className="hover:bg-paper-2">
                    <td className="px-2.5 py-2.5">
                      <Link
                        href={`/p/${s.person.slug}`}
                        className="flex items-center gap-2.5 font-semibold hover:underline underline-offset-2"
                      >
                        <PersonAvatar person={s.person} size="md" />
                        {s.person.name}
                      </Link>
                    </td>
                    <td className="px-2.5 py-2.5">
                      <span
                        className={cn(
                          "rounded-[5px] px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                          s.position === "affirm"
                            ? "bg-st-true-bg text-st-true-tx"
                            : "bg-st-false-bg text-st-false-tx",
                        )}
                      >
                        {s.position === "affirm" ? "would happen" : "wouldn't"}
                      </span>
                    </td>
                    <td className="max-w-[300px] px-2.5 py-2.5 font-serif text-[13.5px] leading-snug text-ink-2">
                      “{s.quote.length > 90 ? s.quote.slice(0, 88) + "…" : s.quote}”
                    </td>
                    <td className="px-2.5 py-2.5 text-right">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
                          outcome === "correct" && "bg-st-true-bg text-st-true-tx",
                          outcome === "incorrect" && "bg-st-false-bg text-st-false-tx",
                          outcome === "partly" && "bg-st-partly-bg text-st-partly-tx",
                          !["correct", "incorrect", "partly"].includes(outcome) &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {outcome === "correct"
                          ? "✓ Called it"
                          : outcome === "incorrect"
                            ? "✗ Wrong"
                            : outcome === "partly"
                              ? "◐ Partly"
                              : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* crowd + users */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[14px] border bg-card p-5">
            <p className="mb-3 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              The crowd
            </p>
            {pctYes !== null ? (
              <>
                <p className="mb-2.5 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-mono text-[26px] font-semibold tabular-nums",
                      crowdRight ? "text-st-true" : "text-st-false",
                    )}
                  >
                    {pct(pctYes)}
                  </span>
                  <span className="text-sm text-ink-2">
                    of {total} said Yes
                  </span>
                </p>
                <p className="mt-3 text-[11px] italic text-ink-3">
                  The crowd {crowdRight ? "called it right." : "got it wrong."}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-3">No user stances were registered.</p>
            )}
          </div>
          <div className="rounded-[14px] border bg-card p-5">
            <p className="mb-3 font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Users who staked it
            </p>
            <div className="grid gap-2">
              {userCalls.length > 0 ? (
                userCalls.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <Link
                      href={`/u/${u.userId}`}
                      className="flex-1 truncate text-[13px] font-semibold hover:underline underline-offset-2"
                    >
                      @{u.user.name}
                    </Link>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                        u.outcome === "correct"
                          ? "bg-st-true-bg text-st-true-tx"
                          : "bg-st-false-bg text-st-false-tx",
                      )}
                    >
                      {u.outcome === "correct" ? "called it" : "missed"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] italic text-ink-3">
                  No tracked users staked this one.
                </p>
              )}
            </div>
            {userCalls.length > 0 && (
              <p className="mt-3 border-t pt-2.5 text-[11px] italic text-ink-3">
                <b className="font-mono not-italic text-ink-2">{usersRight}</b> of{" "}
                {userCalls.length} tracked users called it — scored to their
                records.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
