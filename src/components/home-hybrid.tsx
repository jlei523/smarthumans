"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KEY = "sh-home-skin";

const SKINS = [
  { key: "soft", label: "Soft", cls: "soft" },
  { key: "broadsheet", label: "Broadsheet", cls: "broadsheet" },
  { key: "hybrid", label: "Hybrid", cls: "hybrid" },
  { key: "terminal", label: "Terminal", cls: "terminal" },
  { key: "clean", label: "Clean", cls: "clean" },
  { key: "brutal", label: "Ledger", cls: "brutal" },
] as const;

type SkinKey = (typeof SKINS)[number]["key"];

/**
 * Homepage-only skin previews, scoped to this wrapper:
 *  - Hybrid: broadsheet reading surfaces + terminal data surfaces
 *  - Clean:  light neutral, 14px-radius white cards, one indigo accent, all-sans
 *  - Ledger: pure black on white, 2px borders, zero radius, mono caps,
 *            solid color blocks behind verdicts — an official typed record
 */
export function HomeSkin({ children }: { children: React.ReactNode }) {
  const [skin, setSkin] = useState<SkinKey>("soft");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "default") {
        // legacy value from before Soft became the default
        localStorage.setItem(KEY, "soft");
      } else if (saved && SKINS.some((s) => s.key === saved)) {
        setSkin(saved as SkinKey);
      }
    } catch {
      /* private mode */
    }
  }, []);

  function pick(next: SkinKey) {
    setSkin(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode */
    }
  }

  const cls = SKINS.find((s) => s.key === skin)?.cls ?? "";

  return (
    <div className={cn(cls)}>
      {children}
      <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-wrap items-center overflow-hidden rounded-full border bg-card text-xs font-medium shadow-md">
        <span className="hidden px-2.5 py-1.5 text-muted-foreground sm:inline">
          Skin
        </span>
        {SKINS.map((s) => (
          <button
            key={s.key}
            onClick={() => pick(s.key)}
            title={
              s.key === "soft"
                ? "The default: paper warmth and serif voice with soft rounded cards and one indigo accent"
                : s.key === "broadsheet"
                  ? "Crisp broadsheet: pure white, hairline rules, sans labels"
                  : s.key === "hybrid"
                    ? "Broadsheet reading surfaces × terminal data surfaces"
                    : s.key === "terminal"
                      ? "Dark trading screen: mono data, market green/red, dense rows"
                      : s.key === "clean"
                        ? "Clean product: neutral, rounded, one indigo accent, all-sans"
                        : "Brutalist ledger: black on white, 2px rules, mono caps, no decoration"
            }
            className={cn(
              "px-2.5 py-1.5 transition-colors",
              skin === s.key
                ? "bg-foreground text-background"
                : "text-ink-2 hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
