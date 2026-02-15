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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type PredictionSource =
  | { type: "member"; username: string; avatar: string }
  | { type: "pundit"; name: string; outlet: string; avatar?: string }
  | { type: "tv"; name: string; show: string; network: string; avatar?: string }
  | { type: "author"; name: string; publication: string; avatar?: string }
  | { type: "politician"; name: string; title: string; avatar?: string }
  | { type: "celebrity"; name: string; avatar?: string }
  | { type: "analyst"; name: string; firm: string; avatar?: string }

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
  postLink: string
  followers: number
  isFollowing?: boolean
  comments: Comment[]
  outcomes: Outcome[]
  source?: PredictionSource
  sourceUrl?: string // Original source link (article, video, tweet, etc.)
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

const sourceTypeConfig = {
  member: { label: "Member", color: "bg-primary/20 text-primary" },
  pundit: { label: "Pundit", color: "bg-purple-500/20 text-purple-400" },
  tv: { label: "TV", color: "bg-blue-500/20 text-blue-400" },
  author: { label: "Author", color: "bg-amber-500/20 text-amber-400" },
  politician: { label: "Politician", color: "bg-red-500/20 text-red-400" },
  celebrity: { label: "Celebrity", color: "bg-pink-500/20 text-pink-400" },
  analyst: { label: "Analyst", color: "bg-emerald-500/20 text-emerald-400" },
}

