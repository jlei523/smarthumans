"use client";

import { useMemo, useRef, useState } from "react";
import { PersonAvatar } from "@/components/person-chip";
import { DOMAIN_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

export type PersonOption = {
  name: string;
  domain?: string;
  imageUrl?: string | null;
};

/**
 * Type-ahead person search for "Who said it?" fields. Matching tracked
 * people show with photo and domain; anything else can be added as a new
 * person (created on approval — anyone on the record).
 */
export function PersonSearchInput({
  value,
  onChange,
  people,
  placeholder = "Search people…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  people: PersonOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = value.trim().toLowerCase();
  const matches = useMemo(
    () =>
      (q
        ? people.filter((p) => p.name.toLowerCase().includes(q))
        : people
      ).slice(0, 6),
    [people, q],
  );
  const exact = matches.some((m) => m.name.toLowerCase() === q);
  const showAddRow = q.length > 1 && !exact;
  const rows = matches.length + (showAddRow ? 1 : 0);

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || rows === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % rows);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + rows) % rows);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight < matches.length) pick(matches[highlight].name);
      else setOpen(false); // keep the typed name as a new person
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {open && rows > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border bg-popover shadow-lg">
          <ul>
            {matches.map((p, i) => (
              <li key={p.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p.name)}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left",
                    highlight === i && "bg-accent",
                  )}
                >
                  <PersonAvatar
                    person={{ name: p.name, isAgent: false, imageUrl: p.imageUrl ?? null }}
                    size="md"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {p.name}
                  </span>
                  {p.domain && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {DOMAIN_LABEL[p.domain] ?? p.domain}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {showAddRow && (
              <li className={cn(matches.length > 0 && "border-t")}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setHighlight(matches.length)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left",
                    highlight === matches.length && "bg-accent",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed text-ink-3">
                    +
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    Add <span className="font-medium">“{value.trim()}”</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — new to the record
                    </span>
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
