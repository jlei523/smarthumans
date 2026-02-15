"use client"

import { useState } from "react"
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  AlertCircle,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PostDetail() {
  const [votes, setVotes] = useState(2847)
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null)

  const handleVote = (type: "up" | "down") => {
    if (voteState === type) {
      setVotes(2847)
      setVoteState(null)
    } else {
      setVotes(type === "up" ? 2848 : 2846)
      setVoteState(type)
    }
  }

  const confidenceScore = 72
  const confidenceFactors = [
    { label: "Track record verified", positive: true },
    { label: "Sources cited", positive: true },
    { label: "Potential bias detected", positive: false },
  ]

  return (
    <article className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote("up")}
              className={cn("p-1 rounded hover:bg-secondary transition-colors", voteState === "up" && "text-primary")}
            >
              <ArrowBigUp className="w-6 h-6" fill={voteState === "up" ? "currentColor" : "none"} />
            </button>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                voteState === "up" && "text-primary",
                voteState === "down" && "text-blue-500",
              )}
            >
              {votes.toLocaleString()}
            </span>
            <button
              onClick={() => handleVote("down")}
              className={cn(
                "p-1 rounded hover:bg-secondary transition-colors",
                voteState === "down" && "text-blue-500",
              )}
            >
              <ArrowBigDown className="w-6 h-6" fill={voteState === "down" ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <span>📈</span>
                r/stocks
              </Badge>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">Posted by u/signal_drift</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 gap-0.5 bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
              >
                <Trophy className="w-2.5 h-2.5" />
                Gold
              </Badge>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">12 hours ago</span>
              <Badge variant="outline" className="gap-1 text-xs border-primary/50 text-primary">
                <Sparkles className="w-3 h-3" />
                DD
              </Badge>
            </div>

            <h1 className="text-xl md:text-2xl font-bold mb-4 text-balance">
              Why OpenAI Will Likely Win the AI Race – A Deep Dive Into the Numbers
            </h1>

            <div className="prose prose-invert prose-sm max-w-none mb-4">
              <p className="text-muted-foreground leading-relaxed text-sm italic">
                <strong className="text-foreground">Edit:</strong> This was not written with any LLM help. If the
                comments don't follow this sub's rules (no trolling, no low effort posts), I'm going to delete this post
                and you guys can all go back to your circle jerk. And most of the time, the circle jerk is completely
                wrong. The popular opinion on this sub is almost always wrong. If the majority here thinks OpenAI is
                going to fail, it's most likely going to succeed. Here's your chance to actually learn why OpenAI might
                succeed. Reverse popular r/stocks opinion and all.
              </p>

              <h3 className="text-foreground font-semibold mt-4 mb-2">My track record:</h3>
              <ul className="text-muted-foreground space-y-1 mt-2 text-sm">
                <li>
                  <a href="#" className="text-primary hover:underline">
                    Buy the dip on AI stocks
                  </a>{" "}
                  (Up ~100% if you listened)
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">
                    Explain the Google/TSMC/Nvidia dynamic to me
                  </a>{" "}
                  (TSM recovered when people realized the same thing as me)
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">
                    My math on Oracle/OpenAI deal
                  </a>
                </li>
              </ul>

              <h3 className="text-foreground font-semibold mt-5 mb-2">I keep hearing this on this sub:</h3>
              <ul className="text-muted-foreground space-y-1 mt-2 text-sm">
                <li>OpenAI is going to be dead</li>
                <li>There is no profit in AI</li>
                <li>There is no proven business model</li>
                <li>Google is going to eat their lunch</li>
                <li>OpenAI is losing money for every token they serve to users</li>
                <li>They'll be sold for scraps soon</li>
              </ul>

              <h3 className="text-foreground font-semibold mt-5 mb-2">Here's the actual reality:</h3>
              <ul className="text-muted-foreground space-y-2 mt-2 text-sm">
                <li>
                  <strong className="text-foreground">OpenAI has nearly ~1 billion active users</strong>
                </li>
                <li>
                  <strong className="text-foreground">OpenAI has incredible branding.</strong> None of my friends know
                  what Gemini or Claude are. They all know what ChatGPT is and has the app installed. "Ask ChatGPT" is
                  the same as "google it" now.
                </li>
                <li>
                  <strong className="text-foreground">OpenAI said they have $13b revenue in 2025.</strong> 3.5x growth
                  from 2024. They also said they have $20b annualized revenue (meaning take the recent revenue and
                  project to 1 year).
                </li>
                <li>
                  <strong className="text-foreground">Sam Altman said they are very profitable on inference.</strong>{" "}
                  They do not lose money on inference.{" "}
                  <a href="#" className="text-primary hover:underline">
                    Source
                  </a>
                </li>
                <li>
                  OpenAI only loses money because they have to keep training new models. They have to train new models
                  because competition is ruthless right now. Everyone is going all in on AI.
                </li>
                <li>
                  <strong className="text-foreground">
                    OpenAI is getting ready to show ads to their 1 billion users.
                  </strong>{" "}
                  They have the most personal data on users in the world - more than Meta, more than Google.
                </li>
                <li>
                  This is why Meta and Google are all in on AI - because OpenAI is an existential threat to their core
                  business of digital ads.
                </li>
                <li>
                  If they 3.5x their revenue again, they'll hit $45b. That's 4 years after launching their first
                  product. Insane rise for a digital service.
                </li>
                <li>
                  <strong className="text-foreground">
                    But wait, if they have to keep training models, they'll never be profitable, right?
                  </strong>{" "}
                  No. Their revenue can scale faster than their training costs. That's how they can become very
                  profitable.
                </li>
                <li>
                  <strong className="text-foreground">Gemini 3 left GPT5.1 in the dust right?</strong> Not exactly. When
                  it comes to coding, software engineers (myself included) still find that GPT5 Codex Max as the top
                  coding model along with Claude Opus 4.5. There are talks of Gemini 3 being trained to win benchmarks
                  but fall short in real world problems.
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-3 text-sm">
                That said, Gemini 3 is legitimately the best overall model it seems. So Google is ahead as of right now.
                OpenAI, Anthropic, and Google each leapfrog each other. Competition is ruthless.
              </p>

              <h3 className="text-foreground font-semibold mt-5 mb-2">
                So what is the conclusion from all of this and how does it relate to stocks?
              </h3>
              <ul className="text-muted-foreground space-y-2 mt-2 text-sm">
                <li>
                  <strong className="text-foreground">If you own Google stocks, congrats.</strong> It's a great buy. If
                  AI becomes a duopoly (very natural in tech), then I think Google will be one of them. Don't sell your
                  Google. Maybe even buy more.
                </li>
                <li>
                  <strong className="text-foreground">
                    OpenAI has a very strong chance of being the other winner.
                  </strong>{" "}
                  In fact, my guess right now is that OpenAI will emerge as the overall winner and Google will take
                  second place.
                </li>
                <li>
                  The sub's sentiment has swung way too much to pro-Google and anti-OpenAI and anti-Nvidia. I have more
                  to say on Nvidia vs Google but that's another post.
                </li>
                <li>
                  <strong className="text-foreground">OpenAI's compute demand is very likely real</strong> and based on
                  real revenue projections. In AI, the more compute you have, the better model you have, the more users
                  you can serve, the faster tokens can generate which means the better the experience for users. Compute
                  is everything in AI right now.
                </li>
                <li>
                  <strong className="text-foreground">The AI bubble isn't going to pop</strong> until after OpenAI, who
                  started this all, goes public and euphoria reaches another level. It's a bubble when AI companies with
                  little to no revenue goes public and gets tens of billions in valuation. Right now, this hasn't
                  happened. All public AI companies right now have strong fundamentals. If anything, they'll just spend
                  a little less on AI but it's not going to collapse like the media tells you.
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>847 Comments</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground ml-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-3 bg-secondary/30 border-t border-border">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">AI Summary:</span> Bullish DD on OpenAI - argues $13B
                revenue, 1B users, strong branding, and profitable inference make OpenAI a likely AI duopoly winner
                alongside Google. Refutes common bearish narratives on r/stocks.
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-2 cursor-help">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${confidenceScore}%` }} />
                      </div>
                      <span className="text-xs font-medium text-yellow-500">{confidenceScore}%</span>
                    </div>
                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium text-xs mb-1">AI Confidence Analysis</p>
                  <ul className="text-xs space-y-1">
                    {confidenceFactors.map((factor, i) => (
                      <li
                        key={i}
                        className={cn(
                          "flex items-center gap-1",
                          factor.positive ? "text-emerald-400" : "text-yellow-400",
                        )}
                      >
                        <span>{factor.positive ? "✓" : "!"}</span>
                        {factor.label}
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </article>
  )
}
