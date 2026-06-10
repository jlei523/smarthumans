"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { List, GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClaimCard } from "@/components/claim-card";
import { StatusBadge, StatusDot } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_ORDER, STATUS_META, TYPE_LABEL, CATEGORY_LABEL } from "@/lib/status";
import { fmtDate } from "@/lib/format";
import type { Person, Proposition, Stance, ClaimStatus, ClaimType, Category } from "@/db/schema";

type Entry = {
  proposition: Proposition;
  stance: Stance;
  following?: boolean;
  myStance?: "affirm" | "deny" | null;
};

export function ClaimLedger({
  entries,
  person,
}: {
  entries: Entry[];
  person: Person;
}) {
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [sort, setSort] = useState<string>("followers");
  const [view, setView] = useState<"list" | "timeline">("list");

  const years = useMemo(
    () =>
      Array.from(
        new Set(entries.map((e) => e.stance.dateStated.slice(0, 4))),
      ).sort((a, b) => b.localeCompare(a)),
    [entries],
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(entries.map((e) => e.proposition.category))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    let list = entries.filter(
      (e) =>
        (status === "all" || e.proposition.status === status) &&
        (type === "all" || e.proposition.claimType === type) &&
        (category === "all" || e.proposition.category === category) &&
        (year === "all" || e.stance.dateStated.startsWith(year)),
    );
    list = [...list].sort((a, b) => {
      if (sort === "followers")
        return b.proposition.followerCount - a.proposition.followerCount;
      if (sort === "date")
        return b.stance.dateStated.localeCompare(a.stance.dateStated);
      if (sort === "deadline") {
        const da = a.proposition.deadline ?? "9999-12-31";
        const db = b.proposition.deadline ?? "9999-12-31";
        return da.localeCompare(db);
      }
      return 0;
    });
    return list;
  }, [entries, status, type, category, year, sort]);

  const timeline = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.stance.dateStated.localeCompare(b.stance.dateStated),
      ),
    [filtered],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger size="sm" className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(TYPE_LABEL) as ClaimType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABEL[c as Category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger size="sm" className="w-[110px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="followers">Most followed</SelectItem>
            <SelectItem value="date">Newest stated</SelectItem>
            <SelectItem value="deadline">Deadline soonest</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex rounded-md border p-0.5">
          <button
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
              view === "list"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-3.5" /> List
          </button>
          <button
            onClick={() => setView("timeline")}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
              view === "timeline"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GitCommitHorizontal className="size-3.5" /> Timeline
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground tabular-nums">
        {filtered.length} of {entries.length} claims
      </p>

      {view === "list" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {filtered.map((e) => (
            <ClaimCard
              key={e.proposition.id}
              proposition={e.proposition}
              stance={e.stance}
              person={person}
              showPerson={false}
              following={e.following}
              myStance={e.myStance}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No claims match these filters.
            </p>
          )}
        </div>
      ) : (
        <ol className="mt-4 relative border-l pl-6 space-y-5">
          {timeline.map((e) => (
            <li key={e.proposition.id} className="relative">
              <span className="absolute -left-[31px] top-1 flex items-center justify-center">
                <StatusDot status={e.proposition.status} className="size-3 ring-2 ring-background" />
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-meta">{fmtDate(e.stance.dateStated)}</span>
                <StatusBadge status={e.proposition.status} size="sm" />
              </div>
              <Link
                href={`/claims/${e.proposition.slug}`}
                className="mt-1 block font-serif text-sm font-semibold leading-snug hover:underline underline-offset-2"
              >
                {e.proposition.statement}
              </Link>
            </li>
          ))}
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">No claims match these filters.</p>
          )}
        </ol>
      )}
    </div>
  );
}
