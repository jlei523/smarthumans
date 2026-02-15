"use client"

import { useState } from "react"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ExternalLink,
  Calendar,
  Target,
  Cpu,
  Trophy,
  Globe,
  Film,
  Gamepad2,
  FlaskConical,
  Landmark,
  Bell,
  BellOff,
  MessageSquare,
  ThumbsUp,
  Link2,
  Plus,
  ChevronUp,
  Send,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface Outcome {
  id: string
  username: string
  avatar: string
  verdict: "correct" | "incorrect"
  evidence: string
  evidenceLink?: string
  upvotes: number
  downvotes: number
  timestamp: string
  userVote?: "up" | "down" | null
}

interface Comment {
  id: string
  username: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

interface Prediction {
  id: string
  title: string
  category: "tech" | "politics" | "sports" | "entertainment" | "gaming" | "science" | "finance" | "world"
  prediction: string
  outcome?: string
  timeframe: string
  confidence: number
  status: "correct" | "incorrect" | "pending"
  date: string
  reasoning: string
  sourceUrl?: string
  followers: number
  isFollowing?: boolean
  comments: Comment[]
  outcomes: Outcome[]
  submittedBy: { username: string; avatar: string }
}

const categoryConfig = {
  tech: { icon: Cpu, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  politics: { icon: Landmark, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  sports: { icon: Trophy, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  entertainment: { icon: Film, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  gaming: { icon: Gamepad2, color: "text-green-500", bgColor: "bg-green-500/10" },
  science: { icon: FlaskConical, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  finance: { icon: TrendingUp, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  world: { icon: Globe, color: "text-orange-500", bgColor: "bg-orange-500/10" },
}

const figurePredictionsData: Record<string, Prediction[]> = {
  "jim-cramer": [
    {
      id: "jc1",
      title: "NVIDIA will crash 50% in 2025",
      category: "finance",
      prediction: "NVIDIA stock will decline 50% from its highs within 2025",
      timeframe: "12 months",
      confidence: 75,
      status: "pending",
      date: "Nov 2024",
      reasoning:
        "Stated on Mad Money that the AI bubble is due for a major correction and NVIDIA is the most overvalued.",
      sourceUrl: "https://www.cnbc.com/mad-money/",
      followers: 8934,
      isFollowing: false,
      submittedBy: { username: "inverse_cramer_bot", avatar: "/retail-trader-avatar.jpg" },
      comments: [
        {
          id: "c1",
          username: "inverse_cramer",
          avatar: "/retail-trader-avatar.jpg",
          content: "Time to go long NVDA 🚀 Inverse Cramer index remains undefeated.",
          timestamp: "3 days ago",
          likes: 2341,
        },
        {
          id: "c2",
          username: "quant_alpha",
          avatar: "/quant-avatar.jpg",
          content: "His timing has been consistently off on tech. The fundamentals don't support a 50% decline.",
          timestamp: "2 days ago",
          likes: 567,
        },
      ],
      outcomes: [],
    },
    {
      id: "jc2",
      title: "Bear Stearns is fine",
      category: "finance",
      prediction: "Bear Stearns is not in trouble - stock is a buy",
      outcome: "Bear Stearns collapsed days later, acquired by JPMorgan at $2/share",
      timeframe: "Immediate",
      confidence: 95,
      status: "incorrect",
      date: "Mar 2008",
      reasoning: "Told a viewer asking about Bear Stearns that it was fine and not to pull money out.",
      sourceUrl: "https://www.youtube.com/watch?v=gUkbdjetlY8",
      followers: 45231,
      isFollowing: true,
      submittedBy: { username: "financial_history", avatar: "/analyst-avatar.png" },
      comments: [
        {
          id: "c1",
          username: "market_historian",
          avatar: "/economist-avatar.png",
          content: "The most famous bad call in financial TV history. Aged like milk.",
          timestamp: "1 year ago",
          likes: 8923,
        },
      ],
      outcomes: [
        {
          id: "o1",
          username: "verified_facts",
          avatar: "/analyst-avatar.png",
          verdict: "incorrect",
          evidence:
            "Bear Stearns collapsed 6 days after this call. JPMorgan acquired them at $2/share, later revised to $10. Shareholders lost over 90% of their investment.",
          evidenceLink: "https://en.wikipedia.org/wiki/Bear_Stearns",
          upvotes: 12847,
          downvotes: 23,
          timestamp: "Mar 2008",
        },
      ],
    },
    {
      id: "jc3",
      title: "Netflix will go to $500 in 2022",
      category: "finance",
      prediction: "Netflix stock will reach $500 by end of 2022",
      outcome: "Netflix dropped to under $200, losing over 70% of its value",
      timeframe: "12 months",
      confidence: 80,
      status: "incorrect",
      date: "Jan 2022",
      reasoning: "Streaming growth will continue and Netflix remains the market leader.",
      followers: 3421,
      isFollowing: false,
      submittedBy: { username: "cramer_tracker", avatar: "/bear-avatar.png" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          username: "stock_receipts",
          avatar: "/investor-avatar.png",
          verdict: "incorrect",
          evidence:
            "Netflix fell from ~$600 to under $200 in 2022, a decline of over 70%. Subscriber losses and increased competition crushed the stock.",
          upvotes: 2341,
          downvotes: 12,
          timestamp: "Dec 2022",
        },
      ],
    },
  ],
  "cathie-wood": [
    {
      id: "cw1",
      title: "Tesla will reach $2,000 by 2027",
      category: "finance",
      prediction: "Tesla stock price will hit $2,000 per share",
      timeframe: "3 years",
      confidence: 90,
      status: "pending",
      date: "Oct 2024",
      reasoning: "Robotaxi revenue and FSD adoption will drive exponential growth according to ARK's models.",
      sourceUrl: "https://ark-invest.com/articles/analyst-research/tesla-price-target/",
      followers: 5621,
      isFollowing: true,
      submittedBy: { username: "ark_watcher", avatar: "/tech-trader-avatar.jpg" },
      comments: [
        {
          id: "c1",
          username: "tesla_bull",
          avatar: "/investor-avatar.png",
          content: "Her models assume robotaxi approval which is far from guaranteed.",
          timestamp: "1 week ago",
          likes: 234,
        },
      ],
      outcomes: [],
    },
    {
      id: "cw2",
      title: "Bitcoin will reach $1M by 2030",
      category: "finance",
      prediction: "Bitcoin price will hit $1,000,000",
      timeframe: "6 years",
      confidence: 85,
      status: "pending",
      date: "Feb 2024",
      reasoning: "Institutional adoption and Bitcoin as digital gold thesis will drive massive appreciation.",
      sourceUrl: "https://ark-invest.com/big-ideas-2024",
      followers: 12893,
      isFollowing: false,
      submittedBy: { username: "crypto_tracker", avatar: "/quant-avatar.jpg" },
      comments: [],
      outcomes: [],
    },
  ],
  "nate-silver": [
    {
      id: "ns1",
      title: "Trump will win 2024 election",
      category: "politics",
      prediction: "Donald Trump will win the 2024 presidential election",
      outcome: "Trump won the 2024 election with 312 electoral votes",
      timeframe: "Nov 2024",
      confidence: 62,
      status: "correct",
      date: "Nov 2024",
      reasoning: "Polling averages and economic indicators favored Trump in key swing states.",
      sourceUrl: "https://www.natesilver.net/p/nate-silver-2024-president-election-forecast",
      followers: 18234,
      isFollowing: true,
      submittedBy: { username: "poll_aggregator", avatar: "/analyst-avatar.png" },
      comments: [
        {
          id: "c1",
          username: "political_junkie",
          avatar: "/economist-avatar.png",
          content:
            "His model gave Trump a 50.2% chance on election day. Technically correct but not exactly a bold call.",
          timestamp: "3 weeks ago",
          likes: 891,
        },
      ],
      outcomes: [
        {
          id: "o1",
          username: "election_verified",
          avatar: "/analyst-avatar.png",
          verdict: "correct",
          evidence:
            "Trump won with 312 electoral votes to Harris's 226. Silver's model showed Trump as a slight favorite heading into election day.",
          evidenceLink: "https://www.npr.org/2024/11/06/2024-election-results",
          upvotes: 4521,
          downvotes: 234,
          timestamp: "Nov 2024",
        },
      ],
    },
  ],
  "elon-musk": [
    {
      id: "em1",
      title: "Full Self-Driving will be solved by end of 2020",
      category: "tech",
      prediction: "Tesla will achieve Level 5 full autonomy by December 2020",
      outcome: "FSD remains at Level 2 as of 2024",
      timeframe: "Immediate",
      confidence: 95,
      status: "incorrect",
      date: "Jan 2020",
      reasoning: "Tweeted that he was 'very confident' FSD would be feature complete by end of 2020.",
      sourceUrl: "https://twitter.com/elonmusk/status/1234567890",
      followers: 34521,
      isFollowing: false,
      submittedBy: { username: "elon_receipts", avatar: "/bear-avatar.png" },
      comments: [
        {
          id: "c1",
          username: "tech_skeptic",
          avatar: "/analyst-avatar.png",
          content: "He's made this prediction every year since 2016. The goalposts keep moving.",
          timestamp: "6 months ago",
          likes: 5672,
        },
      ],
      outcomes: [
        {
          id: "o1",
          username: "fsd_tracker",
          avatar: "/tech-trader-avatar.jpg",
          verdict: "incorrect",
          evidence:
            "As of December 2024, Tesla FSD remains classified as Level 2 requiring driver supervision. No robotaxi approval from regulators.",
          evidenceLink: "https://www.reuters.com/technology/tesla-fsd-update",
          upvotes: 8934,
          downvotes: 1203,
          timestamp: "Dec 2024",
        },
      ],
    },
    {
      id: "em2",
      title: "Starship will reach orbit in 2022",
      category: "science",
      prediction: "SpaceX Starship will complete orbital flight in 2022",
      outcome: "First orbital attempt was in April 2023, achieved orbit in 2024",
      timeframe: "12 months",
      confidence: 80,
      status: "incorrect",
      date: "Dec 2021",
      reasoning: "Production and testing timeline suggested orbital attempt was imminent.",
      followers: 12893,
      isFollowing: true,
      submittedBy: { username: "space_tracker", avatar: "/quant-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          username: "spaceflight_now",
          avatar: "/analyst-avatar.png",
          verdict: "incorrect",
          evidence:
            "First orbital attempt occurred April 2023 (ended in explosion). Successful orbital flight achieved in 2024.",
          evidenceLink: "https://www.spacex.com/launches/",
          upvotes: 3421,
          downvotes: 89,
          timestamp: "Apr 2023",
        },
      ],
    },
  ],
  "ray-dalio": [
    {
      id: "rd1",
      title: "Cash will be trash in the 2020s",
      category: "finance",
      prediction: "Holding cash will result in significant real losses due to inflation",
      outcome: "Inflation in 2021-2023 proved this largely correct",
      timeframe: "Decade",
      confidence: 85,
      status: "correct",
      date: "Jan 2020",
      reasoning: "Monetary policy and debt levels will drive inflation that outpaces cash returns.",
      sourceUrl: "https://www.linkedin.com/pulse/paradigm-shifts-ray-dalio/",
      followers: 8934,
      isFollowing: true,
      submittedBy: { username: "macro_watcher", avatar: "/economist-avatar.png" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          username: "inflation_tracker",
          avatar: "/analyst-avatar.png",
          verdict: "correct",
          evidence:
            "US inflation peaked at 9.1% in 2022. Cash holdings lost significant purchasing power from 2020-2023.",
          evidenceLink: "https://www.bls.gov/cpi/",
          upvotes: 5623,
          downvotes: 234,
          timestamp: "Dec 2023",
        },
      ],
    },
  ],
  "bill-ackman": [
    {
      id: "ba1",
      title: "Universal Music Group is undervalued",
      category: "finance",
      prediction: "UMG stock will significantly outperform the market",
      outcome: "UMG has risen ~40% since Pershing Square's investment",
      timeframe: "3 years",
      confidence: 85,
      status: "correct",
      date: "Sep 2021",
      reasoning: "Music streaming growth and UMG's catalog value are underappreciated by the market.",
      sourceUrl: "https://twitter.com/BillAckman",
      followers: 4521,
      isFollowing: false,
      submittedBy: { username: "activist_tracker", avatar: "/investor-avatar-male.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          username: "hedge_fund_returns",
          avatar: "/finance-professional-avatar.png",
          verdict: "correct",
          evidence:
            "UMG stock has appreciated approximately 40% since Pershing Square's initial investment, outperforming the broader market.",
          upvotes: 1234,
          downvotes: 89,
          timestamp: "Nov 2024",
        },
      ],
    },
  ],
}

export function FigurePredictions({ slug }: { slug: string }) {
  const predictions = figurePredictionsData[slug] || figurePredictionsData["jim-cramer"]
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, "comments" | "outcomes">>({})
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(predictions.map((p) => [p.id, p.isFollowing || false])),
  )
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
    Object.fromEntries(predictions.map((p) => [p.id, p.followers])),
  )
  const [outcomeVotes, setOutcomeVotes] = useState<Record<string, "up" | "down" | null>>({})
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "pending">("all")

  const toggleFollow = (id: string) => {
    setFollowState((prev) => ({ ...prev, [id]: !prev[id] }))
    setFollowerCounts((prev) => ({
      ...prev,
      [id]: prev[id] + (followState[id] ? -1 : 1),
    }))
  }

  const handleOutcomeVote = (predictionId: string, outcomeId: string, vote: "up" | "down") => {
    const key = `${predictionId}-${outcomeId}`
    setOutcomeVotes((prev) => ({
      ...prev,
      [key]: prev[key] === vote ? null : vote,
    }))
  }

  const filteredPredictions = predictions.filter((p) => filter === "all" || p.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tracked Predictions</h2>
        <div className="flex gap-2">
          {(["all", "correct", "incorrect", "pending"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredPredictions.map((prediction) => {
          const category = categoryConfig[prediction.category]
          const CategoryIcon = category.icon
          const isExpanded = expandedId === prediction.id
          const currentTab = activeTab[prediction.id] || "comments"

          return (
            <div key={prediction.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex">
                <div className="flex flex-col items-center gap-1 p-3 border-r border-border bg-muted/30">
                  <button
                    onClick={() => toggleFollow(prediction.id)}
                    className={cn(
                      "flex flex-col items-center justify-center w-10 h-14 rounded-lg transition-colors",
                      followState[prediction.id]
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {followState[prediction.id] ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span className="text-xs font-medium mt-0.5">{followerCounts[prediction.id]}</span>
                  </button>
                </div>

                {/* Main content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn("gap-1", category.bgColor, category.color)}>
                          <CategoryIcon className="w-3 h-3" />
                          {prediction.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            prediction.status === "correct"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : prediction.status === "incorrect"
                                ? "bg-red-500/10 text-red-500 border-red-500/30"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/30",
                          )}
                        >
                          {prediction.status === "correct" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : prediction.status === "incorrect" ? (
                            <XCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {prediction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {prediction.date}
                        </span>
                      </div>

                      <h3 className="font-semibold text-foreground">{prediction.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{prediction.prediction}</p>

                      {prediction.outcome && (
                        <p className="text-sm mt-2 text-foreground/80 bg-muted/50 rounded-lg p-2">
                          <span className="font-medium">Outcome:</span> {prediction.outcome}
                        </p>
                      )}

                      {/* Submitted by */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>Submitted by</span>
                        <Link
                          href={`/user/${prediction.submittedBy.username}`}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <img
                            src={prediction.submittedBy.avatar || "/placeholder.svg"}
                            alt={prediction.submittedBy.username}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="font-medium">u/{prediction.submittedBy.username}</span>
                        </Link>
                        {prediction.sourceUrl && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <a
                              href={prediction.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Source
                            </a>
                          </>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {prediction.confidence}% confidence
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {prediction.timeframe}
                        </span>
                        <button
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : prediction.id)}
                        >
                          <MessageSquare className="w-3 h-3" />
                          {prediction.comments.length} comments
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setExpandedId(isExpanded ? null : prediction.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="bg-muted/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Reasoning:</span> {prediction.reasoning}
                        </p>
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={currentTab === "comments" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [prediction.id]: "comments" }))}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Comments ({prediction.comments.length})
                        </Button>
                        <Button
                          variant={currentTab === "outcomes" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [prediction.id]: "outcomes" }))}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Outcomes ({prediction.outcomes.length})
                        </Button>
                      </div>

                      {/* Comments tab */}
                      {currentTab === "comments" && (
                        <div className="space-y-3">
                          {prediction.comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No comments yet. Be the first to comment!
                            </p>
                          ) : (
                            prediction.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                                <img
                                  src={comment.avatar || "/placeholder.svg"}
                                  alt={comment.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/user/${comment.username}`}
                                      className="text-sm font-medium hover:text-primary transition-colors"
                                    >
                                      u/{comment.username}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2">
                                    <ThumbsUp className="w-3 h-3" />
                                    {comment.likes}
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                          <div className="flex gap-2 mt-3">
                            <Textarea placeholder="Add a comment..." className="min-h-[60px] text-sm" />
                            <Button size="icon" className="shrink-0 self-end">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Outcomes tab */}
                      {currentTab === "outcomes" && (
                        <div className="space-y-3">
                          {prediction.outcomes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No outcomes submitted yet. Was this prediction correct?
                            </p>
                          ) : (
                            prediction.outcomes.map((outcome) => {
                              const voteKey = `${prediction.id}-${outcome.id}`
                              const userVote = outcomeVotes[voteKey]
                              const agreementPct = Math.round(
                                (outcome.upvotes / (outcome.upvotes + outcome.downvotes)) * 100,
                              )

                              return (
                                <div
                                  key={outcome.id}
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    outcome.verdict === "correct"
                                      ? "bg-emerald-500/5 border-emerald-500/30"
                                      : "bg-red-500/5 border-red-500/30",
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={outcome.avatar || "/placeholder.svg"}
                                      alt={outcome.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Link
                                          href={`/user/${outcome.username}`}
                                          className="text-sm font-medium hover:text-primary transition-colors"
                                        >
                                          u/{outcome.username}
                                        </Link>
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-xs",
                                            outcome.verdict === "correct"
                                              ? "bg-emerald-500/20 text-emerald-500"
                                              : "bg-red-500/20 text-red-500",
                                          )}
                                        >
                                          {outcome.verdict === "correct" ? (
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                          ) : (
                                            <XCircle className="w-3 h-3 mr-1" />
                                          )}
                                          {outcome.verdict}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{outcome.timestamp}</span>
                                      </div>
                                      <p className="text-sm text-foreground/90">{outcome.evidence}</p>
                                      {outcome.evidenceLink && (
                                        <a
                                          href={outcome.evidenceLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                        >
                                          <Link2 className="w-3 h-3" />
                                          View evidence
                                        </a>
                                      )}

                                      {/* Voting */}
                                      <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleOutcomeVote(prediction.id, outcome.id, "up")}
                                            className={cn(
                                              "p-1 rounded transition-colors",
                                              userVote === "up"
                                                ? "text-emerald-500 bg-emerald-500/20"
                                                : "text-muted-foreground hover:text-emerald-500",
                                            )}
                                          >
                                            <ChevronUp className="w-4 h-4" />
                                          </button>
                                          <span className="text-sm font-medium">{outcome.upvotes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleOutcomeVote(prediction.id, outcome.id, "down")}
                                            className={cn(
                                              "p-1 rounded transition-colors",
                                              userVote === "down"
                                                ? "text-red-500 bg-red-500/20"
                                                : "text-muted-foreground hover:text-red-500",
                                            )}
                                          >
                                            <ChevronDown className="w-4 h-4" />
                                          </button>
                                          <span className="text-sm font-medium">{outcome.downvotes}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {agreementPct}% agree
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}

                          {/* Submit outcome form */}
                          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                            <p className="text-sm font-medium">Submit outcome verification</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Correct
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Incorrect
                              </Button>
                            </div>
                            <Textarea placeholder="Provide evidence for your verdict..." className="min-h-[60px]" />
                            <Input placeholder="Evidence link (optional)" className="text-sm" />
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Submit Outcome
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
