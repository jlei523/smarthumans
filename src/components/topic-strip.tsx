"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL } from "@/lib/status";
import type { Category } from "@/db/schema";

const TOPICS = (Object.keys(CATEGORY_LABEL) as Category[]).filter(
  (c) => c !== "other",
);

/** Thin topic nav under the header; scrolls horizontally when cramped. */
export function TopicStrip() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-0.5 overflow-x-auto px-4 text-[12.5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TOPICS.map((c) => {
          const active = pathname === `/browse/${c}`;
          return (
            <Link
              key={c}
              href={`/browse/${c}`}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-paper-3 font-semibold text-foreground"
                  : "text-ink-2 hover:bg-paper-2 hover:text-foreground",
              )}
            >
              {CATEGORY_LABEL[c]}
            </Link>
          );
        })}
        <Link
          href="/browse"
          className="ml-auto shrink-0 pl-3 text-xs text-muted-foreground whitespace-nowrap hover:text-foreground"
        >
          More →
        </Link>
      </div>
    </nav>
  );
}
