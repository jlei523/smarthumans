"use client"

import { useState } from "react"
import {
  ExternalLink,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Plus,
  Tv,
  BookOpen,
  Briefcase,
  Mic,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubmitPredictionModal } from "@/components/submit-prediction-modal"

interface FigureData {
  slug: string
  name: string
  avatar: string
  type: "pundit" | "tv" | "author" | "politician" | "celebrity" | "analyst"
  affiliation: string
  bio: string
  accuracy: number
  totalPredictions: number
  correctPredictions: number
  incorrectPredictions: number
  pendingPredictions: number
  followers: number
  trackedSince: string
  externalLinks: { label: string; url: string }[]
}

const figuresData: Record<string, FigureData> = {
  "jim-cramer": {
    slug: "jim-cramer",
    name: "Jim Cramer",
    avatar: "/jim-cramer-tv-host.jpg",
    type: "tv",
    affiliation: "CNBC Mad Money",
    bio: "Host of Mad Money on CNBC. Former hedge fund manager and co-founder of TheStreet. Known for bold stock picks and the famous soundboard.",
    accuracy: 47.2,
    totalPredictions: 1247,
    correctPredictions: 589,
    incorrectPredictions: 612,
    pendingPredictions: 46,
    followers: 24893,
    trackedSince: "Jan 2020",
    externalLinks: [
      { label: "Mad Money", url: "https://www.cnbc.com/mad-money/" },
      { label: "Twitter", url: "https://twitter.com/jimcramer" },
    ],
  },
  "cathie-wood": {
    slug: "cathie-wood",
    name: "Cathie Wood",
    avatar: "/cathie-wood-ark-invest.jpg",
    type: "analyst",
    affiliation: "ARK Invest",
    bio: "Founder, CEO, and CIO of ARK Invest. Known for high-conviction bets on disruptive innovation, particularly in AI, genomics, and autonomous vehicles.",
    accuracy: 38.9,
    totalPredictions: 342,
    correctPredictions: 133,
    incorrectPredictions: 186,
    pendingPredictions: 23,
    followers: 18432,
    trackedSince: "Mar 2020",
    externalLinks: [
      { label: "ARK Invest", url: "https://ark-invest.com" },
      { label: "Twitter", url: "https://twitter.com/CathieDWood" },
    ],
  },
  "nate-silver": {
    slug: "nate-silver",
    name: "Nate Silver",
    avatar: "/nate-silver-statistician.jpg",
    type: "author",
    affiliation: "Silver Bulletin",
    bio: "Statistician, writer, and founder of FiveThirtyEight. Author of 'The Signal and the Noise'. Known for election forecasting and probabilistic thinking.",
    accuracy: 82.4,
    totalPredictions: 156,
    correctPredictions: 129,
    incorrectPredictions: 21,
    pendingPredictions: 6,
    followers: 31247,
    trackedSince: "Jan 2019",
    externalLinks: [
      { label: "Silver Bulletin", url: "https://www.natesilver.net" },
      { label: "Twitter", url: "https://twitter.com/NateSilver538" },
    ],
  },
  "elon-musk": {
    slug: "elon-musk",
    name: "Elon Musk",
    avatar: "/elon-musk-tech-ceo.jpg",
    type: "celebrity",
    affiliation: "Tesla, SpaceX, X",
    bio: "CEO of Tesla and SpaceX. Owner of X (Twitter). Known for ambitious timelines and bold predictions about technology, AI, and humanity's future.",
    accuracy: 23.7,
    totalPredictions: 487,
    correctPredictions: 115,
    incorrectPredictions: 298,
    pendingPredictions: 74,
    followers: 89234,
    trackedSince: "Jan 2018",
    externalLinks: [
      { label: "X Profile", url: "https://twitter.com/elonmusk" },
      { label: "Tesla", url: "https://tesla.com" },
    ],
  },
  "ray-dalio": {
    slug: "ray-dalio",
    name: "Ray Dalio",
    avatar: "/ray-dalio-investor.jpg",
    type: "analyst",
    affiliation: "Bridgewater Associates",
    bio: "Founder of Bridgewater Associates, the world's largest hedge fund. Author of 'Principles'. Known for macro economic predictions and systematic investing.",
    accuracy: 67.8,
    totalPredictions: 203,
    correctPredictions: 138,
    incorrectPredictions: 52,
    pendingPredictions: 13,
    followers: 42156,
    trackedSince: "Jun 2019",
    externalLinks: [
      { label: "LinkedIn", url: "https://linkedin.com/in/raydalio" },
      { label: "Principles", url: "https://principles.com" },
    ],
  },
  "bill-ackman": {
    slug: "bill-ackman",
    name: "Bill Ackman",
    avatar: "/bill-ackman-hedge-fund.jpg",
    type: "analyst",
    affiliation: "Pershing Square Capital",
    bio: "Founder and CEO of Pershing Square Capital Management. Known for activist investing and high-profile positions. Prolific on Twitter with market takes.",
    accuracy: 58.3,
    totalPredictions: 178,
    correctPredictions: 104,
    incorrectPredictions: 67,
    pendingPredictions: 7,
    followers: 28934,
    trackedSince: "Feb 2020",
    externalLinks: [
      { label: "Twitter", url: "https://twitter.com/BillAckman" },
      { label: "Pershing Square", url: "https://pershingsquareholdings.com" },
    ],
  },
}

