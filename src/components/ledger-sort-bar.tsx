"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Clock,
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClaimCard } from "@/components/claim-card";
import { StatusDot } from "@/components/status-badge";
import { DATE_RANGES, inDateRange, type DateRange } from "@/components/filters";
import { STATUS_META } from "@/lib/status";
import { deadlineLabel, fmtCount } from "@/lib/format";
import type { ClaimStatus, Person, Proposition, Stance } from "@/db/schema";

export type LedgerItem = {
  proposition: Proposition;
  stance: (Stance & { person?: Person }) | null;
  commentCount: number;
  following?: boolean;
  myStance?: "affirm" | "deny" | null;
};

export type LedgerSort = "trending" | "new" | "top" | "closing";

const SORTS: Array<{
  key: LedgerSort;
  label: string;
  icon: typeof Flame;
}> = [
  { key: "trending", label: "Trending", icon: Flame },
  { key: "new", label: "New", icon: Sparkles },
  { key: "top", label: "Top followed", icon: BarChart3 },
  { key: "closing", label: "Closing soon", icon: Clock },
];

/** Menu order per spec — resolved verdicts first, then open states. */
const STATUS_MENU: ClaimStatus[] = [
  "came_true",
  "partly_true",
  "didnt_come_true",
  "walked_back",
  "pending",
  "unverifiable",
  "disputed",
];

const isOpenStatus = (s: ClaimStatus) => s === "pending" || s === "disputed";

/**
 * LedgerSortBar — the sort-led filter header for every claim list.
 * Left cluster orders (Sort, then Date scope); right cluster scopes (Status).
 * One menu open at a time; selections persist to ?sort=&window=&status=.
 * Rows are ClaimCards whose trailing metric matches the active sort.
 */
