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
import { PersonAvatar } from "@/components/person-chip";
import { FollowButton } from "@/components/follow-button";
import { StanceButtons } from "@/components/stance-buttons";
import { CATEGORY_LABEL } from "@/lib/status";
import { fmtDate, deadlineCompact, daysUntil, timeAgo } from "@/lib/format";
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

/** Topic as an outlined pill linking to its topic page. */
export function CategoryChip({
  category,
}: {
  category: Proposition["category"];
}) {
  return (
    <Link
      href={`/browse/${category}`}
      className="relative z-10 inline-flex items-center rounded-full border border-input px-2.5 py-[2.5px] text-[11.5px] font-medium text-ink-2 whitespace-nowrap transition-colors hover:border-ink-3 hover:bg-paper-2 hover:text-foreground"
    >
      {CATEGORY_LABEL[category]}
    </Link>
  );
}

/** Cut at a sentence boundary — never a mid-clause ellipsis. */
function truncateQuote(s: string, max = 180): string {
  if (s.length <= max) return s;
  const head = s.slice(0, max);
  const sentenceEnd = Math.max(
    head.lastIndexOf(". "),
    head.lastIndexOf("! "),
    head.lastIndexOf("? "),
  );
  if (sentenceEnd > 40) return s.slice(0, sentenceEnd + 1);
  const word = head.lastIndexOf(" ");
  return head.slice(0, word > 0 ? word : max).trimEnd() + "…";
}

export function ClaimCard({
  proposition,
  stance,
  stances,
  person,
  showPerson = true,
  showCategory = true,
  showFollow = true,
  following = false,
  myStance = null,
  className,
}: {
  proposition: Proposition;
  stance: (Stance & { person?: Person }) | null;
  /** all stances on the proposition — affirming figures render as a portrait stack */
  stances?: (Stance & { person?: Person })[] | null;
  person?: Person | null;
  showPerson?: boolean;
  /** hide the topic link when the surrounding page already is that topic */
  showCategory?: boolean;
  /** swap the follow button for "resolved x ago" — for just-resolved rails */
  showFollow?: boolean;
  /** signed-in user already follows this proposition */
  following?: boolean;
  /** signed-in user's one-tap stance on this proposition */
  myStance?: "affirm" | "deny" | null;
  className?: string;
}) {
  const speaker = person ?? stance?.person ?? null;
  // only figures who said it would happen — the card's statement is affirmative,
  // so a denier's portrait next to it would misattribute the call
  const figures: Person[] = speaker ? [speaker] : [];
  for (const s of stances ?? []) {
    if (s.position !== "affirm") continue;
    const sp = s.person;
    if (sp && !figures.some((f) => f.id === sp.id)) figures.push(sp);
  }
  const isOpen =
    proposition.status === "pending" || proposition.status === "disputed";
  const days = daysUntil(proposition.deadline);
  // calls close at the deadline — the answer may already be out
  const callsOpen = isOpen && (days === null || days >= 0);

  return (
    <article
      className={cn(
        // @container: the card adapts to its own width — in narrow rail
        // grids it sheds the date, topic chip, and "Your call" label
        "@container group relative flex flex-col gap-[14px] rounded-xl border bg-card shadow-xs transition-colors hover:border-input",
        className,
      )}
    >
      {/* Row 1 — identity + verdict */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {showPerson && speaker && (
            <span className="relative z-10 flex min-w-0 items-center gap-2">
              <Link
                href={`/p/${speaker.slug}`}
                className="group/who flex min-w-0 items-center gap-2"
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {figures.slice(0, 3).map((f) => (
                    <PersonAvatar
                      key={f.id}
                      person={f}
                      size="sm"
                      className="size-6 rounded-full ring-2 ring-card"
                    />
                  ))}
                </span>
                <span className="truncate text-[13px] font-semibold underline-offset-[3px] group-hover/who:underline">
                  {speaker.name}
                </span>
              </Link>
              {figures.length > 1 && (
                <Link
                  href={`/claims/${proposition.slug}#positions`}
                  className="shrink-0 text-[11.5px] font-medium text-ink-3 underline-offset-[3px] hover:text-foreground hover:underline"
                >
                  +{figures.length - 1}
                </Link>
              )}
            </span>
          )}
          {stance && (
            <span className="flex items-center gap-x-2 text-[11.5px] text-ink-3 whitespace-nowrap @max-[26rem]:hidden">
              {showPerson && speaker && <span className="text-ink-4">·</span>}
              <span>{fmtDate(stance.dateStated)}</span>
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-[9px]">
          <StatusBadge
            status={proposition.status}
            size="md"
            detail={isOpen ? deadlineCompact(proposition.deadline) : null}
          />
        </div>
      </div>

      {/* Row 2 — the canonical proposition; the verbatim quote lives on the detail page */}
      <p className="font-serif text-[16px] leading-[1.42] text-foreground [text-wrap:pretty]">
        <Link
          href={`/claims/${proposition.slug}`}
          className="after:absolute after:inset-0"
        >
          {truncateQuote(proposition.statement)}
        </Link>
      </p>

      {/* Row 3 — actions, topic chip last */}
      <div className="mt-auto flex flex-wrap items-center gap-2.5">
        {showFollow ? (
          <span className="relative z-10">
            <FollowButton
              target="proposition"
              targetId={proposition.id}
              count={proposition.followerCount}
              initialFollowing={following}
              size="md"
            />
          </span>
        ) : (
          proposition.resolvedAt && (
            <span className="text-[11.5px] text-ink-3">
              resolved {timeAgo(proposition.resolvedAt)}
            </span>
          )
        )}
        {callsOpen && (
          <span className="relative z-10">
            <StanceButtons propositionId={proposition.id} initial={myStance} />
          </span>
        )}
        {showCategory && (
          <span className="@max-[26rem]:hidden">
            <CategoryChip category={proposition.category} />
          </span>
        )}
      </div>
    </article>
  );
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