const predictionsData: Record<string, Prediction[]> = {
  signal_drift: [
    {
      id: "1",
      title: "OpenAI valuation will exceed $300B by end of 2025",
      category: "finance",
      prediction: "OpenAI's valuation will surpass $300B within 12 months",
      timeframe: "12 months",
      confidence: 85,
      status: "pending",
      date: "Dec 2024",
      reasoning:
        "OpenAI's revenue trajectory, enterprise adoption, and strategic positioning make significant valuation growth highly likely.",
      postLink: "/",
      followers: 1247,
      isFollowing: false,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user1",
          username: "tech_watcher",
          avatar: "/analyst-avatar.png",
          content: "Solid analysis. The enterprise revenue numbers are definitely trending in that direction.",
          timestamp: "2 days ago",
          likes: 24,
        },
        {
          id: "c2",
          userId: "user2",
          username: "skeptic_sam",
          avatar: "/bear-avatar.png",
          content: "Competition from Anthropic and Google might slow this down. Bold prediction though.",
          timestamp: "1 day ago",
          likes: 12,
        },
      ],
      outcomes: [],
    },
    {
      id: "9",
      title: "Jim Cramer: NVIDIA will crash 50% in 2025",
      category: "finance",
      prediction: "NVIDIA stock will decline 50% from highs",
      timeframe: "12 months",
      confidence: 75,
      status: "pending",
      date: "Nov 2024",
      reasoning: "Stated on Mad Money that AI bubble is due for correction and NVIDIA is overvalued.",
      postLink: "/",
      followers: 8934,
      isFollowing: false,
      source: { type: "tv", name: "Jim Cramer", show: "Mad Money", network: "CNBC" },
      sourceUrl: "https://www.cnbc.com/mad-money/",
      comments: [
        {
          id: "c1",
          userId: "user10",
          username: "inverse_cramer",
          avatar: "/retail-trader-avatar.jpg",
          content: "Time to go long NVDA 🚀",
          timestamp: "3 days ago",
          likes: 2341,
        },
      ],
      outcomes: [],
    },
    {
      id: "10",
      title: "Cathie Wood: Tesla will hit $2,000 by 2027",
      category: "finance",
      prediction: "Tesla stock price target of $2,000",
      timeframe: "3 years",
      confidence: 90,
      status: "pending",
      date: "Oct 2024",
      reasoning: "Robotaxi revenue and FSD adoption will drive exponential growth according to ARK's models.",
      postLink: "/",
      followers: 5621,
      isFollowing: true,
      source: { type: "analyst", name: "Cathie Wood", firm: "ARK Invest" },
      sourceUrl: "https://ark-invest.com/articles/analyst-research/tesla-price-target/",
      comments: [],
      outcomes: [],
    },
    {
      id: "11",
      title: "Nate Silver: Trump will win 2024 election",
      category: "politics",
      prediction: "Donald Trump will win the 2024 presidential election",
      outcome: "Trump won electoral college",
      timeframe: "1 month",
      confidence: 52,
      status: "correct",
      date: "Oct 2024",
      reasoning: "Polling averages and economic sentiment models showed slight Trump advantage.",
      postLink: "/",
      followers: 12453,
      isFollowing: false,
      source: { type: "pundit", name: "Nate Silver", outlet: "Silver Bulletin" },
      sourceUrl: "https://www.natesilver.net/",
      comments: [
        {
          id: "c1",
          userId: "user11",
          username: "poll_watcher",
          avatar: "/analyst-avatar.png",
          content: "538 model was showing it as a tossup, but his personal newsletter had Trump slightly ahead.",
          timestamp: "1 month ago",
          likes: 892,
        },
      ],
      outcomes: [
        {
          id: "o1",
          userId: "verifier8",
          username: "election_results",
          avatar: "/economist-avatar.png",
          verdict: "correct",
          evidence: "Donald Trump won the 2024 presidential election with 312 electoral votes.",
          evidenceLink: "https://www.ap.org/elections",
          upvotes: 4521,
          downvotes: 234,
          timestamp: "Nov 6, 2024",
          userVote: null,
        },
      ],
    },
    {
      id: "12",
      title: "Elon Musk: We'll have AGI by 2026",
      category: "tech",
      prediction: "Artificial General Intelligence achieved within 2 years",
      timeframe: "2 years",
      confidence: 80,
      status: "pending",
      date: "Jul 2024",
      reasoning: "Based on xAI's Grok development and overall AI progress trajectory.",
      postLink: "/",
      followers: 15234,
      isFollowing: false,
      source: { type: "celebrity", name: "Elon Musk" },
      sourceUrl: "https://twitter.com/elonmusk/status/example",
      comments: [
        {
          id: "c1",
          userId: "user12",
          username: "ai_researcher",
          avatar: "/quant-avatar.jpg",
          content: "Define AGI first... This prediction is too vague to properly evaluate.",
          timestamp: "5 months ago",
          likes: 1247,
        },
      ],
      outcomes: [],
    },
    {
      id: "13",
      title: "Ray Dalio: China will invade Taiwan by 2027",
      category: "world",
      prediction: "Military conflict between China and Taiwan within 3 years",
      timeframe: "3 years",
      confidence: 35,
      status: "pending",
      date: "Mar 2024",
      reasoning:
        "From his book 'Principles for Dealing with the Changing World Order' - great power conflicts analysis.",
      postLink: "/",
      followers: 7823,
      isFollowing: true,
      source: { type: "author", name: "Ray Dalio", publication: "Bridgewater Associates" },
      sourceUrl: "https://www.principles.com/",
      comments: [],
      outcomes: [],
    },
    {
      id: "14",
      title: "Bill Ackman: Interest rates will stay higher for longer",
      category: "finance",
      prediction: "Fed funds rate above 4% through 2025",
      timeframe: "12 months",
      confidence: 70,
      status: "pending",
      date: "Sep 2024",
      reasoning: "Inflation persistence and strong labor market will prevent aggressive cuts.",
      postLink: "/",
      followers: 4521,
      isFollowing: false,
      source: { type: "analyst", name: "Bill Ackman", firm: "Pershing Square" },
      sourceUrl: "https://twitter.com/BillAckman/status/example",
      comments: [],
      outcomes: [],
    },
    {
      id: "2",
      title: "GPT-5 will be released before July 2025",
      category: "tech",
      prediction: "OpenAI will release GPT-5 in the first half of 2025",
      outcome: "GPT-5 announced May 2025",
      timeframe: "6 months",
      confidence: 72,
      status: "correct",
      date: "Nov 2024",
      reasoning:
        "Based on OpenAI's historical release cadence and statements from leadership about upcoming model releases.",
      postLink: "/",
      followers: 3892,
      isFollowing: true,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user3",
          username: "ai_insider",
          avatar: "/tech-trader-avatar.jpg",
          content: "Called it! Great prediction based on the release patterns.",
          timestamp: "3 weeks ago",
          likes: 156,
        },
      ],
      outcomes: [
        {
          id: "o1",
          userId: "verifier1",
          username: "fact_checker_pro",
          avatar: "/analyst-avatar.png",
          verdict: "correct",
          evidence:
            "OpenAI officially announced GPT-5 on May 14, 2025. The model was released to ChatGPT Plus subscribers the same day.",
          evidenceLink: "https://openai.com/blog/gpt-5",
          upvotes: 847,
          downvotes: 12,
          timestamp: "May 15, 2025",
          userVote: null,
        },
        {
          id: "o2",
          userId: "verifier2",
          username: "tech_reporter",
          avatar: "/investor-avatar-male.jpg",
          verdict: "correct",
          evidence: "Confirmed via OpenAI's official Twitter/X announcement and press release.",
          evidenceLink: "https://twitter.com/openai/status/example",
          upvotes: 234,
          downvotes: 3,
          timestamp: "May 15, 2025",
          userVote: "up",
        },
      ],
    },
    {
      id: "3",
      title: "Apple will announce AR glasses at WWDC 2025",
      category: "tech",
      prediction: "Apple will unveil consumer AR glasses",
      timeframe: "6 months",
      confidence: 65,
      status: "pending",
      date: "Dec 2024",
      reasoning:
        "Supply chain leaks, patent filings, and Vision Pro as stepping stone all point to imminent AR glasses launch.",
      postLink: "/",
      followers: 2156,
      isFollowing: false,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user4",
          username: "apple_analyst",
          avatar: "/finance-professional-avatar.png",
          content: "Kuo has been hinting at this. The supply chain evidence is compelling.",
          timestamp: "5 days ago",
          likes: 89,
        },
      ],
      outcomes: [],
    },
    {
      id: "4",
      title: "Lakers will miss the 2025 NBA Playoffs",
      category: "sports",
      prediction: "LA Lakers will not qualify for playoffs",
      outcome: "Lakers qualified as 7th seed",
      timeframe: "5 months",
      confidence: 58,
      status: "incorrect",
      date: "Oct 2024",
      reasoning: "Aging roster and Western Conference depth would prove too challenging. LeBron proved me wrong again.",
      postLink: "/",
      followers: 892,
      isFollowing: false,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user5",
          username: "lakers_fan_4life",
          avatar: "/retail-trader-avatar.jpg",
          content: "Never bet against LeBron in a contract year!",
          timestamp: "2 months ago",
          likes: 342,
        },
      ],
      outcomes: [
        {
          id: "o1",
          userId: "verifier3",
          username: "sports_stats",
          avatar: "/quant-avatar.jpg",
          verdict: "incorrect",
          evidence:
            "Lakers finished 7th in the Western Conference with a 47-35 record, qualifying for the playoffs via the play-in tournament.",
          evidenceLink: "https://www.nba.com/standings",
          upvotes: 156,
          downvotes: 2,
          timestamp: "Apr 15, 2025",
          userVote: null,
        },
      ],
    },
    {
      id: "5",
      title: "GTA 6 will be delayed to 2026",
      category: "gaming",
      prediction: "Rockstar will push GTA 6 release to 2026",
      outcome: "GTA 6 confirmed for Fall 2025",
      timeframe: "8 months",
      confidence: 70,
      status: "incorrect",
      date: "Apr 2024",
      reasoning: "Based on Rockstar's history of delays and scope of the project. They actually delivered on time.",
      postLink: "/",
      followers: 5621,
      isFollowing: true,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          userId: "verifier4",
          username: "gaming_news",
          avatar: "/day-trader-avatar.jpg",
          verdict: "incorrect",
          evidence: "Rockstar confirmed October 2025 release date at Take-Two investor call. Pre-orders now live.",
          evidenceLink: "https://www.rockstargames.com/gta-vi",
          upvotes: 2341,
          downvotes: 45,
          timestamp: "Jun 2, 2025",
          userVote: "up",
        },
      ],
    },
    {
      id: "6",
      title: "Oppenheimer will win Best Picture at Oscars 2024",
      category: "entertainment",
      prediction: "Oppenheimer sweeps major Academy Awards",
      outcome: "Won Best Picture, Director, Actor",
      timeframe: "2 months",
      confidence: 88,
      status: "correct",
      date: "Jan 2024",
      reasoning: "Critical acclaim, box office success, and awards season momentum made this a safe prediction.",
      postLink: "/",
      followers: 1834,
      isFollowing: false,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user6",
          username: "film_buff",
          avatar: "/economist-avatar.png",
          content: "This was a pretty safe bet tbh. The momentum was undeniable after the Globes.",
          timestamp: "10 months ago",
          likes: 67,
        },
      ],
      outcomes: [
        {
          id: "o1",
          userId: "verifier5",
          username: "awards_tracker",
          avatar: "/analyst-avatar.png",
          verdict: "correct",
          evidence:
            "Oppenheimer won 7 Oscars including Best Picture, Best Director (Nolan), and Best Actor (Murphy) at the 96th Academy Awards.",
          evidenceLink: "https://www.oscars.org/oscars/ceremonies/2024",
          upvotes: 567,
          downvotes: 8,
          timestamp: "Mar 11, 2024",
          userVote: null,
        },
      ],
    },
    {
      id: "7",
      title: "Fed will cut rates at least 3 times in 2024",
      category: "finance",
      prediction: "Federal Reserve will implement 3+ rate cuts",
      outcome: "Fed cut rates 3 times",
      timeframe: "12 months",
      confidence: 75,
      status: "correct",
      date: "Jan 2024",
      reasoning: "Inflation trajectory and economic indicators pointed to easing cycle beginning mid-2024.",
      postLink: "/",
      followers: 4521,
      isFollowing: true,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          userId: "verifier6",
          username: "fed_watcher",
          avatar: "/finance-professional-avatar.png",
          verdict: "correct",
          evidence:
            "Fed cut rates in September (-25bp), November (-25bp), and December (-25bp) 2024. Total cuts: 75bp.",
          evidenceLink: "https://www.federalreserve.gov/monetarypolicy.htm",
          upvotes: 892,
          downvotes: 15,
          timestamp: "Dec 19, 2024",
          userVote: "up",
        },
      ],
    },
    {
      id: "8",
      title: "SpaceX Starship will achieve successful orbital flight in 2024",
      category: "science",
      prediction: "Starship will complete full orbital mission",
      outcome: "Successful orbital flight Oct 2024",
      timeframe: "10 months",
      confidence: 80,
      status: "correct",
      date: "Feb 2024",
      reasoning: "Rapid iteration on previous failures and FAA clearance timeline suggested 2024 success was likely.",
      postLink: "/",
      followers: 7234,
      isFollowing: false,
      source: { type: "member", username: "signal_drift", avatar: "/dragon-avatar.jpg" },
      comments: [
        {
          id: "c1",
          userId: "user7",
          username: "space_enthusiast",
          avatar: "/tech-trader-avatar.jpg",
          content: "That booster catch was insane. Historic moment for spaceflight!",
          timestamp: "2 months ago",
          likes: 1247,
        },
        {
          id: "c2",
          userId: "user8",
          username: "rocket_scientist",
          avatar: "/quant-avatar.jpg",
          content: "The iteration speed SpaceX achieves is unprecedented. Great call on this one.",
          timestamp: "2 months ago",
          likes: 543,
        },
      ],
      outcomes: [
        {
          id: "o1",
          userId: "verifier7",
          username: "spaceflight_now",
          avatar: "/analyst-avatar.png",
          verdict: "correct",
          evidence:
            "SpaceX achieved first successful orbital Starship flight on October 13, 2024, including the historic 'chopstick' booster catch.",
          evidenceLink: "https://www.spacex.com/launches/mission/?missionId=starship-flight-5",
          upvotes: 3421,
          downvotes: 23,
          timestamp: "Oct 14, 2024",
          userVote: null,
        },
      ],
    },
  ],
  quant_alpha: [
    {
      id: "1",
      title: "Bitcoin will hit $100K before 2025",
      category: "finance",
      prediction: "BTC price will exceed $100,000",
      outcome: "BTC hit $104K in Dec 2024",
      timeframe: "12 months",
      confidence: 82,
      status: "correct",
      date: "Jan 2024",
      reasoning: "ETF approval catalyst combined with halving cycle dynamics.",
      postLink: "/",
      followers: 12453,
      isFollowing: false,
      source: { type: "member", username: "quant_alpha", avatar: "/quant-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          userId: "v1",
          username: "crypto_verified",
          avatar: "/investor-avatar-male.jpg",
          verdict: "correct",
          evidence: "Bitcoin reached $104,000 on December 5, 2024 according to CoinGecko and major exchanges.",
          evidenceLink: "https://www.coingecko.com/en/coins/bitcoin",
          upvotes: 4521,
          downvotes: 89,
          timestamp: "Dec 5, 2024",
          userVote: null,
        },
      ],
    },
    {
      id: "2",
      title: "EU will pass comprehensive AI regulation in 2024",
      category: "politics",
      prediction: "EU AI Act will be formally adopted",
      outcome: "AI Act passed March 2024",
      timeframe: "4 months",
      confidence: 90,
      status: "correct",
      date: "Dec 2023",
      reasoning: "Legislative timeline and political consensus made passage highly likely.",
      postLink: "/",
      followers: 3241,
      isFollowing: true,
      source: { type: "member", username: "quant_alpha", avatar: "/quant-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          userId: "v2",
          username: "eu_policy",
          avatar: "/economist-avatar.png",
          verdict: "correct",
          evidence: "The EU AI Act was formally adopted on March 13, 2024 by the European Parliament.",
          evidenceLink: "https://www.europarl.europa.eu/news/en/press-room/20240308IPR19015",
          upvotes: 1234,
          downvotes: 12,
          timestamp: "Mar 14, 2024",
          userVote: null,
        },
      ],
    },
    {
      id: "3",
      title: "Threads will surpass 500M users by mid-2024",
      category: "tech",
      prediction: "Meta's Threads will reach 500M MAU",
      outcome: "Threads at ~275M MAU",
      timeframe: "6 months",
      confidence: 65,
      status: "incorrect",
      date: "Jan 2024",
      reasoning: "Initial launch momentum suggested continued growth. Retention proved challenging.",
      postLink: "/",
      followers: 2341,
      isFollowing: false,
      source: { type: "member", username: "quant_alpha", avatar: "/quant-avatar.jpg" },
      comments: [],
      outcomes: [
        {
          id: "o1",
          userId: "v3",
          username: "social_metrics",
          avatar: "/tech-trader-avatar.jpg",
          verdict: "incorrect",
          evidence:
            "Meta reported Threads had approximately 275M monthly active users as of July 2024, well short of 500M target.",
          evidenceLink: "https://investor.fb.com/investor-news",
          upvotes: 892,
          downvotes: 34,
          timestamp: "Jul 26, 2024",
          userVote: null,
        },
      ],
    },
  ],
}

