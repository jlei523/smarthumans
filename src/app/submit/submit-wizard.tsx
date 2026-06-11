"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  Link2,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitClaim } from "@/app/actions";
import { PersonSearchInput } from "@/components/person-search";
import { CATEGORY_LABEL } from "@/lib/status";
import type { Category } from "@/db/schema";

const STEPS = [
  "Who said it",
  "Quote & source",
  "When & where",
  "Claim & deadline",
  "Review",
] as const;

/** Community claims skip sourcing entirely — there is no quote to source. */
const COMMUNITY_STEPS = ["The claim", "Review"] as const;

type Draft = {
  sourceUrl: string;
  sourceType: string;
  network: string;
  show: string;
  approxTimestamp: string;
  quoteReported: boolean;
  corroborationUrl: string;
  speaker: string;
  quote: string;
  dateStated: string;
  venue: string;
  category: Category | "";
  deadline: string;
  proposedStatement: string;
  resolutionCriteria: string;
};

const EMPTY: Draft = {
  sourceUrl: "",
  sourceType: "video",
  network: "",
  show: "",
  approxTimestamp: "",
  quoteReported: false,
  corroborationUrl: "",
  speaker: "",
  quote: "",
  dateStated: "",
  venue: "",
  category: "",
  deadline: "",
  proposedStatement: "",
  resolutionCriteria: "",
};

const SOURCE_TYPES = [
  ["video", "Video"],
  ["broadcast", "TV / radio broadcast"],
  ["article", "Article"],
  ["tweet", "Social post (archived)"],
  ["speech", "Speech / transcript"],
  ["interview", "Interview"],
  ["filing", "Official filing"],
] as const;

const VAGUE_WORDS = ["great", "huge", "tremendous", "soon", "many", "a lot", "best", "incredible", "amazing"];

