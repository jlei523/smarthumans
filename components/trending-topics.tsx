"use client"

import { TrendingUp, Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const trendingTopics = [
  { topic: "Claude 4 Release", posts: "12.4K", growth: "+340%" },
  { topic: "Axiom-7B Benchmarks", posts: "8.2K", growth: "+220%" },
  { topic: "OpenAI GPT-5 Rumors", posts: "6.8K", growth: "+180%" },
  { topic: "AI Regulation EU", posts: "4.1K", growth: "+95%" },
  { topic: "Llama 4 Speculation", posts: "3.7K", growth: "+85%" },
]

const relatedPosts = [
  { title: "Comparing Axiom-7B with Claude Sonnet on coding tasks", votes: "2.4K", comments: 342 },
  { title: "How to fine-tune Axiom-7B for domain-specific reasoning", votes: "1.8K", comments: 156 },
  { title: "Axiom-7B running on M3 Max - inference benchmarks", votes: "1.2K", comments: 89 },
]

export function TrendingTopics() {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Trending in AI</h3>
          </div>
        </div>
        <div className="p-2">
          {trendingTopics.map((item, index) => (
            <button
              key={item.topic}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
            >
              <span className="text-muted-foreground text-xs font-medium w-4">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.topic}</div>
                <div className="text-xs text-muted-foreground">{item.posts} posts</div>
              </div>
              <span className="text-xs text-green-500 font-medium">{item.growth}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Related Posts</h3>
          </div>
        </div>
        <div className="p-2">
          {relatedPosts.map((post) => (
            <button
              key={post.title}
              className="w-full flex flex-col gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="text-sm font-medium line-clamp-2">{post.title}</div>
              <div className="text-xs text-muted-foreground">
                {post.votes} votes • {post.comments} comments
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">AI-Powered Features</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Get AI summaries, fact-checking, and personalized recommendations.
        </p>
        <Button size="sm" className="w-full gap-2">
          <ExternalLink className="w-3 h-3" />
          Learn More
        </Button>
      </div>
    </div>
  )
}
