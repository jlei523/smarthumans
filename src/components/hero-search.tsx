"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PersonAvatar } from "@/components/person-chip";
import { cn } from "@/lib/utils";

export type FigureHit = {
  slug: string;
  name: string;
  domainLabel: string;
  claims: number;
  accuracy: number | null;
  imageUrl: string | null;
};

export function HeroSearch({
  figures,
  className,
}: {
  figures: FigureHit[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = q.trim()
    ? figures.filter((f) =>
        f.name.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : figures;

  return (
    <div className={cn("relative", className)}>
      <form
        role="search"
        className="flex items-center gap-2 rounded-xl border bg-card p-2 pl-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <Search className="size-5 shrink-0 text-ink-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          placeholder="Search anyone on the record…"
          autoComplete="off"
          className="h-9 w-full bg-transparent text-base outline-none placeholder:text-ink-3"
        />
        <button className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
          Search
        </button>
      </form>

      {open && filtered.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border bg-popover text-left shadow-lg">
          <p className="border-b px-4 py-2 font-meta text-[10px] uppercase tracking-wider text-ink-3">
            Most-tracked people
          </p>
          <ul>
            {filtered.slice(0, 5).map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/p/${f.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent"
                >
                  <PersonAvatar person={{ name: f.name, isAgent: false, imageUrl: f.imageUrl }} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{f.name}</span>
                    <span className="block text-xs text-ink-3">
                      {f.domainLabel} · {f.claims} claims tracked
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold tabular-nums",
                      f.accuracy === null
                        ? "text-ink-3"
                        : f.accuracy >= 0.6
                          ? "text-st-true-tx"
                          : f.accuracy >= 0.4
                            ? "text-st-partly-tx"
                            : "text-st-false-tx",
                    )}
                  >
                    {f.accuracy === null
                      ? "new"
                      : `${(f.accuracy * 100).toFixed(1)}%`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
