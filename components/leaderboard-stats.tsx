"use client"

import { Trophy, Target, TrendingUp, Users } from "lucide-react"

const stats = [
  {
    label: "Total Predictions",
    value: "24,847",
    change: "+1,234 this week",
    icon: Target,
    color: "text-primary",
  },
  {
    label: "Avg Accuracy",
    value: "62.3%",
    change: "+2.1% from last month",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    label: "Active Predictors",
    value: "8,429",
    change: "of 87,429 members",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "Top Accuracy",
    value: "94.2%",
    change: "by u/quant_alpha",
    icon: Trophy,
    color: "text-yellow-500",
  },
]

export function LeaderboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
