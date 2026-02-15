"use client"

import { useState } from "react"
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CommentData {
  id: string
  author: string
  avatar: string
  content: string
  votes: number
  timeAgo: string
  isOP?: boolean
  isAIVerified?: boolean
  elo?: number
  replies: CommentData[]
}

function getEloTier(elo: number) {
  if (elo >= 2000) return { label: "Diamond", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" }
  if (elo >= 1700) return { label: "Platinum", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" }
  if (elo >= 1400) return { label: "Gold", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" }
  if (elo >= 1100) return { label: "Silver", color: "bg-slate-400/20 text-slate-300 border-slate-400/50" }
  return { label: "Bronze", color: "bg-orange-700/20 text-orange-400 border-orange-700/50" }
}

interface CommentProps {
  comment: CommentData
  depth?: number
}

export function Comment({ comment, depth = 0 }: CommentProps) {
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [showReply, setShowReply] = useState(false)

  const handleVote = (type: "up" | "down") => {
    if (voteState === type) {
      setVoteState(null)
    } else {
      setVoteState(type)
    }
  }

  const maxDepth = 4
  const isMaxDepth = depth >= maxDepth
  const eloTier = comment.elo ? getEloTier(comment.elo) : null

  return (
    <div className={cn("group", depth > 0 && "ml-4 md:ml-6 pl-4 border-l-2 border-border")}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.avatar || "/placeholder.svg"} />
              <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2">
                <span className="font-medium text-sm hover:underline">u/{comment.author}</span>
                {comment.isOP && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
                    OP
                  </Badge>
                )}
                {eloTier && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-0.5", eloTier.color)}>
                    <Trophy className="w-2.5 h-2.5" />
                    {eloTier.label}
                  </Badge>
                )}
                {comment.isAIVerified && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Verified
                  </Badge>
                )}
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs">{comment.timeAgo}</span>
              {collapsed && (
                <>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs">{comment.replies.length} replies</span>
                </>
              )}
            </div>

            {!collapsed && (
              <>
                <p className="text-sm mt-1.5 whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {comment.content}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => handleVote("up")}
                    className={cn(
                      "p-1 rounded hover:bg-secondary transition-colors",
                      voteState === "up" && "text-primary",
                    )}
                  >
                    <ArrowBigUp className="w-5 h-5" fill={voteState === "up" ? "currentColor" : "none"} />
                  </button>
                  <span className="text-xs text-muted-foreground px-1">Vote</span>
                  <button
                    onClick={() => handleVote("down")}
                    className={cn(
                      "p-1 rounded hover:bg-secondary transition-colors",
                      voteState === "down" && "text-blue-500",
                    )}
                  >
                    <ArrowBigDown className="w-5 h-5" fill={voteState === "down" ? "currentColor" : "none"} />
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-7 px-2 ml-2"
                    onClick={() => setShowReply(!showReply)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Reply</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-7 w-7 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} depth={isMaxDepth ? depth : depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
