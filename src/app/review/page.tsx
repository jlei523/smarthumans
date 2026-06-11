import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Section } from "@/components/section";
import { AttachClipForm, ReviewActions } from "./review-actions";
import { fmtDate, timeAgo } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/status";
import { inferSubtype, normalizeSubtype } from "@/lib/subtype";
import type { Category } from "@/db/schema";

export const metadata: Metadata = {
  title: "Review queue",
  description:
    "Pending submissions awaiting verification of quote authenticity, sourcing, and falsifiability.",
};

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [pending, needsClip, recent] = await Promise.all([
    db.query.submissions.findMany({
      where: eq(submissions.status, "pending"),
      orderBy: desc(submissions.createdAt),
    }),
    db.query.submissions.findMany({
      where: eq(submissions.status, "needs_clip"),
      orderBy: desc(submissions.createdAt),
    }),
    db.query.submissions.findMany({
      where: (t, { notInArray }) =>
        notInArray(t.status, ["pending", "needs_clip"]),
      orderBy: desc(submissions.createdAt),
      limit: 8,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-9 pb-20">
      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        Community review
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">
        Review queue
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-3">
        Every submission is checked for quote authenticity, a working primary
        source, and falsifiable criteria before it joins the record. You
        can&apos;t review your own submissions.
        {!session?.user && (
          <>
            {" "}
            <Link
              href="/sign-in?next=/review"
              className="text-foreground underline decoration-border underline-offset-2"
            >
              Sign in to review.
            </Link>
          </>
        )}
      </p>

      <Section title={`Awaiting review (${pending.length})`} className="mt-8">
        <div className="grid gap-4">
          {pending.map((sub) => {
            const p = sub.payload as Record<string, string | number | null>;
            const isStance = p.kind === "stance";
            const isCommunity = !isStance && !!p.communityClaim;
            return (
              <article key={sub.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    {isStance
                      ? "New position"
                      : isCommunity
                        ? "Community claim"
                        : "New claim"}{" "}
                    · #{sub.id} · {timeAgo(sub.createdAt)}
                  </p>
                </div>

                {isStance ? (
                  <>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">{String(p.speaker)}</span>{" "}
                      <span
                        className={
                          p.position === "affirm"
                            ? "font-medium text-st-true-tx"
                            : "font-medium text-st-false-tx"
                        }
                      >
                        said it {p.position === "affirm" ? "would" : "wouldn't"}
                      </span>{" "}
                      <span className="text-muted-foreground">on</span>{" "}
                      <Link
                        href={`/claims/${String(p.propositionSlug)}`}
                        className="underline decoration-border underline-offset-2 hover:decoration-foreground"
                      >
                        {String(p.propositionStatement)}
                      </Link>
                    </p>
                    <blockquote className="mt-2 border-l-2 pl-3 font-serif text-sm italic">
                      “{String(p.quote)}”
                    </blockquote>
                  </>
                ) : (
                  <>
                    <p className="mt-2 font-serif text-base font-semibold leading-snug">
                      {String(p.proposedStatement)}
                    </p>
                    {!isCommunity && (
                      <blockquote className="mt-1.5 border-l-2 pl-3 font-serif text-sm italic text-ink-2">
                        “{String(p.quote)}” — {String(p.speaker)}
                      </blockquote>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {CATEGORY_LABEL[p.category as Category] ?? String(p.category)} ·
                      deadline {p.deadline ? fmtDate(String(p.deadline)) : "on event"}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Criteria:</span>{" "}
                      {String(p.resolutionCriteria)}
                    </p>
                  </>
                )}

                {isCommunity ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    User-authored — no quote to verify; check falsifiability,
                    category, and the deadline.
                  </p>
                ) : (
                  <p className="mt-2 flex flex-wrap gap-x-3 text-xs">
                    <span className="text-muted-foreground">
                      stated {p.dateStated ? fmtDate(String(p.dateStated)) : "—"} ·{" "}
                      {String(p.venue || "—")}
                    </span>
                    <a
                      href={String(p.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
                    >
                      Verify source ↗
                    </a>
                  </p>
                )}

                <div className="mt-3 border-t pt-3">
                  <ReviewActions
                    submissionId={sub.id}
                    isOwn={sub.userId === session?.user?.id}
                    signedIn={!!session?.user}
                    kind={isStance ? "stance" : "claim"}
                    defaultSubtype={
                      isStance
                        ? undefined
                        : (normalizeSubtype(p.claimType) ??
                          inferSubtype(
                            `${String(p.quote ?? "")} ${String(p.proposedStatement ?? "")}`,
                          ))
                    }
                  />
                </div>
              </article>
            );
          })}
          {pending.length === 0 && (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Queue is clear. New submissions land here for verification.
            </p>
          )}
        </div>
      </Section>

      {needsClip.length > 0 && (
        <Section title={`Needs clip (${needsClip.length})`}>
          <p className="mb-3 -mt-1 text-xs text-muted-foreground">
            Structured broadcast citations missing the verifiable artifact.
            They cannot publish until a clip, transcript, C-SPAN, or TV News
            Archive link is attached — by anyone.
          </p>
          <div className="grid gap-4">
            {needsClip.map((sub) => {
              const p = sub.payload as Record<string, string | number | null>;
              return (
                <article
                  key={sub.id}
                  className="rounded-lg border border-l-[3px] border-l-st-partly bg-card p-4"
                >
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    Broadcast citation · #{sub.id} · {timeAgo(sub.createdAt)} ·{" "}
                    <span className="font-semibold text-st-partly-tx">
                      needs clip
                    </span>
                  </p>
                  <p className="mt-2 font-serif text-base font-semibold leading-snug">
                    {String(p.proposedStatement)}
                  </p>
                  <blockquote className="mt-1.5 border-l-2 pl-3 font-serif text-sm italic text-ink-2">
                    “{String(p.quote)}” — {String(p.speaker)}
                  </blockquote>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {String(p.network)} · {String(p.show)} · aired{" "}
                    {p.dateStated ? fmtDate(String(p.dateStated)) : "—"}
                    {p.approxTimestamp ? ` · ~${String(p.approxTimestamp)}` : ""}
                  </p>
                  <div className="mt-3 border-t pt-3">
                    <AttachClipForm
                      submissionId={sub.id}
                      signedIn={!!session?.user}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Recently reviewed">
          <ul className="divide-y">
            {recent.map((sub) => {
              const p = sub.payload as Record<string, string | null>;
              return (
                <li key={sub.id} className="flex items-baseline gap-3 py-2.5 text-sm">
                  <span
                    className={
                      sub.status === "approved"
                        ? "shrink-0 text-xs font-semibold text-st-true-tx"
                        : "shrink-0 text-xs font-semibold text-st-false-tx"
                    }
                  >
                    {sub.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-2">
                    {p.kind === "stance"
                      ? `${p.speaker} on “${p.propositionStatement}”`
                      : p.proposedStatement}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(sub.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </div>
  );
}
