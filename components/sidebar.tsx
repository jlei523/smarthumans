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

const tierColors: Record<string, { text: string }> = {
  diamond: { text: "text-muted-foreground" },
  platinum: { text: "text-muted-foreground" },
  gold: { text: "text-muted-foreground" },
}

const typeColors: Record<string, { text: string }> = {
  "TV Personality": { text: "text-muted-foreground" },
  Analyst: { text: "text-muted-foreground" },
  Author: { text: "text-muted-foreground" },
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-6">
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
          <Link href="/leaderboard" className="block px-2 mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            View leaderboard
          </Link>
        </div>

        <div className="h-px bg-border/40" />

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
          <Link href="/figures" className="block px-2 mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            View all figures
          </Link>
        </div>

        <div className="h-px bg-border/40" />

        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
            Platform
          </span>
          <div className="px-2 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Members</span>
              <span className="text-foreground tabular-nums">87,429 / 100K</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary/40 rounded-full" style={{ width: "87.4%" }} />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Your ELO</span>
              <span className="text-foreground tabular-nums">1,542</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/40" />

        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors",
                item.active
                  ? "bg-secondary/60 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground/80",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground/80 transition-colors">
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground/80 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>
    </aside>
  )
}