export function LedgerSortBar({
  items,
  showPerson = true,
  showCategory = true,
  columns = 1,
  initialSort,
  initialWindow,
  initialStatus,
}: {
  items: LedgerItem[];
  showPerson?: boolean;
  showCategory?: boolean;
  columns?: 1 | 2 | 3;
  initialSort?: string;
  initialWindow?: string;
  initialStatus?: string;
}) {
  const [sort, setSort] = useState<LedgerSort>(
    SORTS.some((s) => s.key === initialSort)
      ? (initialSort as LedgerSort)
      : "trending",
  );
  // Default scope is This week per spec; fall back to All time when the
  // week is empty so a fresh page never opens blank.
  const [windowScope, setWindowScope] = useState<DateRange>(() => {
    if (DATE_RANGES.some((r) => r.key === initialWindow))
      return initialWindow as DateRange;
    return items.some((it) => inDateRange(it.stance?.dateStated, "week"))
      ? "week"
      : "all";
  });
  const [status, setStatus] = useState<ClaimStatus | "all">(
    STATUS_MENU.includes(initialStatus as ClaimStatus)
      ? (initialStatus as ClaimStatus)
      : "all",
  );
  const [openMenu, setOpenMenu] = useState<"sort" | "date" | "status" | null>(
    null,
  );
  // remember the scope while Closing soon hides it, restore on return
  const prevWindow = useRef<DateRange>(windowScope);
  const interacted = useRef(false);

  function pickSort(next: LedgerSort) {
    if (next === "closing" && sort !== "closing")
      prevWindow.current = windowScope;
    if (next !== "closing" && sort === "closing")
      setWindowScope(prevWindow.current);
    setSort(next);
  }

  // persist to URL (?sort=top&window=week&status=pending) without navigation
  useEffect(() => {
    if (!interacted.current) return;
    const p = new URLSearchParams(window.location.search);
    ["sort", "window", "status"].forEach((k) => p.delete(k));
    if (sort !== "trending") p.set("sort", sort);
    if (sort !== "closing" && windowScope !== "week")
      p.set("window", windowScope);
    if (status !== "all") p.set("status", status);
    const qs = p.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  }, [sort, windowScope, status]);

  const select = <T,>(setter: (v: T) => void) => (v: T) => {
    interacted.current = true;
    setter(v);
    setOpenMenu(null);
  };

  const dateScopeVisible = sort !== "closing";

  // scope first (window, or the closing-soon subset), then status
  const scoped = useMemo(() => {
    if (sort === "closing") {
      return items
        .filter(
          (it) => isOpenStatus(it.proposition.status) && it.proposition.deadline,
        )
        .sort((a, b) =>
          a.proposition.deadline!.localeCompare(b.proposition.deadline!),
        );
    }
    return items.filter((it) =>
      inDateRange(it.stance?.dateStated, windowScope),
    );
  }, [items, sort, windowScope]);

  const statusCounts = useMemo(() => {
    const c: Partial<Record<ClaimStatus, number>> = {};
    for (const it of scoped)
      c[it.proposition.status] = (c[it.proposition.status] ?? 0) + 1;
    return c;
  }, [scoped]);

  const shown = useMemo(() => {
    const list = scoped.filter(
      (it) => status === "all" || it.proposition.status === status,
    );
    if (sort === "closing") return list; // already deadline asc
    return [...list].sort((a, b) => {
      if (sort === "new")
        return (b.stance?.dateStated ?? "0000").localeCompare(
          a.stance?.dateStated ?? "0000",
        );
      if (sort === "top")
        return b.proposition.followerCount - a.proposition.followerCount;
      return (
        b.commentCount - a.commentCount ||
        b.proposition.followerCount - a.proposition.followerCount
      );
    });
  }, [scoped, status, sort]);

  // trailing row metric always matches the active sort
  const metricFor = (it: LedgerItem): string => {
    if (sort === "new") return it.stance?.dateStated.slice(0, 4) ?? "—";
    if (sort === "top") return `${fmtCount(it.proposition.followerCount)} following`;
    if (sort === "closing") return deadlineLabel(it.proposition.deadline);
    return `${it.commentCount} comment${it.commentCount === 1 ? "" : "s"}`;
  };

  const activeSort = SORTS.find((s) => s.key === sort)!;
  const SortIcon = activeSort.icon;
  const windowLabel = DATE_RANGES.find((r) => r.key === windowScope)!.label;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 max-sm:flex-col max-sm:items-stretch">
        {/* left cluster — ordering */}
        <div className="flex items-center gap-2 max-sm:w-full">
          <Menu
            id="sort"
            open={openMenu === "sort"}
            setOpen={(o) => setOpenMenu(o ? "sort" : null)}
            width="w-[212px]"
            align="left"
            trigger={
              <>
                <SortIcon className="size-3.5" aria-hidden />
                {activeSort.label}
                <ChevronDown className="size-3 opacity-70" aria-hidden />
              </>
            }
            triggerClass="border bg-card text-foreground shadow-xs hover:bg-paper-2"
          >
            {SORTS.map((s) => {
              const Icon = s.icon;
              return (
                <MenuItem
                  key={s.key}
                  active={sort === s.key}
                  onSelect={() => select(pickSort)(s.key)}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {s.label}
                  {sort === s.key && (
                    <Check className="ml-auto size-3.5" aria-hidden />
                  )}
                </MenuItem>
              );
            })}
          </Menu>

          {dateScopeVisible && (
            <Menu
              id="date"
              open={openMenu === "date"}
              setOpen={(o) => setOpenMenu(o ? "date" : null)}
              width="w-[160px]"
              align="left"
              trigger={
                <>
                  {windowLabel}
                  <ChevronDown className="size-3 opacity-70" aria-hidden />
                </>
              }
            >
              {DATE_RANGES.map((r) => (
                <MenuItem
                  key={r.key}
                  active={windowScope === r.key}
                  onSelect={() => select(setWindowScope)(r.key)}
                >
                  {r.label}
                  {windowScope === r.key && (
                    <Check className="ml-auto size-3.5" aria-hidden />
                  )}
                </MenuItem>
              ))}
            </Menu>
          )}
        </div>

        {/* right cluster — scoping */}
        <Menu
          id="status"
          open={openMenu === "status"}
          setOpen={(o) => setOpenMenu(o ? "status" : null)}
          width="w-[212px]"
          align="right"
          trigger={
            <>
              <span className="text-ink-3">Status:</span>
              {status === "all" ? "All" : STATUS_META[status].shortLabel}
              <ChevronDown className="size-3 opacity-70" aria-hidden />
            </>
          }
        >
          <MenuItem
            active={status === "all"}
            onSelect={() => select(setStatus)("all")}
          >
            All
            {status === "all" && (
              <Check className="ml-auto size-3.5" aria-hidden />
            )}
            <span
              className={cn(
                "font-mono text-[11px] text-ink-4 tabular-nums",
                status === "all" ? "" : "ml-auto",
              )}
            >
              {scoped.length}
            </span>
          </MenuItem>
          {STATUS_MENU.map((s) => (
            <MenuItem
              key={s}
              active={status === s}
              onSelect={() => select(setStatus)(s)}
            >
              <StatusDot status={s} className="size-2 shrink-0" />
              {STATUS_META[s].shortLabel}
              {status === s && (
                <Check className="ml-auto size-3.5" aria-hidden />
              )}
              <span
                className={cn(
                  "font-mono text-[11px] text-ink-4 tabular-nums",
                  status === s ? "" : "ml-auto",
                )}
              >
                {statusCounts[s] ?? 0}
              </span>
            </MenuItem>
          ))}
        </Menu>
      </div>

      {/* rows */}
      <div
        className={cn(
          "mt-4 grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {shown.map((it) => (
          <ClaimCard
            key={it.proposition.id}
            proposition={it.proposition}
            stance={it.stance}
            showPerson={showPerson}
            showCategory={showCategory}
            following={it.following}
            myStance={it.myStance}
            metric={metricFor(it)}
          />
        ))}
        {shown.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No claims match this filter.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Menu primitives — one open at a time, click-outside, keyboard, menuitemradio
// ---------------------------------------------------------------------------

function Menu({
  id,
  open,
  setOpen,
  trigger,
  triggerClass,
  width,
  align,
  children,
}: {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: React.ReactNode;
  triggerClass?: string;
  width: string;
  align: "left" | "right";
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, setOpen]);

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const itemEls = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
      ) ?? [],
    );
    const i = itemEls.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      itemEls[(i + 1) % itemEls.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itemEls[(i - 1 + itemEls.length) % itemEls.length]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative max-sm:flex-1">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[13px] font-medium transition-colors max-sm:min-h-11 max-sm:w-full max-sm:justify-center",
          triggerClass ??
            "text-ink-2 hover:bg-paper-2 hover:text-foreground",
        )}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={`${id}-menu`}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className={cn(
            "menu-pop absolute z-30 mt-1.5 rounded-[13px] border bg-card p-2 shadow-lg",
            width,
            align === "right" ? "right-0" : "left-0",
            "max-sm:left-0 max-sm:right-0 max-sm:w-auto",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  active,
  onSelect,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-left text-[13px] transition-colors hover:bg-paper-2 max-sm:min-h-11",
        active ? "font-medium text-foreground" : "text-ink-2",
      )}
    >
      {children}
    </button>
  );
}
