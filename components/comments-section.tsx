"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Comment, type CommentData } from "@/components/comment"
import { SortDesc, Shield } from "lucide-react"

const commentsData: CommentData[] = [
  {
    id: "1",
    author: "value_investor_42",
    avatar: "/investor-avatar.png",
    content:
      "Finally, someone with actual DD instead of \"AI is a bubble\" doomerism. I've been accumulating MSFT partly because of their OpenAI stake. The $13B revenue figure is nuts for a company that launched ChatGPT just 2 years ago.\n\nOne thing I'd add: the enterprise API revenue is probably more sticky than consumer subscriptions. Companies are building entire workflows around GPT.",
    votes: 847,
    timeAgo: "6h",
    isAIVerified: true,
    elo: 1820,
    replies: [
      {
        id: "1-1",
        author: "signal_drift",
        avatar: "/dragon-avatar.jpg",
        content:
          'Exactly. The enterprise moat is underrated. Once you\'ve fine-tuned models on your proprietary data and integrated it into your stack, switching costs are massive. This is why I think the "Google will eat their lunch" narrative is overblown.',
        votes: 423,
        timeAgo: "5h",
        isOP: true,
        elo: 1542,
        replies: [
          {
            id: "1-1-1",
            author: "tech_fundamentals",
            avatar: "/analyst-avatar.png",
            content:
              "The switching cost argument is strong. We integrated GPT-4 at my company and the thought of migrating to Gemini makes everyone groan. Too much custom tooling built around OpenAI's API.",
            votes: 89,
            timeAgo: "4h",
            elo: 1340,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    author: "bear_case_bob",
    avatar: "/bear-avatar.png",
    content:
      "I appreciate the effort but you're glossing over the burn rate. They're spending $8-10B/year on compute alone. Revenue growing 3.5x means nothing if costs grow faster. And the ad revenue thesis is pure speculation - ChatGPT's UX doesn't lend itself to ads like search does.",
    votes: 312,
    timeAgo: "5h",
    elo: 1650,
    replies: [
      {
        id: "2-1",
        author: "signal_drift",
        avatar: "/dragon-avatar.jpg",
        content:
          "Fair pushback on the ad thesis - it's definitely speculative. But on burn rate: inference costs are dropping ~50% per year due to hardware improvements and optimization. Their cost structure in 2026 will look very different than today. The question is whether they can ride the curve.",
        votes: 198,
        timeAgo: "4h",
        isOP: true,
        elo: 1542,
        isAIVerified: true,
        replies: [],
      },
    ],
  },
  {
    id: "3",
    author: "retail_degen",
    avatar: "/retail-trader-avatar.jpg",
    content: "So what's the play here? We can't buy OpenAI directly. MSFT? NVDA? Or wait for the IPO?",
    votes: 256,
    timeAgo: "4h",
    elo: 980,
    replies: [
      {
        id: "3-1",
        author: "signal_drift",
        avatar: "/dragon-avatar.jpg",
        content:
          "MSFT gives you indirect exposure through their 49% stake. NVDA benefits regardless of who wins the AI race since everyone needs their chips. For pure OpenAI exposure, you'd have to wait for the IPO or buy secondary shares if you're accredited. I personally hold both MSFT and GOOGL.",
        votes: 445,
        timeAgo: "3h",
        isOP: true,
        elo: 1542,
        replies: [
          {
            id: "3-1-1",
            author: "retail_degen",
            avatar: "/retail-trader-avatar.jpg",
            content: "Appreciate the breakdown. Already heavy in NVDA, might add some MSFT on the next dip.",
            votes: 67,
            timeAgo: "3h",
            elo: 980,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "4",
    author: "quant_skeptic",
    avatar: "/quant-avatar.jpg",
    content:
      "The $300B valuation at $13B revenue is a 23x multiple. Even SaaS companies at peak hype rarely traded above 20x. You're betting on continued hypergrowth which historically reverts to mean. What's your bear case scenario?",
    votes: 189,
    timeAgo: "3h",
    isAIVerified: true,
    elo: 2150,
    replies: [],
  },
]

export function CommentsSection() {
  const [commentText, setCommentText] = useState("")

  return (
    <div className="mt-4 bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Comments</h2>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <SortDesc className="w-4 h-4" />
            Best
          </Button>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What are your thoughts?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>LLM moderation active</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-primary cursor-pointer hover:underline">View rules</span>
              </div>
              <Button size="sm" disabled={!commentText.trim()}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-0">
        {commentsData.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
