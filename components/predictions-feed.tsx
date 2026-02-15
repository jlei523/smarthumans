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
  Flame,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type PredictionSource =
  | { type: "member"; username: string; avatar: string }
  | { type: "pundit"; name: string; outlet: string; avatar?: string; slug?: string }
  | { type: "tv"; name: string; show: string; network: string; avatar?: string; slug?: string }
  | { type: "author"; name: string; publication: string; avatar?: string; slug?: string }
  | { type: "politician"; name: string; title: string; avatar?: string; slug?: string }
  | { type: "celebrity"; name: string; avatar?: string; slug?: string }
  | { type: "analyst"; name: string; firm: string; avatar?: string; slug?: string }

interface Outcome {
  id: string
  userId: string
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
  userId: string
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
  followers: number
  isFollowing?: boolean
  comments: Comment[]
  outcomes: Outcome[]
  source: PredictionSource
  sourceUrl?: string
  submittedBy?: { username: string; avatar: string }
}

const categoryConfig = {
  tech: { icon: Cpu, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Tech" },
  politics: { icon: Landmark, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Politics" },
  sports: { icon: Trophy, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Sports" },
  entertainment: { icon: Film, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Entertainment" },
  gaming: { icon: Gamepad2, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Gaming" },
  science: { icon: FlaskConical, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Science" },
  finance: { icon: TrendingUp, color: "text-muted-foreground", bgColor: "bg-secondary", label: "Finance" },
  world: { icon: Globe, color: "text-muted-foreground", bgColor: "bg-secondary", label: "World" },
}

const sourceTypeConfig: Record<string, { label: string; color: string }> = {
  member: { label: "Member", color: "bg-secondary text-muted-foreground" },
  pundit: { label: "Pundit", color: "bg-secondary text-muted-foreground" },
  tv: { label: "TV", color: "bg-secondary text-muted-foreground" },
  author: { label: "Author", color: "bg-secondary text-muted-foreground" },
  politician: { label: "Politician", color: "bg-secondary text-muted-foreground" },
  celebrity: { label: "Celebrity", color: "bg-secondary text-muted-foreground" },
  analyst: { label: "Analyst", color: "bg-secondary text-muted-foreground" },
}

const feedPredictions: Prediction[] = [
  {
    id: "f1",
    title: "GPT-5 will be released before July 2026",
    category: "tech",
    prediction: "OpenAI will publicly release GPT-5 (not a preview/demo) before July 1, 2026",
    timeframe: "5 months",
    confidence: 72,
    status: "pending",
    date: "Jan 2026",
    reasoning: "Based on OpenAI's accelerating release cadence and recent statements from Sam Altman about the next frontier model being 'closer than people think.'",
    followers: 3842,
    isFollowing: false,
    source: { type: "member", username: "auradragon1", avatar: "/dragon-avatar.jpg" },
    comments: [
      { id: "c1", userId: "u1", username: "model_watcher", avatar: "/analyst-avatar.png", content: "The internal testing timeline suggests Q2 at earliest. July is tight but possible.", timestamp: "3h ago", likes: 45 },
      { id: "c2", userId: "u2", username: "ai_skeptic", avatar: "/bear-avatar.png", content: "They said the same thing about GPT-4.5 and look how that went.", timestamp: "2h ago", likes: 28 },
    ],
    outcomes: [],
  },
  {
    id: "f2",
    title: "Jim Cramer: Tesla will hit $500 by year end",
    category: "finance",
    prediction: "Tesla stock will reach $500 per share before December 31, 2026",
    timeframe: "10 months",
    confidence: 65,
    status: "pending",
    date: "Feb 2026",
    reasoning: "Cramer cited Tesla's robotaxi momentum, energy storage growth, and Optimus robot progress as key catalysts.",
    followers: 2156,
    isFollowing: true,
    source: { type: "tv", name: "Jim Cramer", show: "Mad Money", network: "CNBC", avatar: "/jim-cramer-tv-host.jpg", slug: "jim-cramer" },
    sourceUrl: "https://cnbc.com/mad-money-tesla-prediction",
    submittedBy: { username: "stock_tracker99", avatar: "/investor-avatar.png" },
    comments: [
      { id: "c3", userId: "u3", username: "inverse_cramer", avatar: "/bear-avatar.png", content: "Historically, doing the opposite of Cramer's calls has been a winning strategy.", timestamp: "5h ago", likes: 89 },
      { id: "c4", userId: "u4", username: "tsla_bull", avatar: "/tech-avatar.png", content: "Actually his recent track record has improved significantly. Don't sleep on this one.", timestamp: "4h ago", likes: 34 },
    ],
    outcomes: [],
  },
  {
    id: "f3",
    title: "Democrats will win the 2026 midterm House majority",
    category: "politics",
    prediction: "The Democratic Party will flip the House of Representatives in the 2026 midterm elections",
    timeframe: "9 months",
    confidence: 58,
    status: "pending",
    date: "Jan 2026",
    reasoning: "Historical patterns strongly favor the opposition party in midterms. Current polling shows significant enthusiasm gap and suburban district shifts.",
    followers: 5621,
    isFollowing: false,
    source: { type: "author", name: "Nate Silver", publication: "Silver Bulletin", avatar: "/nate-silver-statistician.jpg", slug: "nate-silver" },
    sourceUrl: "https://natesilver.substack.com/midterm-forecast",
    submittedBy: { username: "poll_nerd", avatar: "/researcher-avatar.png" },
    comments: [
      { id: "c5", userId: "u5", username: "data_driven", avatar: "/quant-avatar.jpg", content: "Silver's model has the best track record for midterms. The fundamentals clearly favor a flip.", timestamp: "1d ago", likes: 67 },
    ],
    outcomes: [],
  },
  {
    id: "f4",
    title: "GTA 6 will be delayed to 2027",
    category: "gaming",
    prediction: "Grand Theft Auto VI will not ship in its Fall 2025 window and will be pushed to 2027 or later",
    outcome: "GTA 6 was officially delayed to May 2026",
    timeframe: "Resolved",
    confidence: 70,
    status: "correct",
    date: "Mar 2025",
    reasoning: "Rockstar's history of delays combined with the scope of the project made a 2025 release extremely unlikely. Development sources indicated significant content was still being finalized.",
    followers: 8934,
    isFollowing: false,
    source: { type: "member", username: "leaks_insider", avatar: "/gamer-avatar.png" },
    comments: [
      { id: "c6", userId: "u6", username: "gta_fan", avatar: "/developer-avatar.png", content: "Called it. Anyone who believed 2025 doesn't know Rockstar.", timestamp: "2mo ago", likes: 156 },
      { id: "c7", userId: "u7", username: "patient_gamer", avatar: "/tech-avatar.png", content: "Technically not exactly right - they said 2027 but it's May 2026. Still counts as a delay though.", timestamp: "2mo ago", likes: 43 },
    ],
    outcomes: [
      { id: "o1", userId: "u8", username: "fact_checker", avatar: "/analyst-avatar.png", verdict: "correct", evidence: "Rockstar officially announced delay to May 2026. While the prediction said 2027, the core prediction of missing the Fall 2025 window was correct.", evidenceLink: "https://rockstargames.com/newswire", upvotes: 234, downvotes: 18, timestamp: "2mo ago", userVote: null },
    ],
  },
  {
    id: "f5",
    title: "Elon Musk: Neuralink will cure blindness within 2 years",
    category: "science",
    prediction: "Neuralink's brain-computer interface will restore vision in blind patients within 24 months",
    timeframe: "18 months",
    confidence: 30,
    status: "pending",
    date: "Sep 2025",
    reasoning: "Musk made this claim during a Neuralink presentation, citing progress in their Blindsight implant trials.",
    followers: 4217,
    isFollowing: false,
    source: { type: "celebrity", name: "Elon Musk", avatar: "/elon-musk-tech-ceo.jpg", slug: "elon-musk" },
    sourceUrl: "https://x.com/elonmusk/status/example",
    submittedBy: { username: "neuro_tracker", avatar: "/researcher-avatar.png" },
    comments: [
      { id: "c8", userId: "u9", username: "neuro_scientist", avatar: "/researcher-avatar.png", content: "As someone in the field, this timeline is wildly optimistic. The FDA approval process alone takes longer than that.", timestamp: "5mo ago", likes: 201 },
      { id: "c9", userId: "u10", username: "musk_tracker", avatar: "/tech-avatar.png", content: "His timelines are always 3-5x too aggressive but the direction is usually right.", timestamp: "5mo ago", likes: 78 },
    ],
    outcomes: [],
  },
  {
    id: "f6",
    title: "Cathie Wood: Bitcoin will hit $1M by 2030",
    category: "finance",
    prediction: "Bitcoin will reach $1,000,000 per coin before the end of 2030",
    timeframe: "4 years",
    confidence: 45,
    status: "pending",
    date: "Jan 2026",
    reasoning: "Wood's bull case relies on institutional adoption acceleration, sovereign wealth fund allocation, and Bitcoin as a global reserve asset thesis.",
    followers: 6743,
    isFollowing: false,
    source: { type: "analyst", name: "Cathie Wood", firm: "ARK Invest", avatar: "/cathie-wood-ark-invest.jpg", slug: "cathie-wood" },
    sourceUrl: "https://ark-invest.com/bitcoin-research",
    submittedBy: { username: "crypto_watcher", avatar: "/investor-avatar.png" },
    comments: [
      { id: "c10", userId: "u11", username: "btc_maxi", avatar: "/investor-avatar-male.jpg", content: "This is actually conservative. With nation-state adoption we could see this by 2028.", timestamp: "2w ago", likes: 34 },
    ],
    outcomes: [],
  },
  {
    id: "f7",
    title: "Lakers will miss the 2026 NBA playoffs",
    category: "sports",
    prediction: "The Los Angeles Lakers will fail to qualify for the 2026 NBA Playoffs (including play-in)",
    outcome: "Lakers eliminated in play-in tournament",
    timeframe: "Resolved",
    confidence: 60,
    status: "incorrect",
    date: "Oct 2025",
    reasoning: "Aging roster, LeBron's declining minutes, and a loaded Western Conference made it unlikely they'd compete.",
    followers: 1893,
    isFollowing: false,
    source: { type: "member", username: "hoops_analytics", avatar: "/tech-trader-avatar.jpg" },
    comments: [
      { id: "c11", userId: "u12", username: "laker_nation", avatar: "/gamer-avatar.png", content: "They made the play-in which technically counts as qualifying. Prediction was wrong.", timestamp: "3w ago", likes: 67 },
    ],
    outcomes: [
      { id: "o2", userId: "u13", username: "nba_ref", avatar: "/analyst-avatar.png", verdict: "incorrect", evidence: "Lakers did qualify for the play-in tournament, which is part of the NBA playoff structure. They were eliminated in the play-in but did 'qualify' for postseason play.", evidenceLink: "https://nba.com/standings", upvotes: 145, downvotes: 23, timestamp: "3w ago", userVote: null },
    ],
  },
  {
    id: "f8",
    title: "Ray Dalio: US will enter recession by Q3 2026",
    category: "world",
    prediction: "The United States economy will officially enter a recession (2 consecutive quarters of negative GDP) by Q3 2026",
    timeframe: "7 months",
    confidence: 55,
    status: "pending",
    date: "Dec 2025",
    reasoning: "Dalio pointed to debt cycle dynamics, geopolitical tensions, and monetary policy lag effects as key recession indicators.",
    followers: 3456,
    isFollowing: false,
    source: { type: "pundit", name: "Ray Dalio", outlet: "Bridgewater", avatar: "/ray-dalio-investor.jpg", slug: "ray-dalio" },
    sourceUrl: "https://linkedin.com/in/raydalio/example",
    submittedBy: { username: "macro_watcher", avatar: "/economist-avatar.png" },
    comments: [
      { id: "c12", userId: "u14", username: "fed_watcher", avatar: "/finance-professional-avatar.png", content: "Leading indicators are mixed. Employment is still strong but manufacturing PMI is concerning.", timestamp: "1w ago", likes: 56 },
    ],
    outcomes: [],
  },
]

const sortOptions = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Most Followed", value: "followers" },
  { label: "Closing Soon", value: "closing" },
  { label: "Recently Resolved", value: "resolved" },
]

const categoryFilters = [
  { label: "All", value: "all" },
  { label: "Tech", value: "tech" },
  { label: "Finance", value: "finance" },
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Science", value: "science" },
  { label: "Gaming", value: "gaming" },
  { label: "Entertainment", value: "entertainment" },
  { label: "World", value: "world" },
]

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Correct", value: "correct" },
  { label: "Incorrect", value: "incorrect" },
]

function SourceBadge({ source }: { source: PredictionSource }) {
  const config = sourceTypeConfig[source.type]
  let name = ""
  let detail = ""
  let href = ""

  switch (source.type) {
    case "member":
      name = `u/${source.username}`
      href = `/user/${source.username}`
      break
    case "pundit":
      name = source.name
      detail = source.outlet
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
    case "tv":
      name = source.name
      detail = `${source.show} (${source.network})`
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
    case "author":
      name = source.name
      detail = source.publication
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
    case "politician":
      name = source.name
      detail = source.title
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
    case "celebrity":
      name = source.name
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
    case "analyst":
      name = source.name
      detail = source.firm
      href = source.slug ? `/figure/${source.slug}` : "#"
      break
  }

  const avatar = "avatar" in source ? source.avatar : undefined

  return (
    <Link href={href} className="flex items-center gap-1.5 group">
      {avatar && (
        <img
          src={avatar || "/placeholder.svg"}
          alt={name}
          className="w-5 h-5 rounded-full object-cover"
        />
      )}
      <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">{name}</span>
      {detail && <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">{detail}</span>}
    </Link>
  )
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFollowing, setIsFollowing] = useState(prediction.isFollowing || false)
  const [followerCount, setFollowerCount] = useState(prediction.followers)
  const [activeTab, setActiveTab] = useState<"comments" | "outcomes">("comments")
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(prediction.comments)
  const [outcomes, setOutcomes] = useState(prediction.outcomes)
  const [showOutcomeForm, setShowOutcomeForm] = useState(false)
  const [outcomeVerdict, setOutcomeVerdict] = useState<"correct" | "incorrect">("correct")
  const [outcomeEvidence, setOutcomeEvidence] = useState("")
  const [outcomeLink, setOutcomeLink] = useState("")

  const catConfig = categoryConfig[prediction.category]
  const CatIcon = catConfig.icon

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        userId: "me",
        username: "you",
        avatar: "/diverse-avatars.png",
        content: commentText,
        timestamp: "just now",
        likes: 0,
      },
    ])
    setCommentText("")
  }

  const handleSubmitOutcome = () => {
    if (!outcomeEvidence.trim()) return
    setOutcomes((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        userId: "me",
        username: "you",
        avatar: "/diverse-avatars.png",
        verdict: outcomeVerdict,
        evidence: outcomeEvidence,
        evidenceLink: outcomeLink || undefined,
        upvotes: 1,
        downvotes: 0,
        timestamp: "just now",
        userVote: "up",
      },
    ])
    setOutcomeEvidence("")
    setOutcomeLink("")
    setShowOutcomeForm(false)
  }

  const handleOutcomeVote = (outcomeId: string, vote: "up" | "down") => {
    setOutcomes((prev) =>
      prev.map((o) => {
        if (o.id !== outcomeId) return o
        const wasUp = o.userVote === "up"
        const wasDown = o.userVote === "down"
        if (vote === "up") {
          return {
            ...o,
            upvotes: wasUp ? o.upvotes - 1 : o.upvotes + 1,
            downvotes: wasDown ? o.downvotes - 1 : o.downvotes,
            userVote: wasUp ? null : "up",
          }
        } else {
          return {
            ...o,
            downvotes: wasDown ? o.downvotes - 1 : o.downvotes + 1,
            upvotes: wasUp ? o.upvotes - 1 : o.upvotes,
            userVote: wasDown ? null : "down",
          }
        }
      })
    )
  }

  return (
    <div className="border-b border-border/40 transition-colors hover:bg-card/50">
      <div className="flex">
        {/* Left column - Follow */}
        <div className="flex flex-col items-center pt-4 pb-3 px-3">
          <button
            onClick={handleFollow}
            className={cn(
              "flex flex-col items-center gap-0.5 p-1 rounded transition-all",
              isFollowing
                ? "text-primary/70"
                : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
            aria-label={isFollowing ? "Unfollow prediction" : "Follow prediction"}
          >
            {isFollowing ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            <span className="text-[9px] tabular-nums">{followerCount.toLocaleString()}</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 py-4 pr-4">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[10px] text-muted-foreground/60">{categoryConfig[prediction.category].label}</span>
            <span className="text-[10px] text-muted-foreground/30">{'/'}</span>
            <span className={cn(
              "text-[10px]",
              prediction.status === "correct" && "text-emerald-500/70",
              prediction.status === "incorrect" && "text-red-400/70",
              prediction.status === "pending" && "text-muted-foreground/60"
            )}>
              {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
            </span>
            <span className="text-[10px] text-muted-foreground/30">{'/'}</span>
            <span className="text-[10px] text-muted-foreground/50">{prediction.date}</span>
            {prediction.timeframe !== "Resolved" && (
              <>
                <span className="text-[10px] text-muted-foreground/30">{'/'}</span>
                <span className="text-[10px] text-muted-foreground/50">{prediction.timeframe}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-foreground/90 mb-2 text-balance leading-snug">
            {prediction.title}
          </h3>

          {/* Source */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <SourceBadge source={prediction.source} />
            {prediction.submittedBy && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                submitted by{" "}
                <Link href={`/user/${prediction.submittedBy.username}`} className="text-primary hover:underline">
                  u/{prediction.submittedBy.username}
                </Link>
              </span>
            )}
            {prediction.sourceUrl && (
              <a
                href={prediction.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                Source
              </a>
            )}
          </div>

          {/* Confidence bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-muted-foreground/50">Confidence</span>
            <div className="flex-1 h-1 bg-secondary/60 rounded-full overflow-hidden max-w-32">
              <div
                className="h-full rounded-full bg-primary/30 transition-all"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {prediction.confidence}%
            </span>
          </div>

          {/* Prediction text */}
          <p className="text-xs text-muted-foreground/70 mb-2 leading-relaxed">{prediction.prediction}</p>

          {prediction.outcome && (
            <p className={cn(
              "text-xs mb-2",
              prediction.status === "correct" ? "text-emerald-500/60" : "text-red-400/60"
            )}>
              Outcome: {prediction.outcome}
            </p>
          )}

          {/* Action row */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {comments.length} Comments
            </button>
            <button
              onClick={() => { setIsExpanded(true); setActiveTab("outcomes") }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Target className="w-4 h-4" />
              {outcomes.length} Outcomes
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded section */}
          {isExpanded && (
            <div className="mt-3 border-t border-border/30 pt-3">
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "text-[11px] transition-colors",
                    activeTab === "comments" ? "text-foreground/80" : "text-muted-foreground/50 hover:text-muted-foreground"
                  )}
                >
                  Comments ({comments.length})
                </button>
                <button
                  onClick={() => setActiveTab("outcomes")}
                  className={cn(
                    "text-[11px] transition-colors",
                    activeTab === "outcomes" ? "text-foreground/80" : "text-muted-foreground/50 hover:text-muted-foreground"
                  )}
                >
                  Outcomes ({outcomes.length})
                </button>
              </div>

              {activeTab === "comments" && (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img src={comment.avatar || "/placeholder.svg"} alt={comment.username} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Link href={`/user/${comment.username}`} className="text-xs font-medium text-foreground hover:text-primary">u/{comment.username}</Link>
                          <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                        <button className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-3 h-3" /> {comment.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <img src="/diverse-avatars.png" alt="You" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="h-8 text-xs bg-secondary border-0"
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      />
                      <Button size="sm" className="h-8 px-3" onClick={handleAddComment} disabled={!commentText.trim()}>
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "outcomes" && (
                <div className="space-y-3">
                  {outcomes.length > 0 ? (
                    outcomes.map((outcome) => (
                      <div key={outcome.id} className={cn(
                        "p-3 rounded-lg border",
                        outcome.verdict === "correct" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          <img src={outcome.avatar || "/placeholder.svg"} alt={outcome.username} className="w-5 h-5 rounded-full object-cover" />
                          <Link href={`/user/${outcome.username}`} className="text-xs font-medium hover:text-primary">u/{outcome.username}</Link>
                          <Badge variant="outline" className={cn(
                            "text-[10px] px-1.5 py-0 h-4",
                            outcome.verdict === "correct" ? "text-emerald-500 border-emerald-500/30" : "text-red-500 border-red-500/30"
                          )}>
                            {outcome.verdict === "correct" ? <CheckCircle2 className="w-3 h-3 mr-0.5" /> : <XCircle className="w-3 h-3 mr-0.5" />}
                            {outcome.verdict === "correct" ? "Correct" : "Incorrect"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">{outcome.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{outcome.evidence}</p>
                        {outcome.evidenceLink && (
                          <a href={outcome.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1 mb-2">
                            <Link2 className="w-3 h-3" /> View evidence
                          </a>
                        )}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOutcomeVote(outcome.id, "up")}
                            className={cn("flex items-center gap-1 text-[10px]", outcome.userVote === "up" ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500")}
                          >
                            <ChevronUp className="w-3 h-3" /> {outcome.upvotes}
                          </button>
                          <button
                            onClick={() => handleOutcomeVote(outcome.id, "down")}
                            className={cn("flex items-center gap-1 text-[10px]", outcome.userVote === "down" ? "text-red-500" : "text-muted-foreground hover:text-red-500")}
                          >
                            <ChevronDown className="w-3 h-3" /> {outcome.downvotes}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">No outcomes submitted yet. Be the first to verify this prediction.</p>
                  )}

                  {!showOutcomeForm ? (
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => setShowOutcomeForm(true)}>
                      <Plus className="w-3 h-3" /> Submit Outcome
                    </Button>
                  ) : (
                    <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOutcomeVerdict("correct")}
                          className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border", outcomeVerdict === "correct" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "text-muted-foreground border-border hover:bg-secondary")}
                        >
                          Correct
                        </button>
                        <button
                          onClick={() => setOutcomeVerdict("incorrect")}
                          className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border", outcomeVerdict === "incorrect" ? "bg-red-500/20 text-red-500 border-red-500/30" : "text-muted-foreground border-border hover:bg-secondary")}
                        >
                          Incorrect
                        </button>
                      </div>
                      <Textarea
                        value={outcomeEvidence}
                        onChange={(e) => setOutcomeEvidence(e.target.value)}
                        placeholder="Provide evidence for your verdict..."
                        className="text-xs min-h-16 bg-background"
                      />
                      <Input
                        value={outcomeLink}
                        onChange={(e) => setOutcomeLink(e.target.value)}
                        placeholder="Evidence link (optional)"
                        className="text-xs h-8 bg-background"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowOutcomeForm(false)}>Cancel</Button>
                        <Button size="sm" className="text-xs h-7" onClick={handleSubmitOutcome} disabled={!outcomeEvidence.trim()}>Submit</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PredictionsFeed() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeStatus, setActiveStatus] = useState("all")
  const [activeSort, setActiveSort] = useState("trending")

  const filtered = feedPredictions.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false
    if (activeStatus !== "all" && p.status !== activeStatus) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="pb-3 mb-1 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground/70">Predictions</h2>
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="text-[11px] bg-transparent border-0 text-muted-foreground/60 focus:outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex gap-1 flex-wrap">
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] transition-colors",
                activeCategory === cat.value
                  ? "bg-secondary text-foreground/80"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveStatus(s.value)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] transition-colors",
                activeStatus === s.value
                  ? "bg-secondary text-foreground/80"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions list */}
      {filtered.length > 0 ? (
        filtered.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No predictions match your filters.</p>
        </div>
      )}
    </div>
  )
}
