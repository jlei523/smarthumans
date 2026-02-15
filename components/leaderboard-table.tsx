"use client"

import { useState } from "react"
import { Trophy, Flame, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const leaderboardData = [
  {
    rank: 1,
    username: "quant_alpha",
    avatar: "/quant-avatar.jpg",
    accuracy: 94.2,
    predictions: 142,
    wins: 134,
    losses: 8,
    streak: 12,
    avgReturn: "+34.2%",
    elo: 2847,
    tier: "diamond",
    change: "up",
    badges: ["top-1%", "streak-master"],
  },
  {
    rank: 2,
    username: "ai_value_investor",
    avatar: "/investor-avatar.png",
    accuracy: 87.3,
    predictions: 267,
    wins: 233,
    losses: 34,
    streak: 8,
    avgReturn: "+28.7%",
    elo: 2654,
    tier: "diamond",
    change: "same",
    badges: ["volume-king"],
  },
  {
    rank: 3,
    username: "tech_oracle_23",
    avatar: "/analyst-avatar.png",
    accuracy: 82.1,
    predictions: 89,
    wins: 73,
    losses: 16,
    streak: 5,
    avgReturn: "+22.4%",
    elo: 2412,
    tier: "platinum",
    change: "up",
    badges: ["rising-star"],
  },
  {
    rank: 4,
    username: "market_whisper",
    avatar: "/retail-trader-avatar.jpg",
    accuracy: 79.6,
    predictions: 312,
    wins: 248,
    losses: 64,
    streak: 3,
    avgReturn: "+19.8%",
    elo: 2287,
    tier: "platinum",
    change: "down",
    badges: ["veteran"],
  },
  {
    rank: 5,
    username: "auradragon1",
    avatar: "/dragon-avatar.jpg",
    accuracy: 78.3,
    predictions: 46,
    wins: 36,
    losses: 10,
    streak: 6,
    avgReturn: "+24.1%",
    elo: 2156,
    tier: "platinum",
    change: "up",
    badges: ["hot-streak"],
  },
  {
    rank: 6,
    username: "deep_value_plays",
    avatar: "/investor-avatar-male.jpg",
    accuracy: 76.8,
    predictions: 178,
    wins: 137,
    losses: 41,
    streak: 2,
    avgReturn: "+17.3%",
    elo: 2034,
    tier: "gold",
    change: "same",
    badges: [],
  },
  {
    rank: 7,
    username: "neural_trader",
    avatar: "/tech-trader-avatar.jpg",
    accuracy: 75.2,
    predictions: 94,
    wins: 71,
    losses: 23,
    streak: 4,
    avgReturn: "+15.9%",
    elo: 1978,
    tier: "gold",
    change: "up",
    badges: ["consistent"],
  },
  {
    rank: 8,
    username: "macro_mind",
    avatar: "/economist-avatar.png",
    accuracy: 73.4,
    predictions: 203,
    wins: 149,
    losses: 54,
    streak: 1,
    avgReturn: "+14.2%",
    elo: 1892,
    tier: "gold",
    change: "down",
    badges: [],
  },
  {
    rank: 9,
    username: "alpha_seeker",
    avatar: "/finance-professional-avatar.png",
    accuracy: 71.9,
    predictions: 67,
    wins: 48,
    losses: 19,
    streak: 3,
    avgReturn: "+12.8%",
    elo: 1845,
    tier: "gold",
    change: "same",
    badges: [],
  },
  {
    rank: 10,
    username: "momentum_master",
    avatar: "/day-trader-avatar.jpg",
    accuracy: 70.5,
    predictions: 456,
    wins: 321,
    losses: 135,
    streak: 0,
    avgReturn: "+11.4%",
    elo: 1789,
    tier: "silver",
    change: "down",
    badges: ["high-volume"],
  },
]

const tierConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  diamond: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", label: "Diamond" },
  platinum: { bg: "bg-slate-300/10", text: "text-slate-300", border: "border-slate-400/30", label: "Platinum" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", label: "Gold" },
  silver: { bg: "bg-gray-400/10", text: "text-gray-400", border: "border-gray-500/30", label: "Silver" },
}

const badgeConfig: Record<string, { label: string; color: string }> = {
  "top-1%": { label: "Top 1%", color: "bg-cyan-500/20 text-cyan-400" },
  "streak-master": { label: "Streak Master", color: "bg-orange-500/20 text-orange-400" },
  "volume-king": { label: "Volume King", color: "bg-purple-500/20 text-purple-400" },
  "rising-star": { label: "Rising Star", color: "bg-emerald-500/20 text-emerald-400" },
  veteran: { label: "Veteran", color: "bg-blue-500/20 text-blue-400" },
  "hot-streak": { label: "Hot Streak", color: "bg-red-500/20 text-red-400" },
  consistent: { label: "Consistent", color: "bg-green-500/20 text-green-400" },
  "high-volume": { label: "High Volume", color: "bg-indigo-500/20 text-indigo-400" },
}

export function LeaderboardTable() {
  const [sortBy, setSortBy] = useState<string>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort("rank")}
              >
                <div className="flex items-center gap-1">
                  Rank <SortIcon column="rank" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort("accuracy")}
              >
                <div className="flex items-center gap-1">
                  Accuracy <SortIcon column="accuracy" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort("predictions")}
              >
                <div className="flex items-center gap-1">
                  Predictions <SortIcon column="predictions" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                W/L
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort("streak")}
              >
                <div className="flex items-center gap-1">
                  Streak <SortIcon column="streak" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Return
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => handleSort("elo")}
              >
                <div className="flex items-center gap-1">
                  ELO <SortIcon column="elo" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr
                key={user.username}
                className={cn(
                  "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                  index < 3 && "bg-secondary/20",
                )}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {user.rank === 1 ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      </div>
                    ) : user.rank === 2 ? (
                      <div className="w-8 h-8 rounded-full bg-slate-400/20 flex items-center justify-center">
                        <Medal className="w-4 h-4 text-slate-400" />
                      </div>
                    ) : user.rank === 3 ? (
                      <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
                        <Medal className="w-4 h-4 text-amber-600" />
                      </div>
                    ) : (
                      <span className="w-8 text-center font-bold text-muted-foreground">{user.rank}</span>
                    )}
                    {user.change === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {user.change === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/user/${user.username}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground hover:underline">u/{user.username}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                            tierConfig[user.tier].bg,
                            tierConfig[user.tier].text,
                          )}
                        >
                          {tierConfig[user.tier].label}
                        </span>
                      </div>
                      {user.badges.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.badges.map((badge) => (
                            <span
                              key={badge}
                              className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", badgeConfig[badge]?.color)}
                            >
                              {badgeConfig[badge]?.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          user.accuracy >= 80
                            ? "bg-emerald-500"
                            : user.accuracy >= 70
                              ? "bg-yellow-500"
                              : "bg-orange-500",
                        )}
                        style={{ width: `${user.accuracy}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        user.accuracy >= 80
                          ? "text-emerald-500"
                          : user.accuracy >= 70
                            ? "text-yellow-500"
                            : "text-orange-500",
                      )}
                    >
                      {user.accuracy}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-foreground">{user.predictions}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-emerald-500 font-medium">{user.wins}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-red-500 font-medium">{user.losses}</span>
                </td>
                <td className="px-4 py-4">
                  {user.streak > 0 ? (
                    <div className="flex items-center gap-1">
                      <Flame
                        className={cn("w-4 h-4", user.streak >= 5 ? "text-orange-500" : "text-muted-foreground")}
                      />
                      <span className={cn("font-medium", user.streak >= 5 ? "text-orange-500" : "text-foreground")}>
                        {user.streak}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-emerald-500 font-medium">{user.avgReturn}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Trophy className={cn("w-4 h-4", tierConfig[user.tier].text)} />
                    <span className={cn("font-semibold", tierConfig[user.tier].text)}>{user.elo}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Showing 1-10 of 8,429 predictors</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-secondary text-muted-foreground rounded-lg text-sm hover:text-foreground transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">Next</button>
        </div>
      </div>
    </div>
  )
}