const typeConfig: Record<string, { icon: typeof Tv; label: string; color: string }> = {
  tv: { icon: Tv, label: "TV Personality", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  author: { icon: BookOpen, label: "Author", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  analyst: { icon: Briefcase, label: "Analyst", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  celebrity: { icon: Mic, label: "Public Figure", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  pundit: { icon: Mic, label: "Pundit", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  politician: { icon: Briefcase, label: "Politician", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export function FigureProfile({ slug }: { slug: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const figure = figuresData[slug] || figuresData["jim-cramer"]
  const typeInfo = typeConfig[figure.type]
  const TypeIcon = typeInfo.icon

  const accuracyColor =
    figure.accuracy >= 60 ? "text-emerald-500" : figure.accuracy >= 40 ? "text-amber-500" : "text-red-500"

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header banner */}
        <div className="h-24 relative bg-gradient-to-r from-muted/50 to-muted/20">
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-muted/80 backdrop-blur-sm">
              Public Figure - Not a Member
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <img
              src={figure.avatar || "/placeholder.svg"}
              alt={figure.name}
              className="w-24 h-24 rounded-xl object-cover border-4 border-background bg-muted"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{figure.name}</h1>
                <Badge variant="outline" className={cn("gap-1", typeInfo.color)}>
                  <TypeIcon className="w-3 h-3" />
                  {typeInfo.label}
                </Badge>
              </div>
              <p className="text-primary text-sm font-medium">{figure.affiliation}</p>
              <p className="text-muted-foreground text-sm mt-1">{figure.bio}</p>
            </div>
          </div>

          {/* External links */}
          <div className="flex flex-wrap gap-2 mt-4">
            {figure.externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {link.label}
              </a>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className={cn("text-2xl font-bold", accuracyColor)}>{figure.accuracy}%</div>
              <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{figure.totalPredictions}</div>
              <div className="text-xs text-muted-foreground mt-1">Predictions Tracked</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-500">
                <TrendingUp className="w-5 h-5" />
                {figure.correctPredictions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500">
                <TrendingDown className="w-5 h-5" />
                {figure.incorrectPredictions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Incorrect</div>
            </div>
          </div>

          {/* Meta info and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Tracked since {figure.trackedSince}
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {figure.pendingPredictions} pending
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                {figure.followers.toLocaleString()} followers
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1 bg-transparent" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Submit Prediction
            </Button>
          </div>
        </div>
      </div>

      <SubmitPredictionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefillSource={{
          type: "figure",
          name: figure.name,
          slug: figure.slug,
          avatar: figure.avatar,
        }}
      />
    </>
  )
}
