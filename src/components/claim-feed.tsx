"use client";

import { useState } from "react";
import { ClaimCard } from "@/components/claim-card";
import { cn } from "@/lib/utils";
import type { Person, Proposition, Stance } from "@/db/schema";

export type FeedItem = {
  proposition: Proposition;
  stance: (Stance & { person: Person }) | null;
  following: boolean;
  myStance: "affirm" | "deny" | null;
};

export type FeedTab = {
  key: string;
  label: string;
  sub: string;
  items: FeedItem[];
};

/**
 * One claim list, one card design — the feeds (recently resolved, most
 * followed, trending) are just filters over it.
 */
export function ClaimFeed({ tabs }: { tabs: FeedTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                t.key === current.key
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{current.sub}</span>
      </div>
      <div className="mt-4 space-y-3">
        {current.items.map((it) => (
          <ClaimCard
            key={it.proposition.id}
            proposition={it.proposition}
            stance={it.stance}
            following={it.following}
            myStance={it.myStance}
          />
        ))}
        {current.items.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        )}
      </div>
    </section>
  );
}
