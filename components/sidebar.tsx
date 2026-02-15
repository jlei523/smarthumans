"use client"

import {
  Home,
  Flame,
  Clock,
  Bookmark,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Trophy,
  Target,
  Mic,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const navItems = [
  { icon: Home, label: "Home", active: false },
  { icon: Flame, label: "Popular", active: false },
  { icon: TrendingUp, label: "Trending", active: false },
  { icon: Clock, label: "Recent", active: false },
]

const communities = [
  { name: "r/MachineLearning", members: "2.4M", icon: "🤖" },
  { name: "r/LocalLLaMA", members: "890K", icon: "🦙" },
  { name: "r/StableDiffusion", members: "1.2M", icon: "🎨" },
  { name: "r/ChatGPT", members: "3.1M", icon: "💬" },
  { name: "r/OpenAI", members: "1.8M", icon: "⚡" },
]

const topPredictors = [
  {
    username: "quant_alpha",
    avatar: "/quant-avatar.jpg",
    accuracy: 87,
    predictions: 42,
    streak: 8,
    tier: "diamond",
  },
  {
    username: "ai_value_investor",
    avatar: "/investor-avatar.png",
    accuracy: 82,
    predictions: 67,
    streak: 5,
    tier: "platinum",
  },
  {
    username: "tech_oracle_23",
    avatar: "/analyst-avatar.png",
    accuracy: 79,
    predictions: 31,
    streak: 3,
    tier: "gold",
  },
  {
    username: "market_whisper",
    avatar: "/retail-trader-avatar.jpg",
    accuracy: 76,
    predictions: 89,
    streak: 4,
    tier: "gold",
  },
  {
    username: "auradragon1",
    avatar: "/dragon-avatar.jpg",
    accuracy: 74,
    predictions: 23,
    streak: 6,
    tier: "platinum",
  },
]

const topFigures = [
  {
    name: "Jim Cramer",
    slug: "jim-cramer",
    avatar: "/jim-cramer-tv-host.jpg",
    type: "TV Personality",
    accuracy: 47,
    predictions: 156,
  },
  {
    name: "Cathie Wood",
    slug: "cathie-wood",
    avatar: "/cathie-wood-ark-invest.jpg",
    type: "Analyst",
    accuracy: 58,
    predictions: 89,
  },
  {
    name: "Nate Silver",
    slug: "nate-silver",
    avatar: "/nate-silver-statistician.jpg",
    type: "Author",
    accuracy: 82,
    predictions: 234,
  },
]

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  diamond: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  platinum: { bg: "bg-slate-300/10", text: "text-slate-300", border: "border-slate-400/30" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  "TV Personality": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  Analyst: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  Author: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Predictions
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Best predictors on AI & Tech Stocks</p>
          <div className="space-y-2">
            {topPredictors.map((predictor, index) => (
              <Link
                key={predictor.username}
                href={`/user/${predictor.username}`}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-secondary/50 cursor-pointer",
                  tierColors[predictor.tier].border,
                  tierColors[predictor.tier].bg,
                )}
              >
                <span className="text-xs font-bold text-muted-foreground w-4">#{index + 1}</span>
                <img
                  src={predictor.avatar || "/placeholder.svg"}
                  alt={predictor.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground truncate">u/{predictor.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={cn("font-semibold", tierColors[predictor.tier].text)}>
                      {predictor.accuracy}% acc
                    </span>
                    <span>·</span>
                    <span>{predictor.predictions} calls</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-medium text-orange-500">{predictor.streak}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/leaderboard" className="block w-full mt-3 text-xs text-primary hover:underline text-center">
            View full leaderboard
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Public Figures</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Tracked pundits, analysts & celebrities</p>
          <div className="space-y-2">
            {topFigures.map((figure) => (
              <Link
                key={figure.slug}
                href={`/figure/${figure.slug}`}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-secondary/50 cursor-pointer",
                  typeColors[figure.type]?.border || "border-border",
                  typeColors[figure.type]?.bg || "bg-secondary/20",
                )}
              >
                <img
                  src={figure.avatar || "/placeholder.svg"}
                  alt={figure.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground truncate">{figure.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={cn("font-semibold", typeColors[figure.type]?.text || "text-muted-foreground")}>
                      {figure.accuracy}% acc
                    </span>
                    <span>·</span>
                    <span>{figure.predictions} tracked</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                    typeColors[figure.type]?.bg || "bg-secondary",
                    typeColors[figure.type]?.text || "text-muted-foreground",
                  )}
                >
                  {figure.type}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/figures" className="block w-full mt-3 text-xs text-primary hover:underline text-center">
            View all public figures
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Membership</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Active Members</span>
                <span className="font-semibold text-foreground">87,429 / 100K</span>
              </div>
              <Progress value={87.4} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Membership Value</span>
              <span className="font-medium text-primary">$847</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Your ELO</span>
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="font-medium text-yellow-500">1,542</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Moderation</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Content moderated by community-trained LLM.{" "}
            <span className="text-primary cursor-pointer hover:underline">View rules</span>
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-500">Active</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                item.active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="h-px bg-border" />

        <div>
          <div className="flex items-center gap-2 px-3 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Communities</span>
          </div>
          <div className="space-y-1">
            {communities.map((community) => (
              <button
                key={community.name}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              >
                <span className="text-lg">{community.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{community.name}</div>
                  <div className="text-xs text-muted-foreground">{community.members} members</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <Bookmark className="w-5 h-5" />
            Saved
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
      </div>
    </aside>
  )
}
