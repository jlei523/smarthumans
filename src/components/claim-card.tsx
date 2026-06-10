import Link from "next/link";
import {
  ExternalLink,
  Video,
  FileText,
  MessageSquareQuote,
  Mic,
  FileSpreadsheet,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { PersonChip } from "@/components/person-chip";
import { FollowButton } from "@/components/follow-button";
import { StanceButtons } from "@/components/stance-buttons";
import { TYPE_LABEL, CATEGORY_LABEL } from "@/lib/status";
import { fmtDate, deadlineLabel, daysUntil } from "@/lib/format";
import type { Person, Proposition, Stance } from "@/db/schema";

const SOURCE_ICONS: Record<string, typeof Video> = {
  video: Video,
  tweet: MessageSquareQuote,
  article: FileText,
  speech: Mic,
  interview: Mic,
  filing: FileSpreadsheet,
  broadcast: Tv,
  other: FileText,
};

export function TypeChip({ type }: { type: Proposition["claimType"] }) {
  return (
    <span className="text-xs uppercase tracking-[0.08em] text-ink-3 whitespace-nowrap">
      {TYPE_LABEL[type]}
    </span>
  );
}

/** Category as a plain small-caps link to its topic page. */
export function CategoryChip({
  category,
}: {
  category: Proposition["category"];
}) {
  return (
    <Link
      href={`/browse/${category}`}
      className="relative z-10 text-xs uppercase tracking-[0.08em] text-ink-3 hover:text-foreground whitespace-nowrap"
    >
      {CATEGORY_LABEL[category]}
    </Link>
  );
}

export function ClaimCard({
  proposition,
  stance,
  person,
  showPerson = true,
  showCategory = true,
  accent = false,
  following = false,
  myStance = null,
  metric,
  className,
}: {
  proposition: Proposition;
  stance: (Stance & { person?: Person }) | null;
  person?: Person | null;
  showPerson?: boolean;
  /** hide the topic link when the surrounding page already is that topic */
  showCategory?: boolean;
  /** left status-colored accent border (used in pending/most-followed lists) */
  accent?: boolean;
  /** signed-in user already follows this proposition */
  following?: boolean;
  /** signed-in user's one-tap stance on this proposition */
  myStance?: "affirm" | "deny" | null;
  /** trailing metric set by the active sort (comments, year, following…) */
  metric?: string;
  className?: string;
}) {
  const speaker = person ?? stance?.person ?? null;
  const isOpen =
    proposition.status === "pending" || proposition.status === "disputed";
  const days = daysUntil(proposition.deadline);
  // calls close at the deadline — the answer may already be out
  const callsOpen = isOpen && (days === null || days >= 0);

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-lg border bg-card p-4 shadow-xs transition-shadow hover:shadow-md",
        accent &&
          "border-l-[3px] border-l-st-pending rounded-l-md",
        className,
      )}
    >
      {/* Kicker: person, status right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {showPerson && speaker ? (
            <PersonChip person={speaker} size="md" />
          ) : (
            <TypeChip type={proposition.claimType} />
          )}
        </div>
        <StatusBadge status={proposition.status} size="sm" />
      </div>

      {/* The quote is the artifact */}
      <p className="font-serif text-[15px] leading-snug text-foreground">
        <Link
          href={`/claims/${proposition.slug}`}
          className="after:absolute after:inset-0"
        >
          {stance ? (
            <>“{truncate(stance.quote, 160)}”</>
          ) : (
            proposition.statement
          )}
        </Link>
      </p>

      {/* One quiet metadata line — actions lead from the left */}
      <div className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-2 pt-0.5 text-xs text-ink-3">
        <span className="relative z-10">
          <FollowButton
            target="proposition"
            targetId={proposition.id}
            count={proposition.followerCount}
            initialFollowing={following}
            size="sm"
          />
        </span>
        {callsOpen && (
          <span className="relative z-10">
            <StanceButtons propositionId={proposition.id} initial={myStance} />
          </span>
        )}
        {isOpen && !callsOpen && (
          <span className="text-xs text-ink-3 whitespace-nowrap" title="The deadline passed — calls are closed while resolution is pending">
            calls closed
          </span>
        )}
        {((showPerson && speaker) || showCategory || stance) && (
          <span className="text-ink-4">·</span>
        )}
        {showPerson && speaker && <TypeChip type={proposition.claimType} />}
        {showCategory && (
          <>
            {showPerson && speaker && <span className="text-ink-4">·</span>}
            <CategoryChip category={proposition.category} />
          </>
        )}
        {stance && (
          <>
            {((showPerson && speaker) || showCategory) && (
              <span className="text-ink-4">·</span>
            )}
            <span className="whitespace-nowrap">{fmtDate(stance.dateStated)}</span>
          </>
        )}
        {metric !== undefined ? (
          <span className="ml-auto font-meta text-[11.5px] text-ink-3 whitespace-nowrap tabular-nums">
            {metric}
          </span>
        ) : (
          isOpen && (
            <span className="ml-auto font-medium text-st-pending-tx whitespace-nowrap">
              {deadlineLabel(proposition.deadline)}
            </span>
          )
        )}
      </div>
    </article>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function SourceLink({
  stance,
  className,
}: {
  stance: Stance;
  className?: string;
}) {
  const SourceIcon = SOURCE_ICONS[stance.sourceType] ?? FileText;
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <a
        href={stance.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-st-pending-tx hover:underline underline-offset-2"
      >
        <SourceIcon className="size-3.5" />
        Primary source
        {stance.videoTimestamp ? ` (${stance.videoTimestamp})` : ""}
        <ExternalLink className="size-3" />
      </a>
      {stance.sourceArchiveUrl && (
        <a
          href={stance.sourceArchiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:underline"
        >
          archived
        </a>
      )}
    </span>
  );
}
