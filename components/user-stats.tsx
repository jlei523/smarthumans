"use client"

import { Trophy, Target, Flame, Calendar, Award, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

const usersStats: Record<
  string,
  {
    elo: number
    tier: string
    accuracyByTopic: { topic: string; accuracy: number; predictions: number }[]
    recentStreak: { result: "W" | "L" }[]
    monthlyPerformance: { month: string; accuracy: number }[]
  }
> = {
  auradragon1: {
    elo: 2156,
    tier: "platinum",
    accuracyByTopic: [
      { topic: "AI Stocks", accuracy: 82, predictions: 28 },
      { topic: "Semiconductors", accuracy: 75, predictions: 12 },
      { topic: "Enterprise Tech", accuracy: 71, predictions: 6 },
    ],
    recentStreak: [
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "L" },
      { result: "W" },
      { result: "W" },
      { result: "L" },
    ],
    monthlyPerformance: [
      { month: "Jul", accuracy: 70 },
      { month: "Aug", accuracy: 75 },
      { month: "Sep", accuracy: 80 },
      { month: "Oct", accuracy: 78 },
      { month: "Nov", accuracy: 85 },
      { month: "Dec", accuracy: 82 },
    ],
  },
  quant_alpha: {
    elo: 2847,
    tier: "diamond",
    accuracyByTopic: [
      { topic: "AI Stocks", accuracy: 96, predictions: 89 },
      { topic: "Semiconductors", accuracy: 92, predictions: 34 },
      { topic: "Cloud Computing", accuracy: 88, predictions: 19 },
    ],
    recentStreak: [
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
      { result: "W" },
    ],
    monthlyPerformance: [
      { month: "Jul", accuracy: 92 },
      { month: "Aug", accuracy: 95 },
      { month: "Sep", accuracy: 94 },
      { month: "Oct", accuracy: 96 },
      { month: "Nov", accuracy: 93 },
      { month: "Dec", accuracy: 95 },
    ],
  },
}

const defaultStats = {
  elo: 1500,
  tier: "gold",
  accuracyByTopic: [{ topic: "General", accuracy: 70, predictions: 10 }],
  recentStreak: [
    { result: "W" as const },
    { result: "L" as const },
    { result: "W" as const },
    { result: "W" as const },
    { result: "L" as const },
  ],
  monthlyPerformance: [
    { month: "Nov", accuracy: 68 },
    { month: "Dec", accuracy: 72 },
  ],
}

const tierConfig: Record<string, { text: string; next: string; threshold: number }> = {
  diamond: { text: "text-cyan-400", next: "Legend", threshold: 3000 },
  platinum: { text: "text-slate-300", next: "Diamond", threshold: 2500 },
  gold: { text: "text-yellow-500", next: "Platinum", threshold: 2000 },
  silver: { text: "text-gray-400", next: "Gold", threshold: 1500 },
  bronze: { text: "text-orange-400", next: "Silver", threshold: 1200 },
}

export function UserStats({ username }: { username: string }) {
  const stats = usersStats[username] || defaultStats
  const tier = tierConfig[stats.tier]
  const progressToNext = ((stats.elo % 500) / 500) * 100

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className={cn("w-5 h-5", tier.text)} />
          <h3 className="font-semibold">ELO Rating</h3>
        </div>
        <div className="text-center mb-4">
          <div className={cn("text-4xl font-bold", tier.text)}>{stats.elo}</div>
          <div className="text-sm text-muted-foreground mt-1 capitalize">{stats.tier} Tier</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {tier.next}</span>
            <span>{tier.threshold - stats.elo} points needed</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Accuracy by Topic</h3>
        </div>
        <div className="space-y-3">
          {stats.accuracyByTopic.map((topic) => (
            <div key={topic.topic}>
              <div className="flex justify-between text-sm mb-1">
                <span>{topic.topic}</span>
                <span className="font-medium">{topic.accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={topic.accuracy}
                  className={cn(
                    "h-2 flex-1",
                    topic.accuracy >= 80
                      ? "[&>div]:bg-emerald-500"
                      : topic.accuracy >= 70
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-orange-500",
                  )}
                />
                <span className="text-xs text-muted-foreground w-16 text-right">{topic.predictions} calls</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold">Recent Results</h3>
        </div>
        <div className="flex gap-1 justify-center">
          {stats.recentStreak.map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold",
                result.result === "W" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500",
              )}
            >
              {result.result}
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">Last 10 predictions</div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Monthly Trend</h3>
        </div>
        <div className="flex items-end justify-between gap-1 h-24">
          {stats.monthlyPerformance.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-t transition-all",
                  month.accuracy >= 80 ? "bg-emerald-500" : month.accuracy >= 70 ? "bg-yellow-500" : "bg-orange-500",
                )}
                style={{ height: `${month.accuracy}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/leaderboard"
        className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <span className="font-medium">View Full Leaderboard</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>
    </div>
  )
}
