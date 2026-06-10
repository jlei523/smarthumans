import Link from "next/link";
import type { Metadata } from "next";
import { accuracyTextClass } from "@/components/charts";
import { TopicGlyph } from "@/components/topic-glyph";
import { getTopicsIndex } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse by topic",
  description: "Aggregate track records across all tracked figures, by domain.",
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const topics = await getTopicsIndex();
  return (
    <div className="mx-auto max-w-6xl px-4 py-9 pb-20">
      <p className="font-meta text-[11px] uppercase tracking-[0.14em] text-ink-3">
        Browse by topic
      </p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">
        Every claim, by domain
      </h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-3">
        Aggregate track records across all tracked figures. Accuracy is the
        resolved-true rate for every claim filed under a topic.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(({ category, scorecard }) => (
          <Link
            key={category}
            href={`/browse/${category}`}
            className="rounded-[11px] border bg-card p-[18px] shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="mb-3.5 flex items-start justify-between gap-3">
              <span className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[9px] bg-paper-2 text-foreground">
                  <TopicGlyph category={category} size={20} />
                </span>
                <span className="font-serif text-[19px] font-semibold">
                  {CATEGORY_LABEL[category]}
                </span>
              </span>
              <span className="text-right">
                <span
                  className={cn(
                    "block font-mono text-[17px] font-semibold tabular-nums",
                    accuracyTextClass(scorecard.accuracy),
                  )}
                >
                  {scorecard.accuracy === null
                    ? "—"
                    : `${Math.round(scorecard.accuracy * 100)}%`}
                </span>
                <span className="block text-[11px] italic text-ink-3">
                  accuracy
                </span>
              </span>
            </div>
            <p className="mt-3 font-mono text-xs text-ink-3 tabular-nums">
              {scorecard.total} tracked · {scorecard.resolved} resolved
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
