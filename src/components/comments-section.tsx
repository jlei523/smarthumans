"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { addComment, voteComment } from "@/app/actions";
import { timeAgo, fmtCount } from "@/lib/format";

export type CommentView = {
  id: number;
  parentId: number | null;
  score: number;
  myVote: 1 | -1 | 0;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  /** domain-scoped credential — never one global karma number */
  authorDomain: { label: string; resolved: number; topPct: number | null } | null;
  /** set when this comment was staked into a tracked proposition */
  stakedTo: { slug: string; statement: string; status: string } | null;
  stance: "affirm" | "deny" | null;
  calledIt: boolean;
};

type CommentNode = CommentView & { children: CommentNode[] };

function buildTree(
  comments: CommentView[],
  sort: "best" | "new" | "record",
): CommentNode[] {
  const byId = new Map<number, CommentNode>(
    comments.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CommentNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const recordKey = (n: CommentNode) =>
    n.authorDomain && n.authorDomain.topPct !== null
      ? 101 - n.authorDomain.topPct
      : -1;
  const cmp =
    sort === "best"
      ? (a: CommentNode, b: CommentNode) =>
          b.score - a.score || b.createdAt.localeCompare(a.createdAt)
      : sort === "record"
        ? (a: CommentNode, b: CommentNode) =>
            recordKey(b) - recordKey(a) || b.score - a.score
        : (a: CommentNode, b: CommentNode) =>
            b.createdAt.localeCompare(a.createdAt);
  const sortRec = (nodes: CommentNode[]) => {
    nodes.sort(cmp);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

function countMatches(
  nodes: CommentNode[],
  pred: (n: CommentNode) => boolean,
): boolean {
  return nodes.some((n) => pred(n) || countMatches(n.children, pred));
}

export function CommentsSection({
  propositionId,
  comments,
  resolved,
  signedIn = false,
}: {
  propositionId: number;
  comments: CommentView[];
  resolved: boolean;
  signedIn?: boolean;
}) {
  const [sort, setSort] = useState<"best" | "new" | "record">("best");
  const [filter, setFilter] = useState<"all" | "affirm" | "deny">("all");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const tree = useMemo(() => buildTree(comments, sort), [comments, sort]);
  // side filter keeps whole threads whose root-or-descendant matches the side
  const shown = useMemo(
    () =>
      filter === "all"
        ? tree
        : tree.filter((n) =>
            countMatches([n], (x) => x.stance === filter),
          ),
    [tree, filter],
  );

  function submitTop(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addComment(propositionId, body, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (res.ok) setBody("");
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Discussion ({comments.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-3 text-xs">
            {(["best", "record", "new"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "capitalize",
                  sort === s
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
            <span className="text-border">|</span>
            {(["all", "affirm", "deny"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  filter === f
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : f === "affirm" ? "Will happen" : "Won't"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* top-level composer */}
      <form onSubmit={submitTop} className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Join the conversation — cite sources where you can…"
          className="w-full rounded-md border bg-background p-2.5 text-sm outline-none focus:border-foreground"
        />
        <div className="mt-1.5 flex justify-end">
          <button
            disabled={pending || (signedIn && !body.trim())}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {signedIn ? "Comment" : "Sign in to comment"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        {shown.map((node) => (
          <CommentThread
            key={node.id}
            node={node}
            propositionId={propositionId}
            resolved={resolved}
            depth={0}
          />
        ))}
        {shown.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No comments {filter !== "all" ? "from this side " : ""}yet. Be the
            first.
          </p>
        )}
      </div>
    </section>
  );
}

function CommentThread({
  node,
  propositionId,
  resolved,
  depth,
}: {
  node: CommentNode;
  propositionId: number;
  resolved: boolean;
  depth: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  function vote(value: 1 | -1) {
    startTransition(async () => {
      const res = await voteComment(node.id, value, pathname);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      }
    });
  }

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await addComment(propositionId, replyBody, pathname, node.id);
      if (!res.ok && res.error === "sign-in-required") {
        router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (res.ok) {
        setReplyBody("");
        setReplying(false);
      }
    });
  }

  const initials = node.authorName.slice(0, 2).toUpperCase();

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
        <button
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center justify-center rounded-sm border p-0.5 hover:bg-accent"
          title="Expand thread"
        >
          <Plus className="size-3" />
        </button>
        <span className="font-medium text-ink-2">u/{node.authorName}</span>
        <span className="tabular-nums">
          {fmtCount(node.score)} point{Math.abs(node.score) === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span>{timeAgo(node.createdAt)}</span>
        {node.children.length > 0 && (
          <span className="italic">
            ({node.children.length} repl{node.children.length === 1 ? "y" : "ies"} hidden)
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      id={`comment-${node.id}`}
      className={cn("flex scroll-mt-20 gap-2", depth > 0 && "mt-3")}
    >
      {/* thread rail: avatar + collapsible line */}
      <div className="flex flex-col items-center">
        <a
          href={`/u/${node.authorId}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-accent font-mono text-[10px] font-medium uppercase text-ink-2"
        >
          {initials}
        </a>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse thread"
          className="group mt-1 flex w-full flex-1 justify-center px-2.5"
        >
          <span className="w-px self-stretch bg-border transition-colors group-hover:bg-ink-3" />
        </button>
      </div>

      <div className="min-w-0 flex-1 pb-2">
        {/* meta line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <a
            href={`/u/${node.authorId}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            u/{node.authorName}
          </a>
          <span className="text-muted-foreground">
            rep {fmtCount(node.authorReputation)}
          </span>
          {node.authorDomain && (
            <span
              className="text-st-pending-tx"
              title={`${node.authorDomain.label} track record — domain-specific, from resolved calls`}
            >
              {node.authorDomain.label.toLowerCase()}:{" "}
              {node.authorDomain.topPct !== null
                ? `top ${node.authorDomain.topPct}%`
                : "unscored"}{" "}
              · {node.authorDomain.resolved} resolved
            </span>
          )}
          {node.stance && (
            <span
              className={cn(
                "font-medium",
                node.stance === "affirm" ? "text-st-true-tx" : "text-st-false-tx",
              )}
            >
              {node.stance === "affirm" ? "said it'd happen" : "said it wouldn't"}
            </span>
          )}
          {resolved && node.calledIt && (
            <span className="font-semibold text-st-true-tx">✓ called it</span>
          )}
          <span className="text-muted-foreground">·</span>
          <a
            href={`/comments/${node.id}`}
            title="Permalink"
            className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
          >
            {timeAgo(node.createdAt)}
          </a>
        </div>

        {/* body */}
        <p className="mt-1 text-sm leading-relaxed">{node.body}</p>

        {node.stakedTo && (
          <p className="mt-1.5 text-xs">
            <span className="text-muted-foreground">Staked as a claim → </span>
            <a
              href={`/claims/${node.stakedTo.slug}`}
              className="font-medium underline decoration-border underline-offset-2 hover:decoration-foreground"
            >
              {node.stakedTo.statement}
            </a>
          </p>
        )}

        {/* action row */}
        <div className="mt-1.5 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center rounded-full border">
            <button
              onClick={() => vote(1)}
              disabled={pending}
              title="Upvote"
              className={cn(
                "rounded-l-full px-1.5 py-1 hover:bg-accent",
                node.myVote === 1
                  ? "text-st-partly"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowBigUp
                className="size-4"
                fill={node.myVote === 1 ? "currentColor" : "none"}
              />
            </button>
            <span
              className={cn(
                "min-w-5 text-center text-xs font-semibold tabular-nums",
                node.myVote === 1 && "text-st-partly",
                node.myVote === -1 && "text-st-pending",
              )}
            >
              {fmtCount(node.score)}
            </span>
            <button
              onClick={() => vote(-1)}
              disabled={pending}
              title="Downvote"
              className={cn(
                "rounded-r-full px-1.5 py-1 hover:bg-accent",
                node.myVote === -1
                  ? "text-st-pending"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowBigDown
                className="size-4"
                fill={node.myVote === -1 ? "currentColor" : "none"}
              />
            </button>
          </span>
          <button
            onClick={() => setReplying((r) => !r)}
            className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="size-3.5" /> Reply
          </button>
          {!node.stakedTo && (
            <a
              href={`/submit?stake=${node.id}`}
              title="Convert this assertion into a tracked proposition — by its author or a challenger"
              className="font-medium text-muted-foreground hover:text-foreground"
            >
              Stake it
            </a>
          )}
          {node.children.length > 0 && (
            <button
              onClick={() => setCollapsed(true)}
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            >
              <Minus className="size-3.5" /> Collapse
            </button>
          )}
        </div>

        {/* inline reply composer */}
        {replying && (
          <form onSubmit={submitReply} className="mt-2">
            <textarea
              autoFocus
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={2}
              placeholder={`Reply to u/${node.authorName}…`}
              className="w-full rounded-md border bg-background p-2 text-sm outline-none focus:border-foreground"
            />
            <div className="mt-1.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplying(false)}
                className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                disabled={pending || !replyBody.trim()}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </form>
        )}

        {/* children */}
        {node.children.length > 0 && (
          <div className="mt-1">
            {node.children.map((child) => (
              <CommentThread
                key={child.id}
                node={child}
                propositionId={propositionId}
                resolved={resolved}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