const defaultPredictions: Prediction[] = [
  {
    id: "1",
    title: "AI will write 50% of code by 2026",
    category: "tech",
    prediction: "Majority of production code will be AI-generated",
    timeframe: "18 months",
    confidence: 70,
    status: "pending",
    date: "Nov 2024",
    reasoning: "Rapid improvement in code generation models and enterprise adoption.",
    postLink: "/",
    followers: 892,
    isFollowing: false,
    source: { type: "member", username: "default_user", avatar: "/default-avatar.jpg" },
    comments: [],
    outcomes: [],
  },
]

function getSourceLink(source: PredictionSource): string {
  if (source.type === "member") {
    return `/user/${source.username}`
  }
  // Create slug from name for non-members
  const slug = ("name" in source ? source.name : "").toLowerCase().replace(/\s+/g, "-")
  return `/figure/${slug}`
}

function SourceBadge({ source, sourceUrl }: { source: PredictionSource; sourceUrl?: string }) {
  const config = sourceTypeConfig[source.type]
  const link = getSourceLink(source)

  if (source.type === "member") {
    return (
      <Link href={link} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Image
          src={source.avatar || "/placeholder.svg"}
          alt={source.username}
          width={20}
          height={20}
          className="w-5 h-5 rounded-full object-cover"
        />
        <span className="text-sm font-medium">u/{source.username}</span>
      </Link>
    )
  }

  const name = "name" in source ? source.name : ""
  const affiliation =
    source.type === "pundit"
      ? source.outlet
      : source.type === "tv"
        ? `${source.show} (${source.network})`
        : source.type === "author"
          ? source.publication
          : source.type === "analyst"
            ? source.firm
            : source.type === "politician"
              ? source.title
              : ""

  return (
    <div className="flex items-center gap-2">
      <Link href={link} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Badge variant="outline" className={cn("text-xs", config.color)}>
          {config.label}
        </Badge>
        <span className="text-sm font-medium">{name}</span>
        {affiliation && <span className="text-xs text-muted-foreground">({affiliation})</span>}
      </Link>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1 text-xs"
        >
          <ExternalLink className="w-3 h-3" />
          Source
        </a>
      )}
    </div>
  )
}

