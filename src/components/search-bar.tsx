"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "@/components/person-chip";
import { StatusDot } from "@/components/status-badge";
import { DOMAIN_LABEL } from "@/lib/status";
import type { ClaimStatus, Person } from "@/db/schema";

type Suggestions = {
  people: Array<{
    slug: string;
    name: string;
    domain: Person["domain"];
    imageUrl: string | null;
    isAgent: boolean;
  }>;
  claims: Array<{ slug: string; title: string; status: ClaimStatus }>;
};

const EMPTY: Suggestions = { people: [], claims: [] };

/**
 * Site search with autocomplete: figures and claims suggested as you type
 * (debounced /api/suggest), full results on submit. ↑↓ to move, Enter to
 * open, Esc to dismiss.
 */
export function SearchBar({
  size = "md",
  placeholder = "Search anyone or any claim…",
  className,
}: {
  size?: "md" | "lg";
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sugg, setSugg] = useState<Suggestions>(EMPTY);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // debounced suggestion fetch
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setSugg(EMPTY);
      setActive(-1);
      return;
    }
    timer.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q.trim())}`, {
          signal: ctrl.signal,
        });
        if (res.ok) setSugg(await res.json());
      } catch {
        /* aborted or offline — keep last suggestions */
      }
    }, 150);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  // click-outside closes
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // flattened option list: people, claims, then "see all results"
  const options: Array<{ key: string; href: string }> = [
    ...sugg.people.map((p) => ({ key: `p-${p.slug}`, href: `/p/${p.slug}` })),
    ...sugg.claims.map((c) => ({ key: `c-${c.slug}`, href: `/claims/${c.slug}` })),
    ...(q.trim().length >= 2
      ? [{ key: "all", href: `/search?q=${encodeURIComponent(q.trim())}` }]
      : []),
  ];
  const showMenu = open && q.trim().length >= 2 && options.length > 0;

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showMenu) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(options[active].href);
    }
  }

  const itemCls = (i: number) =>
    cn(
      "flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px]",
      i === active ? "bg-paper-2 text-foreground" : "text-ink-2",
    );

  let i = -1;

  return (
    <form
      ref={rootRef}
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && showMenu) return go(options[active].href);
        if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "left-3 size-5" : "left-3.5 size-[17px]",
        )}
      />
      <input
        name="q"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showMenu}
        aria-controls="search-suggest"
        className={cn(
          "w-full rounded-full border outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
          size === "lg"
            ? "h-14 bg-background pl-11 pr-5 text-lg shadow-sm"
            : "h-10 bg-card pl-10 pr-4 text-[15px] shadow-xs",
        )}
      />

      {showMenu && (
        <div
          id="search-suggest"
          role="listbox"
          className="menu-pop absolute left-0 right-0 z-40 mt-1.5 rounded-[13px] border bg-card p-2 shadow-lg"
        >
          {sugg.people.length > 0 && (
            <p className="px-2.5 pb-1 pt-1 font-meta text-[10px] uppercase tracking-[0.12em] text-ink-4">
              Figures
            </p>
          )}
          {sugg.people.map((p) => {
            i++;
            const idx = i;
            return (
              <button
                key={p.slug}
                type="button"
                role="option"
                aria-selected={idx === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(idx)}
                onClick={() => go(`/p/${p.slug}`)}
                className={itemCls(idx)}
              >
                <PersonAvatar person={p} size="md" />
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {p.name}
                </span>
                <span className="shrink-0 text-[11px] text-ink-3">
                  {DOMAIN_LABEL[p.domain]}
                </span>
              </button>
            );
          })}
          {sugg.claims.length > 0 && (
            <p className="px-2.5 pb-1 pt-2 font-meta text-[10px] uppercase tracking-[0.12em] text-ink-4">
              Claims
            </p>
          )}
          {sugg.claims.map((c) => {
            i++;
            const idx = i;
            return (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={idx === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(idx)}
                onClick={() => go(`/claims/${c.slug}`)}
                className={itemCls(idx)}
              >
                <StatusDot status={c.status} className="size-2 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
              </button>
            );
          })}
          {(() => {
            i++;
            const idx = i;
            return (
              <button
                type="button"
                role="option"
                aria-selected={idx === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(idx)}
                onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
                className={cn(itemCls(idx), "mt-1 border-t pt-2 font-medium")}
              >
                <Search className="size-3.5 shrink-0 text-ink-3" />
                All results for “{q.trim()}”
              </button>
            );
          })()}
        </div>
      )}
    </form>
  );
}
