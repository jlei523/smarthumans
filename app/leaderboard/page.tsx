import { Header } from "@/components/header"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LeaderboardFilters } from "@/components/leaderboard-filters"
import { LeaderboardStats } from "@/components/leaderboard-stats"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Prediction Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">
            Top predictors ranked by accuracy, predictions, and consistency across all topics.
          </p>
        </div>

        <LeaderboardStats />
        <LeaderboardFilters />
        <LeaderboardTable />
      </div>
    </div>
  )
}
