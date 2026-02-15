"use client"

import Link from "next/link"

const topPredictors = [
  { username: "quant_alpha", avatar: "/quant-avatar.jpg", accuracy: 87 },
  { username: "ai_value_investor", avatar: "/investor-avatar.png", accuracy: 82 },
  { username: "tech_oracle_23", avatar: "/analyst-avatar.png", accuracy: 79 },
  { username: "market_whisper", avatar: "/retail-trader-avatar.jpg", accuracy: 76 },
  { username: "signal_drift", avatar: "/dragon-avatar.jpg", accuracy: 74 },
]

const topFigures = [
  { name: "Jim Cramer", slug: "jim-cramer", avatar: "/jim-cramer-tv-host.jpg", accuracy: 47 },
  { name: "Cathie Wood", slug: "cathie-wood", avatar: "/cathie-wood-ark-invest.jpg", accuracy: 58 },
  { name: "Nate Silver", slug: "nate-silver", avatar: "/nate-silver-statistician.jpg", accuracy: 82 },
]

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
    <div className="sticky top-16 space-y-5">
      {/* Top Predictors */}
      <div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
          Top Predictors
        </span>
        <div className="space-y-0.5">
          {topPredictors.map((predictor, index) => (
            <Link
              key={predictor.username}
              href={`/user/${predictor.username}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-secondary/40"
            >
              <span className="text-[10px] text-muted-foreground w-3 tabular-nums">{index + 1}</span>
              <img
                src={predictor.avatar || "/placeholder.svg"}
                alt={predictor.username}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-foreground truncate flex-1">{predictor.username}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{predictor.accuracy}%</span>
            </Link>
          ))}
        </div>
        <Link href="/leaderboard" className="block px-2 mt-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          View leaderboard
        </Link>
      </div>

      <div className="h-px bg-border/30" />

      {/* Public Figures */}
      <div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
          Public Figures
        </span>
        <div className="space-y-0.5">
          {topFigures.map((figure) => (
            <Link
              key={figure.slug}
              href={`/figure/${figure.slug}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-secondary/40"
            >
              <img
                src={figure.avatar || "/placeholder.svg"}
                alt={figure.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-foreground truncate flex-1">{figure.name}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{figure.accuracy}%</span>
            </Link>
          ))}
        </div>
        <Link href="/figures" className="block px-2 mt-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          View all figures
        </Link>
      </div>

      <div className="h-px bg-border/30" />

      {/* Trending Topics */}
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

      {/* Recently Resolved */}
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
