"use client"

import { Trophy, Flame, Calendar, Target, TrendingUp, Award, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const usersData: Record<
  string,
  {
    username: string
    avatar: string
    bio: string
    joinDate: string
    tier: string
    elo: number
    accuracy: number
    predictions: number
    wins: number
    losses: number
    streak: number
    avgReturn: string
    badges: string[]
    rank: number
    topicRank: number
  }
> = {
  quant_alpha: {
    username: "quant_alpha",
    avatar: "/quant-avatar.jpg",
    bio: "Quantitative analyst specializing in AI/ML sector predictions. Former hedge fund researcher. Data-driven approach to market analysis.",
    joinDate: "Jan 2023",
    tier: "diamond",
    elo: 2847,
    accuracy: 94.2,
    predictions: 142,
    wins: 134,
    losses: 8,
    streak: 12,
    avgReturn: "+34.2%",
    badges: ["top-1%", "streak-master", "verified-analyst"],
    rank: 1,
    topicRank: 1,
  },
  ai_value_investor: {
    username: "ai_value_investor",
    avatar: "/investor-avatar.png",
    bio: "Long-term value investor focused on AI infrastructure plays. Believe in fundamentals over hype.",
    joinDate: "Mar 2023",
    tier: "diamond",
    elo: 2654,
    accuracy: 87.3,
    predictions: 267,
    wins: 233,
    losses: 34,
    streak: 8,
    avgReturn: "+28.7%",
    badges: ["volume-king", "consistent"],
    rank: 2,
    topicRank: 2,
  },
  tech_oracle_23: {
    username: "tech_oracle_23",
    avatar: "/analyst-avatar.png",
    bio: "Tech industry insider. Tracking AI developments since GPT-2. Strong track record on timing market moves.",
    joinDate: "Feb 2023",
    tier: "platinum",
    elo: 2412,
    accuracy: 82.1,
    predictions: 89,
    wins: 73,
    losses: 16,
    streak: 5,
    avgReturn: "+22.4%",
    badges: ["rising-star"],
    rank: 3,
    topicRank: 3,
  },
  market_whisper: {
    username: "market_whisper",
    avatar: "/retail-trader-avatar.jpg",
    bio: "15+ years in financial markets. Specializing in sentiment analysis and contrarian plays.",
    joinDate: "Dec 2022",
    tier: "platinum",
    elo: 2287,
    accuracy: 79.6,
    predictions: 312,
    wins: 248,
    losses: 64,
    streak: 3,
    avgReturn: "+19.8%",
    badges: ["veteran", "high-volume"],
    rank: 4,
    topicRank: 4,
  },
  signal_drift: {
    username: "signal_drift",
    avatar: "/dragon-avatar.jpg",
    bio: "Independent researcher focusing on AI company valuations and market dynamics. Deep dives with receipts.",
    joinDate: "Apr 2023",
    tier: "platinum",
    elo: 2156,
    accuracy: 78.3,
    predictions: 46,
    wins: 36,
    losses: 10,
    streak: 6,
    avgReturn: "+24.1%",
    badges: ["hot-streak", "dd-master"],
    rank: 5,
    topicRank: 5,
  },
  deep_value_plays: {
    username: "deep_value_plays",
    avatar: "/investor-avatar-male.jpg",
    bio: "Value investing with a tech twist. Looking for asymmetric opportunities in the AI space.",
    joinDate: "May 2023",
    tier: "gold",
    elo: 2034,
    accuracy: 76.8,
    predictions: 178,
    wins: 137,
    losses: 41,
    streak: 2,
    avgReturn: "+17.3%",
    badges: [],
    rank: 6,
    topicRank: 6,
  },
  neural_trader: {
    username: "neural_trader",
    avatar: "/tech-trader-avatar.jpg",
    bio: "ML engineer turned trader. Using models to identify market inefficiencies.",
    joinDate: "Jun 2023",
    tier: "gold",
    elo: 1978,
    accuracy: 75.2,
    predictions: 94,
    wins: 71,
    losses: 23,
    streak: 4,
    avgReturn: "+15.9%",
    badges: ["consistent"],
    rank: 7,
    topicRank: 7,
  },
  macro_mind: {
    username: "macro_mind",
    avatar: "/economist-avatar.png",
    bio: "Macroeconomist tracking AI's impact on global markets. Big picture thinker.",
    joinDate: "Jan 2023",
    tier: "gold",
    elo: 1892,
    accuracy: 73.4,
    predictions: 203,
    wins: 149,
    losses: 54,
    streak: 1,
    avgReturn: "+14.2%",
    badges: [],
    rank: 8,
    topicRank: 8,
  },
  alpha_seeker: {
    username: "alpha_seeker",
    avatar: "/finance-professional-avatar.png",
    bio: "Seeking alpha in emerging AI technologies. Focus on small-mid cap opportunities.",
    joinDate: "Jul 2023",
    tier: "gold",
    elo: 1845,
    accuracy: 71.9,
    predictions: 67,
    wins: 48,
    losses: 19,
    streak: 3,
    avgReturn: "+12.8%",
    badges: [],
    rank: 9,
    topicRank: 9,
  },
  momentum_master: {
    username: "momentum_master",
    avatar: "/day-trader-avatar.jpg",
    bio: "High-frequency predictor. Quick in, quick out. Riding momentum waves in AI stocks.",
    joinDate: "Aug 2023",
    tier: "silver",
    elo: 1789,
    accuracy: 70.5,
    predictions: 456,
    wins: 321,
    losses: 135,
    streak: 0,
    avgReturn: "+11.4%",
    badges: ["high-volume"],
    rank: 10,
    topicRank: 10,
  },
}

const tierConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: string }> = {
  diamond: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30", label: "Diamond", icon: "💎" },
  platinum: {
    bg: "bg-slate-300/10",
    text: "text-slate-300",
    border: "border-slate-400/30",
    label: "Platinum",
    icon: "🏆",
  },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30", label: "Gold", icon: "🥇" },
  silver: { bg: "bg-gray-400/10", text: "text-gray-400", border: "border-gray-500/30", label: "Silver", icon: "🥈" },
  bronze: {
    bg: "bg-orange-700/10",
    text: "text-orange-400",
    border: "border-orange-700/30",
    label: "Bronze",
    icon: "🥉",
  },
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
  "verified-analyst": { label: "Verified Analyst", color: "bg-primary/20 text-primary" },
  "dd-master": { label: "DD Master", color: "bg-amber-500/20 text-amber-400" },
}

export function UserProfile({ username }: { username: string }) {
  const user = usersData[username] || usersData["signal_drift"]
  const tier = tierConfig[user.tier]

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={cn("h-24 relative", tier.bg)}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.username}
            className={cn("w-24 h-24 rounded-xl object-cover border-4 border-background", tier.border)}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">u/{user.username}</h1>
              <Badge variant="outline" className={cn("gap-1", tier.bg, tier.text, tier.border)}>
                <Trophy className="w-3 h-3" />
                {tier.label}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                Rank #{user.rank}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{user.bio}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {user.badges.map((badge) => (
            <Badge key={badge} variant="outline" className={cn("text-xs", badgeConfig[badge]?.color)}>
              {badgeConfig[badge]?.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
              <span>{user.accuracy}%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground">
              <span>{user.predictions}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Predictions</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500">{user.streak}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-500">
              <TrendingUp className="w-5 h-5" />
              <span>{user.avgReturn}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Avg Return</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Joined {user.joinDate}
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            ELO {user.elo}
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />#{user.topicRank} in AI & Tech
          </div>
        </div>
      </div>
    </div>
  )
}