export function UserPredictions({ username }: { username: string }) {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "pending">("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>(predictionsData[username] || defaultPredictions)
  const [activeTab, setActiveTab] = useState<Record<string, "comments" | "outcomes">>({})
  const [showOutcomeForm, setShowOutcomeForm] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [newOutcome, setNewOutcome] = useState<{ verdict: "correct" | "incorrect"; evidence: string; link: string }>({
    verdict: "correct",
    evidence: "",
    link: "",
  })

  const filteredPredictions = filter === "all" ? predictions : predictions.filter((p) => p.status === filter)

  const stats = {
    total: predictions.length,
    correct: predictions.filter((p) => p.status === "correct").length,
    incorrect: predictions.filter((p) => p.status === "incorrect").length,
    pending: predictions.filter((p) => p.status === "pending").length,
  }

  const handleFollow = (predictionId: string) => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === predictionId
          ? { ...p, isFollowing: !p.isFollowing, followers: p.isFollowing ? p.followers - 1 : p.followers + 1 }
          : p,
      ),
    )
  }

  const handleOutcomeVote = (predictionId: string, outcomeId: string, vote: "up" | "down") => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === predictionId
          ? {
              ...p,
              outcomes: p.outcomes.map((o) => {
                if (o.id !== outcomeId) return o
                const prevVote = o.userVote
                if (prevVote === vote) {
                  // Remove vote
                  return {
                    ...o,
                    userVote: null,
                    upvotes: vote === "up" ? o.upvotes - 1 : o.upvotes,
                    downvotes: vote === "down" ? o.downvotes - 1 : o.downvotes,
                  }
                } else {
                  // Change or add vote
                  return {
                    ...o,
                    userVote: vote,
                    upvotes: vote === "up" ? o.upvotes + 1 : prevVote === "up" ? o.upvotes - 1 : o.upvotes,
                    downvotes: vote === "down" ? o.downvotes + 1 : prevVote === "down" ? o.downvotes - 1 : o.downvotes,
                  }
                }
              }),
            }
          : p,
      ),
    )
  }

  const handleAddComment = (predictionId: string) => {
    const content = newComment[predictionId]?.trim()
    if (!content) return

    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: "current_user",
      username: "you",
      avatar: "/dragon-avatar.jpg",
      content,
      timestamp: "Just now",
      likes: 0,
    }

    setPredictions((prev) =>
      prev.map((p) => (p.id === predictionId ? { ...p, comments: [...p.comments, comment] } : p)),
    )
    setNewComment((prev) => ({ ...prev, [predictionId]: "" }))
  }

  const handleAddOutcome = (predictionId: string) => {
    if (!newOutcome.evidence.trim()) return

    const outcome: Outcome = {
      id: `o${Date.now()}`,
      userId: "current_user",
      username: "you",
      avatar: "/dragon-avatar.jpg",
      verdict: newOutcome.verdict,
      evidence: newOutcome.evidence,
      evidenceLink: newOutcome.link || undefined,
      upvotes: 0,
      downvotes: 0,
      timestamp: "Just now",
      userVote: null,
    }

    setPredictions((prev) =>
      prev.map((p) => (p.id === predictionId ? { ...p, outcomes: [...p.outcomes, outcome] } : p)),
    )
    setShowOutcomeForm(null)
    setNewOutcome({ verdict: "correct", evidence: "", link: "" })
  }

  const getTabForPrediction = (id: string) => activeTab[id] || "comments"

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "correct", "incorrect", "pending"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
            <span className="ml-1 text-xs opacity-70">({f === "all" ? stats.total : stats[f]})</span>
          </Button>
        ))}
      </div>

      {/* Predictions list */}
      <div className="space-y-4">
        {filteredPredictions.map((prediction) => {
          const CategoryIcon = categoryConfig[prediction.category].icon
          const currentTab = activeTab[prediction.id] || "comments"

          return (
            <div key={prediction.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex">
                {/* Left column - Follow button with counter */}
                <div className="flex flex-col items-center p-4 border-r border-border bg-muted/30">
                  <Button
                    variant={prediction.isFollowing ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFollow(prediction.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[70px]",
                      prediction.isFollowing && "bg-primary text-primary-foreground",
                    )}
                  >
                    {prediction.isFollowing ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    <span className="text-xs font-semibold">{prediction.followers.toLocaleString()}</span>
                  </Button>
                </div>

                {/* Right column - Main content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn("p-2 rounded-lg", categoryConfig[prediction.category].bgColor)}>
                        <CategoryIcon className={cn("h-5 w-5", categoryConfig[prediction.category].color)} />
                      </div>
                      <div className="flex-1">
                        <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
                          {prediction.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">
                            {prediction.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {prediction.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {prediction.timeframe}
                          </span>
                        </div>
                        {/* Render source badge */}
                        <SourceBadge source={prediction.source!} sourceUrl={prediction.sourceUrl} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "capitalize",
                          prediction.status === "correct" && "bg-green-500/10 text-green-500 border-green-500/30",
                          prediction.status === "incorrect" && "bg-red-500/10 text-red-500 border-red-500/30",
                          prediction.status === "pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
                        )}
                      >
                        {prediction.status === "correct" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {prediction.status === "incorrect" && <XCircle className="h-3 w-3 mr-1" />}
                        {prediction.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {prediction.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Prediction details */}
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">Prediction:</span>
                      <span className="text-muted-foreground">{prediction.prediction}</span>
                    </div>
                    {prediction.outcome && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <CheckCircle2
                          className={cn("h-4 w-4", prediction.status === "correct" ? "text-green-500" : "text-red-500")}
                        />
                        <span className="font-medium">Outcome:</span>
                        <span className="text-muted-foreground">{prediction.outcome}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            prediction.confidence >= 80
                              ? "bg-green-500"
                              : prediction.confidence >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{prediction.confidence}%</span>
                    </div>
                  </div>

                  {/* Expand/collapse */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === prediction.id ? null : prediction.id)}
                    className="mt-2 text-muted-foreground hover:text-foreground"
                  >
                    {expandedId === prediction.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show reasoning, comments & outcomes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {/* End of restructured layout */}

              {/* Expanded content */}
              {expandedId === prediction.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Reasoning */}
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Reasoning</div>
                    <p className="text-sm">{prediction.reasoning}</p>
                    <Link
                      href={prediction.postLink}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View original post
                    </Link>
                  </div>

                  {/* Tab buttons */}
                  <div className="flex gap-2 border-b border-border">
                    <button
                      onClick={() => setActiveTab((prev) => ({ ...prev, [prediction.id]: "comments" }))}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                        currentTab === "comments"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Comments ({prediction.comments.length})
                    </button>
                    <button
                      onClick={() => setActiveTab((prev) => ({ ...prev, [prediction.id]: "outcomes" }))}
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                        currentTab === "outcomes"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Outcomes ({prediction.outcomes.length})
                    </button>
                  </div>

                  {/* Comments tab */}
                  {currentTab === "comments" && (
                    <div className="space-y-3">
                      {prediction.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
                      ) : (
                        prediction.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                            <Image
                              src={comment.avatar || "/placeholder.svg"}
                              alt={comment.username}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.username}</span>
                                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {comment.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add comment form */}
                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment[prediction.id] || ""}
                          onChange={(e) => setNewComment((prev) => ({ ...prev, [prediction.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(prediction.id)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddComment(prediction.id)}>
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
                        prediction.outcomes.map((outcome) => (
                          <div
                            key={outcome.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              outcome.verdict === "correct"
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-red-500/5 border-red-500/20",
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Image
                                src={outcome.avatar || "/placeholder.svg"}
                                alt={outcome.username}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{outcome.username}</span>
                                  <Badge
                                    className={cn(
                                      "text-xs",
                                      outcome.verdict === "correct"
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/20 text-red-400",
                                    )}
                                  >
                                    {outcome.verdict === "correct" ? "Correct" : "Incorrect"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{outcome.timestamp}</span>
                                </div>
                                <p className="text-sm mt-2">{outcome.evidence}</p>
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
                                {/* Vote buttons */}
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOutcomeVote(prediction.id, outcome.id, "up")}
                                    className={cn("h-7 text-xs", outcome.userVote === "up" && "text-emerald-500")}
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                    {outcome.upvotes}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOutcomeVote(prediction.id, outcome.id, "down")}
                                    className={cn("h-7 text-xs", outcome.userVote === "down" && "text-red-500")}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                    {outcome.downvotes}
                                  </Button>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {Math.round((outcome.upvotes / (outcome.upvotes + outcome.downvotes || 1)) * 100)}%
                                    agree
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add outcome button/form */}
                      {showOutcomeForm === prediction.id ? (
                        <div className="p-4 border border-border rounded-lg space-y-3">
                          <div className="text-sm font-medium">Submit Outcome Verification</div>
                          <div className="flex gap-2">
                            <Button
                              variant={newOutcome.verdict === "correct" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewOutcome((prev) => ({ ...prev, verdict: "correct" }))}
                              className={newOutcome.verdict === "correct" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Correct
                            </Button>
                            <Button
                              variant={newOutcome.verdict === "incorrect" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewOutcome((prev) => ({ ...prev, verdict: "incorrect" }))}
                              className={newOutcome.verdict === "incorrect" ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Incorrect
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Provide evidence for your verdict..."
                            value={newOutcome.evidence}
                            onChange={(e) => setNewOutcome((prev) => ({ ...prev, evidence: e.target.value }))}
                            className="min-h-[80px]"
                          />
                          <Input
                            placeholder="Evidence link (optional)"
                            value={newOutcome.link}
                            onChange={(e) => setNewOutcome((prev) => ({ ...prev, link: e.target.value }))}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAddOutcome(prediction.id)}>
                              Submit Outcome
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowOutcomeForm(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOutcomeForm(prediction.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Submit Outcome Verification
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filteredPredictions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No predictions found for this filter.</div>
        )}
      </div>
    </div>
  )
}
