"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  addEvidence,
  proposeResolution,
  submitStance,
} from "@/app/actions";
import { STATUS_META } from "@/lib/status";
import { PersonSearchInput, type PersonOption } from "@/components/person-search";

const inputCls =
  "w-full rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground";
const labelCls = "block text-xs font-medium text-muted-foreground";

function Disclosure({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id={id} className="scroll-mt-20">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "text-xs font-medium underline decoration-border underline-offset-2 hover:decoration-foreground",
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {open ? "− " : "+ "}
        {label}
      </button>
      {open && <div className="mt-3 rounded-md border p-4">{children}</div>}
    </div>
  );
}

function useGate() {
  const pathname = usePathname();
  const router = useRouter();
  return {
    pathname,
    toSignIn: () => router.push(`/sign-in?next=${encodeURIComponent(pathname)}`),
  };
}

// ---------------------------------------------------------------------------
// Add a figure's position (→ review queue)
// ---------------------------------------------------------------------------

export function AddPositionForm({
  propositionId,
  propositionSlug,
  propositionStatement,
  people,
}: {
  propositionId: number;
  propositionSlug: string;
  propositionStatement: string;
  people: PersonOption[];
}) {
  const [speaker, setSpeaker] = useState("");
  const [position, setPosition] = useState<"affirm" | "deny">("affirm");
  const [quote, setQuote] = useState("");
  const [dateStated, setDateStated] = useState("");
  const [venue, setVenue] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toSignIn } = useGate();

  const valid =
    speaker.trim() && quote.trim() && sourceUrl.trim() && dateStated && venue.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitStance({
        propositionId,
        propositionSlug,
        propositionStatement,
        speaker,
        position,
        quote,
        dateStated,
        venue,
        sourceUrl,
      });
      if (!res.ok && res.error === "sign-in-required") return toSignIn();
      if (res.ok) setDone(true);
    });
  }

  return (
    <Disclosure label="Add a position — on the record" id="add-position">
      {done ? (
        <p className="text-sm">
          <span className="font-semibold">Submitted for review.</span>{" "}
          <span className="text-muted-foreground">
            Reviewers verify the quote and source before it appears here.
            You&apos;ll earn reputation when it&apos;s accepted.
          </span>
        </p>
      ) : (
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-xs text-muted-foreground">
            Found someone else taking a side on this proposition, on the
            record? Add their position with the exact quote and a primary
            source. Submissions go through community review.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Who said it</label>
              <PersonSearchInput
                value={speaker}
                onChange={setSpeaker}
                people={people}
                placeholder="Name"
                className="mt-1"
              />
            </div>
            <div>
              <label className={labelCls}>Their side</label>
              <div className="mt-1 flex gap-2">
                {(
                  [
                    ["affirm", "Said it would"],
                    ["deny", "Said it wouldn't"],
                  ] as const
                ).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPosition(k)}
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium",
                      position === k
                        ? k === "affirm"
                          ? "border-st-true text-st-true-tx"
                          : "border-st-false text-st-false-tx"
                        : "text-ink-2 hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Exact quote</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              placeholder="Verbatim, in their words…"
              className={cn(inputCls, "mt-1 font-serif italic")}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Date stated</label>
              <input
                type="date"
                value={dateStated}
                onChange={(e) => setDateStated(e.target.value)}
                className={cn(inputCls, "mt-1")}
              />
            </div>
            <div>
              <label className={labelCls}>Venue</label>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Interview, post, rally…"
                className={cn(inputCls, "mt-1")}
              />
            </div>
            <div>
              <label className={labelCls}>Primary source URL</label>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
                className={cn(inputCls, "mt-1")}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs italic text-muted-foreground">
              No primary source, no position.
            </p>
            <button
              disabled={pending || !valid}
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-40"
            >
              Submit for review
            </button>
          </div>
        </form>
      )}
    </Disclosure>
  );
}

// ---------------------------------------------------------------------------
// Add evidence (publishes immediately, attributed)
// ---------------------------------------------------------------------------

