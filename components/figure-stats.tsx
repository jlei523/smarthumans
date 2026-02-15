"use client"

import { TrendingUp, TrendingDown, Target, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FigureStatsData {
  accuracyByCategory: { category: string; accuracy: number; count: number }[]
  accuracyOverTime: { period: string; accuracy: number }[]
  recentStreak: ("W" | "L" | "P")[]
  averageConfidence: number
  bestCategory: string
  worstCategory: string
}

const figureStatsData: Record<string, FigureStatsData> = {
  "jim-cramer": {
    accuracyByCategory: [
      { category: "Tech Stocks", accuracy: 42, count: 523 },
      { category: "Finance", accuracy: 51, count: 312 },
      { category: "Energy", accuracy: 48, count: 198 },
      { category: "Healthcare", accuracy: 55, count: 156 },
      { category: "Retail", accuracy: 38, count: 58 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 45 },
      { period: "2021", accuracy: 52 },
      { period: "2022", accuracy: 41 },
      { period: "2023", accuracy: 49 },
      { period: "2024", accuracy: 47 },
    ],
    recentStreak: ["L", "W", "L", "L", "W", "L", "W", "L", "L", "W"],
    averageConfidence: 82,
    bestCategory: "Healthcare",
    worstCategory: "Retail",
  },
  "cathie-wood": {
    accuracyByCategory: [
      { category: "Tech", accuracy: 35, count: 156 },
      { category: "Genomics", accuracy: 28, count: 78 },
      { category: "Crypto", accuracy: 45, count: 54 },
      { category: "Autonomous", accuracy: 32, count: 42 },
      { category: "Fintech", accuracy: 41, count: 12 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 68 },
      { period: "2021", accuracy: 45 },
      { period: "2022", accuracy: 22 },
      { period: "2023", accuracy: 35 },
      { period: "2024", accuracy: 38 },
    ],
    recentStreak: ["L", "L", "W", "L", "P", "L", "W", "L", "L", "L"],
    averageConfidence: 89,
    bestCategory: "Crypto",
    worstCategory: "Genomics",
  },
  "nate-silver": {
    accuracyByCategory: [
      { category: "Elections", accuracy: 87, count: 89 },
      { category: "Sports", accuracy: 76, count: 34 },
      { category: "Economics", accuracy: 72, count: 23 },
      { category: "Tech", accuracy: 68, count: 10 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 78 },
      { period: "2021", accuracy: 81 },
      { period: "2022", accuracy: 85 },
      { period: "2023", accuracy: 82 },
      { period: "2024", accuracy: 84 },
    ],
    recentStreak: ["W", "W", "W", "L", "W", "W", "P", "W", "W", "L"],
    averageConfidence: 65,
    bestCategory: "Elections",
    worstCategory: "Tech",
  },
  "elon-musk": {
    accuracyByCategory: [
      { category: "Tesla Timelines", accuracy: 12, count: 156 },
      { category: "SpaceX", accuracy: 45, count: 89 },
      { category: "AI Predictions", accuracy: 28, count: 67 },
      { category: "Crypto", accuracy: 34, count: 98 },
      { category: "Twitter/X", accuracy: 21, count: 77 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 28 },
      { period: "2021", accuracy: 31 },
      { period: "2022", accuracy: 19 },
      { period: "2023", accuracy: 22 },
      { period: "2024", accuracy: 24 },
    ],
    recentStreak: ["L", "L", "L", "W", "L", "L", "P", "L", "W", "L"],
    averageConfidence: 94,
    bestCategory: "SpaceX",
    worstCategory: "Tesla Timelines",
  },
  "ray-dalio": {
    accuracyByCategory: [
      { category: "Macro", accuracy: 72, count: 89 },
      { category: "Bonds", accuracy: 68, count: 45 },
      { category: "Currency", accuracy: 65, count: 34 },
      { category: "Equity Markets", accuracy: 61, count: 35 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 65 },
      { period: "2021", accuracy: 68 },
      { period: "2022", accuracy: 71 },
      { period: "2023", accuracy: 67 },
      { period: "2024", accuracy: 69 },
    ],
    recentStreak: ["W", "W", "L", "W", "W", "W", "L", "W", "P", "W"],
    averageConfidence: 72,
    bestCategory: "Macro",
    worstCategory: "Equity Markets",
  },
  "bill-ackman": {
    accuracyByCategory: [
      { category: "Activist Plays", accuracy: 67, count: 45 },
      { category: "Short Positions", accuracy: 52, count: 23 },
      { category: "Long Positions", accuracy: 61, count: 78 },
      { category: "Macro Calls", accuracy: 54, count: 32 },
    ],
    accuracyOverTime: [
      { period: "2020", accuracy: 71 },
      { period: "2021", accuracy: 58 },
      { period: "2022", accuracy: 55 },
      { period: "2023", accuracy: 59 },
      { period: "2024", accuracy: 57 },
    ],
    recentStreak: ["W", "L", "W", "W", "L", "W", "L", "W", "W", "P"],
    averageConfidence: 78,
    bestCategory: "Activist Plays",
    worstCategory: "Short Positions",
  },
}

export function FigureStats({ slug }: { slug: string }) {
  const stats = figureStatsData[slug] || figureStatsData["jim-cramer"]

  return (
    <div className="space-y-4">
      {/* Accuracy by category */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Accuracy by Category
        </h3>
        <div className="space-y-3">
          {stats.accuracyByCategory.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{cat.category}</span>
                <span
                  className={cn(
                    "font-medium",
                    cat.accuracy >= 60 ? "text-emerald-500" : cat.accuracy >= 40 ? "text-amber-500" : "text-red-500",
                  )}
                >
                  {cat.accuracy}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    cat.accuracy >= 60 ? "bg-emerald-500" : cat.accuracy >= 40 ? "bg-amber-500" : "bg-red-500",
                  )}
                  style={{ width: `${cat.accuracy}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{cat.count} predictions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent streak */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Recent Predictions
        </h3>
        <div className="flex gap-1">
          {stats.recentStreak.map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                result === "W"
                  ? "bg-emerald-500/20 text-emerald-500"
                  : result === "L"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-amber-500/20 text-amber-500",
              )}
            >
              {result}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Last 10 resolved predictions</p>
      </div>

      {/* Performance overview */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Yearly Performance
        </h3>
        <div className="space-y-2">
          {stats.accuracyOverTime.map((period) => (
            <div key={period.period} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{period.period}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      period.accuracy >= 60 ? "bg-emerald-500" : period.accuracy >= 40 ? "bg-amber-500" : "bg-red-500",
                    )}
                    style={{ width: `${period.accuracy}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "w-10 text-right font-medium",
                    period.accuracy >= 60
                      ? "text-emerald-500"
                      : period.accuracy >= 40
                        ? "text-amber-500"
                        : "text-red-500",
                  )}
                >
                  {period.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key insights */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Best Category</p>
              <p className="text-xs text-muted-foreground">{stats.bestCategory}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Worst Category</p>
              <p className="text-xs text-muted-foreground">{stats.worstCategory}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Avg Confidence</p>
              <p className="text-xs text-muted-foreground">{stats.averageConfidence}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
