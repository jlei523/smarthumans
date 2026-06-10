"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { attachClip, reviewSubmission } from "@/app/actions";
import { cn } from "@/lib/utils";

export function ReviewActions({
  submissionId,
  isOwn,
  signedIn,
}: {
  submissionId: number;
  isOwn: boolean;
  signedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  function review(approve: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await reviewSubmission(submissionId, approve, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        setError(
          res.error === "own-submission"
            ? "You can't review your own submission."
            : res.error === "needs-artifact"
              ? "No artifact link — attach a clip or transcript before this can publish."
              : res.error === "needs-corroboration"
                ? "Reported quotes need two independent news reports."
                : "This submission was already reviewed.",
        );
      }
    });
  }

  if (isOwn) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Your submission — another reviewer has to verify it.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={pending}
        onClick={() => review(true)}
        className={cn(
          "rounded-md border px-3 py-1.5 text-sm font-medium hover:border-st-true hover:text-st-true-tx",
          pending && "opacity-60",
        )}
      >
        {signedIn ? "Approve & publish" : "Sign in to review"}
      </button>
      {signedIn && (
        <button
          disabled={pending}
          onClick={() => review(false)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium hover:border-st-false hover:text-st-false-tx",
            pending && "opacity-60",
          )}
        >
          Reject
        </button>
      )}
      <span className="text-xs text-muted-foreground">
        Check the quote against the source before approving.
      </span>
      {error && <span className="text-xs text-st-false-tx">{error}</span>}
    </div>
  );
}

/** Anyone can clear a "needs clip" flag by finding the artifact —
    it counts toward the Verified Sourcer badge. */
export function AttachClipForm({
  submissionId,
  signedIn,
}: {
  submissionId: number;
  signedIn: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await attachClip(submissionId, url, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        setError(
          res.error === "invalid-url"
            ? "Paste a full link (https://…)."
            : "This citation no longer needs a clip.",
        );
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Clip / transcript / C-SPAN / TV News Archive URL…"
        className="min-w-0 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"
      />
      <button
        disabled={pending || !url.trim()}
        className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-40"
      >
        {signedIn ? "Attach clip" : "Sign in to attach"}
      </button>
      <span className="w-full text-xs text-muted-foreground">
        Search{" "}
        <a
          href="https://archive.org/details/tv"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-border underline-offset-2"
        >
          TV News Archive captions ↗
        </a>{" "}
        for the quote — attaching the artifact counts toward Verified Sourcer.
      </span>
      {error && <span className="text-xs text-st-false-tx">{error}</span>}
    </form>
  );
}
