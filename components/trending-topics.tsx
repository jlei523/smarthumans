"use client"

const trendingTopics = [
  { topic: "OpenAI IPO Valuation", predictions: 342 },
  { topic: "GPT-5 Release Date", predictions: 218 },
  { topic: "2026 Midterm Forecast", predictions: 194 },
  { topic: "Bitcoin $100K Again", predictions: 167 },
  { topic: "AI Regulation EU", predictions: 143 },
  { topic: "GTA 6 Sales Week 1", predictions: 98 },
]

const recentlyResolved = [
  { title: "GTA 6 delayed past 2025", result: "correct", resolvedAgo: "2mo" },
  { title: "Fed rate cut in Jan 2026", result: "incorrect", resolvedAgo: "3w" },
  { title: "Apple Vision Pro 2 in 2025", result: "correct", resolvedAgo: "1mo" },
]

export function TrendingTopics() {
  return (
    <div className="sticky top-16 space-y-6">
      <div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
          Trending Topics
        </span>
        <div className="space-y-0.5">
          {trendingTopics.map((item, index) => (
            <button
              key={item.topic}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 transition-colors text-left"
            >
              <span className="text-[10px] text-muted-foreground w-3 tabular-nums">{index + 1}</span>
              <span className="text-xs text-foreground flex-1 truncate">{item.topic}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{item.predictions}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border/30" />

      <div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
          Recently Resolved
        </span>
        <div className="space-y-0.5">
          {recentlyResolved.map((item) => (
            <button
              key={item.title}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 transition-colors text-left"
            >
              <span className={`text-[10px] ${item.result === "correct" ? "text-emerald-500/80" : "text-red-400/80"}`}>
                {item.result === "correct" ? "+" : "-"}
              </span>
              <span className="text-xs text-foreground/80 flex-1 truncate">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">{item.resolvedAgo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