export function AddEvidenceForm({ propositionId }: { propositionId: number }) {
  const [side, setSide] = useState<"supports" | "refutes">("supports");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [pending, startTransition] = useTransition();
  const { pathname, toSignIn } = useGate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addEvidence(
        propositionId,
        side,
        title,
        sourceUrl,
        sourceName,
        pathname,
      );
      if (!res.ok && res.error === "sign-in-required") return toSignIn();
      if (res.ok) {
        setTitle("");
        setSourceUrl("");
        setSourceName("");
      }
    });
  }

  return (
    <Disclosure label="Add evidence — a sourced citation" id="add-evidence">
      <form onSubmit={submit} className="grid gap-3">
        <p className="text-xs text-muted-foreground">
          Evidence publishes immediately under your name and is weighed by the
          jury at resolution. Cite the data, not the take.
        </p>
        <div className="flex gap-2">
          {(
            [
              ["supports", "It came true"],
              ["refutes", "It didn't"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSide(k)}
              className={cn(
                "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium",
                side === k
                  ? k === "supports"
                    ? "border-st-true text-st-true-tx"
                    : "border-st-false text-st-false-tx"
                  : "text-ink-2 hover:text-foreground",
              )}
            >
              Evidence {l.toLowerCase()}
            </button>
          ))}
        </div>
        <div>
          <label className={labelCls}>What the source shows</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BLS: food-at-home CPI up 1.9% since Jan 2025"
            className={cn(inputCls, "mt-1")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Source URL</label>
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
              className={cn(inputCls, "mt-1")}
            />
          </div>
          <div>
            <label className={labelCls}>Source name (optional)</label>
            <input
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Bureau of Labor Statistics"
              className={cn(inputCls, "mt-1")}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            disabled={pending || !title.trim() || !sourceUrl.trim()}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-40"
          >
            Add evidence
          </button>
        </div>
      </form>
    </Disclosure>
  );
}

// ---------------------------------------------------------------------------
// Propose a resolution (opens the weighted vote)
// ---------------------------------------------------------------------------

const PROPOSABLE = [
  "came_true",
  "partly_true",
  "didnt_come_true",
  "walked_back",
  "unverifiable",
] as const;

export function ProposeResolutionForm({
  propositionId,
}: {
  propositionId: number;
}) {
  const [status, setStatus] = useState<(typeof PROPOSABLE)[number]>("came_true");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { pathname, toSignIn } = useGate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await proposeResolution(propositionId, status, rationale, pathname);
      if (!res.ok && res.error === "sign-in-required") return toSignIn();
      if (!res.ok) {
        setError(
          res.error === "rationale-too-short"
            ? "Explain the verdict in at least a sentence — cite the criteria."
            : res.error === "already-proposed"
              ? "A resolution vote is already open on this claim."
              : "This claim isn't open for resolution.",
        );
      }
    });
  }

  return (
    <Disclosure label="Propose a resolution — open the community vote" id="propose-resolution">
      <form onSubmit={submit} className="grid gap-3">
        <p className="text-xs text-muted-foreground">
          Think this can be settled against its resolution criteria? Propose a
          verdict. Your proposal opens a reputation-weighted vote; it resolves
          when the vote passes the threshold.
        </p>
        <div>
          <label className={labelCls}>Proposed verdict</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof PROPOSABLE)[number])}
            className={cn(inputCls, "mt-1")}
          >
            {PROPOSABLE.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            Rationale — how the criteria were met (or weren&apos;t)
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
            placeholder="Point at the numbers and sources, not the vibes…"
            className={cn(inputCls, "mt-1")}
          />
        </div>
        {error && <p className="text-xs text-st-false-tx">{error}</p>}
        <div className="flex justify-end">
          <button
            disabled={pending || rationale.trim().length === 0}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-40"
          >
            Open the vote
          </button>
        </div>
      </form>
    </Disclosure>
  );
}