export function SubmitWizard({
  existing,
  people,
  initialDraft,
  sourceCommentId,
}: {
  existing: Array<{ id: number; slug: string; statement: string }>;
  people: Array<{ name: string; slug: string; imageUrl?: string | null; domain?: string }>;
  initialDraft?: Partial<Draft>;
  /** set when staking a discussion comment into a proposition */
  sourceCommentId?: number;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY, ...initialDraft });
  const [submitted, setSubmitted] = useState(false);
  // community mode: a user-authored question, no public figure attached
  const [community, setCommunity] = useState(false);
  const [pending, startTransition] = useTransition();
  const steps = community ? COMMUNITY_STEPS : STEPS;

  function pickMode(next: boolean) {
    setCommunity(next);
    setStep(0);
  }

  const set = (k: keyof Draft) => (v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // naive duplicate detection: shared significant words with an existing proposition
  const duplicates = useMemo(() => {
    const text = (draft.proposedStatement || draft.quote).toLowerCase();
    if (text.length < 12) return [];
    const words = text.split(/\W+/).filter((w) => w.length > 4);
    return existing
      .map((p) => {
        const target = p.statement.toLowerCase();
        const hits = words.filter((w) => target.includes(w)).length;
        return { ...p, score: hits / Math.max(words.length, 1) };
      })
      .filter((p) => p.score > 0.32)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [draft.proposedStatement, draft.quote, existing]);

  const vagueFlags = useMemo(() => {
    const text = (draft.proposedStatement || draft.quote).toLowerCase();
    return VAGUE_WORDS.filter((w) => text.includes(w));
  }, [draft.proposedStatement, draft.quote]);

  function startFromLink() {
    // AI extraction plugs in here later (the site is agent-ready). For now
    // the link is attached and carried through; you confirm every field.
    const url = draft.sourceUrl;
    if (!url) return;
    setDraft((d) => ({
      ...d,
      venue: d.venue || guessVenue(url),
    }));
    setStep(1);
  }

  function submit() {
    startTransition(async () => {
      await submitClaim(
        community
          ? {
              kind: "claim",
              communityClaim: true,
              proposedStatement: draft.proposedStatement,
              resolutionCriteria: draft.resolutionCriteria,
              category: draft.category,
              deadline: draft.deadline || null,
              sourceType: "other",
              dateStated: new Date().toISOString().slice(0, 10),
            }
          : {
              ...draft,
              deadline: draft.deadline || null,
              sourceCommentId,
            },
      );
      setSubmitted(true);
    });
  }

  const isBroadcast = draft.sourceType === "broadcast";
  const sourceOk = draft.quoteReported
    ? draft.sourceUrl.trim().length > 0 && draft.corroborationUrl.trim().length > 0
    : isBroadcast
      ? draft.network.trim().length > 0 && draft.show.trim().length > 0
      : draft.sourceUrl.trim().length > 0;
  const claimDefined =
    draft.category !== "" &&
    draft.proposedStatement.trim().length > 0 &&
    draft.resolutionCriteria.trim().length > 0;
  const stepValid = community
    ? [claimDefined, true][step]
    : [
        draft.speaker.trim().length > 0,
        draft.quote.trim().length > 0 && sourceOk,
        draft.dateStated.length > 0 &&
          (draft.venue.trim().length > 0 || isBroadcast),
        claimDefined,
        true,
      ][step];

  if (submitted) {
    return (
      <div className="mt-8 rounded-lg border bg-st-true-bg p-6 text-center">
        <CircleCheck className="mx-auto size-8 text-st-true" />
        <p className="mt-2 font-serif text-lg font-semibold">
          Submitted for review
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Trusted reviewers will verify quote authenticity, sourcing, and
          falsifiability. You'll earn reputation if it's accepted.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium underline underline-offset-2">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Mode: a figure's claim (sourced quote) or your own community question */}
      {step === 0 && (
        <div className="mb-5">
          <div className="flex w-fit items-center gap-1 rounded-full border bg-card p-1 text-sm font-medium shadow-xs">
            <button
              onClick={() => pickMode(false)}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                !community
                  ? "bg-foreground text-background"
                  : "text-ink-2 hover:text-foreground",
              )}
            >
              A public figure said it
            </button>
            <button
              onClick={() => pickMode(true)}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                community
                  ? "bg-foreground text-background"
                  : "text-ink-2 hover:text-foreground",
              )}
            >
              Community question
            </button>
          </div>
          {community && (
            <p className="mt-2 text-xs text-muted-foreground">
              Your own resolvable question — no public figure attached, no
              quote to source. It publishes with the{" "}
              <span className="font-medium text-foreground">
                Community claim
              </span>{" "}
              label and goes through the same review and resolution as
              everything else.
            </p>
          )}
        </div>
      )}

      {/* Paste-a-link opener */}
      {step === 0 && !community && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Link2 className="size-4" /> Start with the primary source
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste the video, article, or archived post first — it's required,
            and it carries through the whole form. (AI extraction of quote,
            speaker, and date is coming; until then you confirm each field.)
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={draft.sourceUrl}
              onChange={(e) => set("sourceUrl")(e.target.value)}
              placeholder="https://…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
            <button
              onClick={startFromLink}
              disabled={!draft.sourceUrl}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              Use this source
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Or fill in the form manually below.
          </p>
        </div>
      )}

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-1 text-[11px]">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col gap-1">
            <span
              className={cn(
                "h-1 rounded-full",
                i <= step ? "bg-foreground" : "bg-muted",
              )}
            />
            <span
              className={cn(
                i === step
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-4">
        {step === 0 && !community && (
          <Field label="Who said it?" required hint="Public figure or anyone on the record.">
            <PersonSearchInput
              value={draft.speaker}
              onChange={set("speaker")}
              people={people}
              placeholder="e.g. Donald Trump"
            />
          </Field>
        )}

        {step === 1 && !community && (
          <>
            <Field label="Exact quote" required hint="Verbatim, in the speaker's words.">
              <textarea
                rows={3}
                value={draft.quote}
                onChange={(e) => set("quote")(e.target.value)}
                placeholder="“I will build a great wall…”"
                className="w-full rounded-md border bg-background px-3 py-2 font-serif text-sm italic outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Source type" required>
              <select
                value={draft.sourceType}
                onChange={(e) => set("sourceType")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              >
                {SOURCE_TYPES.map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            {isBroadcast && !draft.quoteReported && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Network" required>
                    <input
                      value={draft.network}
                      onChange={(e) => set("network")(e.target.value)}
                      placeholder="e.g. CNBC"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                    />
                  </Field>
                  <Field label="Show" required>
                    <input
                      value={draft.show}
                      onChange={(e) => set("show")(e.target.value)}
                      placeholder="e.g. Squawk Box"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                    />
                  </Field>
                  <Field label="Approx. timestamp" hint="e.g. ~7:40am segment">
                    <input
                      value={draft.approxTimestamp}
                      onChange={(e) => set("approxTimestamp")(e.target.value)}
                      placeholder="hh:mm"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                    />
                  </Field>
                </div>
                <Field
                  label="Artifact link"
                  hint="Video clip, official transcript, C-SPAN, or Internet Archive TV News Archive clip. Without one, your citation waits in the queue flagged “needs clip” until someone attaches it."
                >
                  <input
                    value={draft.sourceUrl}
                    onChange={(e) => set("sourceUrl")(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    First place to look:{" "}
                    <a
                      href="https://archive.org/details/tv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
                    >
                      TV News Archive caption search ↗
                    </a>{" "}
                    — search the quote's words across recorded broadcasts.
                  </p>
                </Field>
              </>
            )}

            {!isBroadcast && !draft.quoteReported && (
              <Field
                label="Primary source URL"
                required
                hint="Video with timestamp, archived post, official transcript, or published article. Required — no exceptions."
              >
                <input
                  value={draft.sourceUrl}
                  onChange={(e) => set("sourceUrl")(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </Field>
            )}

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.quoteReported}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, quoteReported: e.target.checked }))
                }
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-foreground">
                  No recording exists.
                </span>{" "}
                Cite 2+ independent contemporaneous news reports instead. The
                claim publishes with a visible &ldquo;quote reported, not
                primary-sourced&rdquo; label.
              </span>
            </label>

            {draft.quoteReported && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="News report #1" required>
                  <input
                    value={draft.sourceUrl}
                    onChange={(e) => set("sourceUrl")(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                </Field>
                <Field label="News report #2 (independent outlet)" required>
                  <input
                    value={draft.corroborationUrl}
                    onChange={(e) => set("corroborationUrl")(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                </Field>
              </div>
            )}
          </>
        )}

        {step === 2 && !community && (
          <>
            <Field label="Date stated" required>
              <input
                type="date"
                value={draft.dateStated}
                onChange={(e) => set("dateStated")(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field label="Venue" required hint="Where it was said — rally, interview, earnings call, post…">
              <input
                value={draft.venue}
                onChange={(e) => set("venue")(e.target.value)}
                placeholder="e.g. CNN Town Hall, Manchester NH"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>
          </>
        )}

        {(community ? step === 0 : step === 3) && (
          <>
            <Field
              label="Category"
              required
              hint="Whether it's a prediction or a promise is inferred automatically and checked in review — you don't pick it."
            >
              <select
                value={draft.category}
                onChange={(e) => set("category")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              >
                <option value="">Select…</option>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Resolution deadline"
              hint="Leave empty if the claim resolves when an event occurs rather than by a date."
            >
              <input
                type="date"
                value={draft.deadline}
                onChange={(e) => set("deadline")(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field
              label="Proposition statement"
              required
              hint="The canonical, resolvable phrasing — e.g. “A wall is built along the U.S.–Mexico border by Jan 2021.”"
            >
              <textarea
                rows={2}
                value={draft.proposedStatement}
                onChange={(e) => set("proposedStatement")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>
            <Field
              label="Resolution criteria"
              required
              hint="How will a jury decide? Specify measurable thresholds and data sources."
            >
              <textarea
                rows={3}
                value={draft.resolutionCriteria}
                onChange={(e) => set("resolutionCriteria")(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>

            {/* Falsifiability coach */}
            {vagueFlags.length > 0 && (
              <div className="rounded-md border border-st-partly/40 bg-st-partly-bg px-3 py-2.5 text-xs">
                <p className="flex items-center gap-1.5 font-semibold text-st-partly">
                  <TriangleAlert className="size-3.5" /> Falsifiability coach
                  <span className="rounded-sm bg-background/60 px-1 py-0.5 text-[10px] font-medium">
                    AI-assisted
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Vague terms detected: {vagueFlags.map((w) => `“${w}”`).join(", ")}.
                  Rephrase with a measurable threshold (a number, a date, a
                  named data source) so a jury can resolve it cleanly.
                </p>
              </div>
            )}
          </>
        )}

        {(community ? step === 1 : step === 4) && (
          <div className="rounded-lg border divide-y text-sm">
            {(community
              ? [
                  ["Kind", "Community claim — no public figure attached"],
                  ["Proposition", draft.proposedStatement],
                  ["Criteria", draft.resolutionCriteria],
                  ["Category", draft.category ? CATEGORY_LABEL[draft.category] : ""],
                  ["Deadline", draft.deadline || "Resolves when event occurs"],
                ]
              : [
                  ["Speaker", draft.speaker],
                  ["Quote", draft.quote],
                  [
                    "Sourcing",
                    draft.quoteReported
                      ? "Quote reported (2 news reports) — publishes with label"
                      : isBroadcast
                        ? `Broadcast: ${draft.network} · ${draft.show}${draft.sourceUrl ? "" : " — NEEDS CLIP (queued until attached)"}`
                        : draft.sourceType,
                  ],
                  ["Source", draft.sourceUrl || (isBroadcast ? "— artifact pending" : "")],
                  ["Date", draft.dateStated],
                  ["Venue", draft.venue],
                  ["Category", draft.category ? CATEGORY_LABEL[draft.category] : ""],
                  ["Deadline", draft.deadline || "Resolves when event occurs"],
                  ["Proposition", draft.proposedStatement],
                  ["Criteria", draft.resolutionCriteria],
                ]
            ).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-2 px-4 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">{k}</span>
                <span className={cn(!v && "text-st-false text-xs font-medium")}>
                  {v || "Missing"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Duplicate detection */}
        {duplicates.length > 0 && (community || (step >= 1 && step <= 4)) && (
          <div className="rounded-md border border-st-pending/40 bg-st-pending-bg px-3 py-2.5 text-xs">
            <p className="flex items-center gap-1.5 font-semibold text-st-pending">
              <CircleAlert className="size-3.5" /> This may already be tracked
            </p>
            <ul className="mt-1.5 space-y-1">
              {duplicates.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/claims/${d.slug}`}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {d.statement}
                  </Link>{" "}
                  <span className="text-muted-foreground">
                    — if it's the same event,{" "}
                    <Link
                      href={`/claims/${d.slug}#add-position`}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      add this person's position to it
                    </Link>{" "}
                    instead of creating a duplicate.
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!stepValid}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={
                pending ||
                (community
                  ? !claimDefined
                  : !draft.quote ||
                    !sourceOk ||
                    !draft.speaker ||
                    !draft.proposedStatement)
              }
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-st-false"> *</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function guessVenue(url: string): string {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    if (host.includes("x.com") || host.includes("twitter")) return "X (Twitter) post";
    if (host.includes("youtube")) return "Video";
    if (host.includes("c-span")) return "C-SPAN";
    return host;
  } catch {
    return "";
  }
}
