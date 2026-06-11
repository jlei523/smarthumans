import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { StatusBadge } from "@/components/status-badge";
import { getFollowedUsersFeed } from "@/lib/queries";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your feed",
  description: "Stakes and submissions from members you follow.",
};

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const items = session?.user
    ? await getFollowedUsersFeed(session.user.id)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-9 pb-20">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Your feed</h1>
      <p className="mt-2 text-sm text-ink-3">
        Stakes and submissions from members you follow.
      </p>

      {!session?.user ? (
        <p className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-ink-3">
          <Link
            href="/sign-in?next=/feed"
            className="font-medium text-foreground underline decoration-border underline-offset-2"
          >
            Sign in
          </Link>{" "}
          to follow members and see their calls here.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-ink-3">
          Nothing yet — follow members from their profiles or the{" "}
          <Link
            href="/leaderboards?tab=users"
            className="font-medium text-foreground underline decoration-border underline-offset-2"
          >
            smartest-users board
          </Link>{" "}
          and their stakes and submissions land here.
        </p>
      ) : (
        <ul className="mt-6 divide-y">
          {items.map((it, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-3">
              <Link
                href={`/u/${it.user.id}`}
                className="font-semibold hover:underline underline-offset-2"
              >
                @{it.user.name}
              </Link>
              {it.kind === "stake" && it.proposition ? (
                <>
                  <span className="text-sm text-ink-3">
                    staked{" "}
                    <span
                      className={
                        it.position === "affirm"
                          ? "font-semibold text-st-true-tx"
                          : "font-semibold text-st-false-tx"
                      }
                    >
                      {it.position === "affirm" ? "Yes" : "No"}
                    </span>{" "}
                    on
                  </span>
                  <Link
                    href={`/claims/${it.proposition.slug}`}
                    className="min-w-0 font-serif text-[15px] hover:underline underline-offset-2"
                  >
                    {it.proposition.statement}
                  </Link>
                  <StatusBadge status={it.proposition.status} size="sm" />
                </>
              ) : (
                <>
                  <span className="text-sm text-ink-3">
                    submitted a claim
                    {it.submissionStatus === "approved"
                      ? " — published"
                      : it.submissionStatus === "rejected"
                        ? " — not accepted"
                        : " — in review"}
                    :
                  </span>
                  <span className="min-w-0 font-serif text-[15px] text-ink-2">
                    {it.title}
                  </span>
                </>
              )}
              <span className="ml-auto shrink-0 text-xs text-ink-4">
                {timeAgo(it.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
