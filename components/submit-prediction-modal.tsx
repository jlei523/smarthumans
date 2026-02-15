"use client"

import { useState } from "react"
import {
  X,
  Search,
  User,
  Tv,
  BookOpen,
  Briefcase,
  Mic,
  Calendar,
  LinkIcon,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SubmitPredictionModalProps {
  isOpen: boolean
  onClose: () => void
  prefillSource?: {
    type: "member" | "figure"
    name: string
    slug: string
    avatar?: string
  }
}

type Step = "source" | "details" | "review"
type SourceType = "member" | "pundit" | "tv" | "author" | "politician" | "celebrity" | "analyst"

const sourceTypeConfig: Record<SourceType, { icon: typeof User; label: string; color: string }> = {
  member: { icon: User, label: "Member", color: "bg-primary/20 text-primary border-primary/30" },
  pundit: { icon: Mic, label: "Pundit", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  tv: { icon: Tv, label: "TV Personality", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  author: { icon: BookOpen, label: "Author", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  politician: { icon: Briefcase, label: "Politician", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  celebrity: { icon: Mic, label: "Celebrity", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  analyst: { icon: Briefcase, label: "Analyst", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
}

const categories = [
  { value: "tech", label: "Technology", color: "bg-blue-500/20 text-blue-400" },
  { value: "politics", label: "Politics", color: "bg-red-500/20 text-red-400" },
  { value: "sports", label: "Sports", color: "bg-green-500/20 text-green-400" },
  { value: "entertainment", label: "Entertainment", color: "bg-pink-500/20 text-pink-400" },
  { value: "finance", label: "Finance", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "science", label: "Science", color: "bg-purple-500/20 text-purple-400" },
  { value: "gaming", label: "Gaming", color: "bg-orange-500/20 text-orange-400" },
  { value: "world", label: "World Events", color: "bg-cyan-500/20 text-cyan-400" },
]

const suggestedMembers = [
  { username: "auradragon1", avatar: "/dragon-avatar.jpg", tier: "platinum" },
  { username: "quant_alpha", avatar: "/quant-avatar.jpg", tier: "diamond" },
  { username: "tech_oracle_23", avatar: "/analyst-avatar.png", tier: "platinum" },
]

const suggestedFigures = [
  { name: "Jim Cramer", slug: "jim-cramer", type: "tv" as SourceType, avatar: "/jim-cramer-tv-host.jpg" },
  { name: "Cathie Wood", slug: "cathie-wood", type: "analyst" as SourceType, avatar: "/cathie-wood-ark-invest.jpg" },
  { name: "Elon Musk", slug: "elon-musk", type: "celebrity" as SourceType, avatar: "/elon-musk-tech-ceo.jpg" },
]

export function SubmitPredictionModal({ isOpen, onClose, prefillSource }: SubmitPredictionModalProps) {
  const [step, setStep] = useState<Step>(prefillSource ? "details" : "source")
  const [sourceType, setSourceType] = useState<SourceType>(
    prefillSource?.type === "figure" ? "pundit" : prefillSource?.type || "member",
  )
  const [sourceSearch, setSourceSearch] = useState("")
  const [selectedSource, setSelectedSource] = useState<{
    type: SourceType
    name: string
    slug: string
    avatar?: string
    affiliation?: string
  } | null>(
    prefillSource
      ? {
          type: prefillSource.type === "figure" ? "pundit" : "member",
          name: prefillSource.name,
          slug: prefillSource.slug,
          avatar: prefillSource.avatar,
        }
      : null,
  )
  const [isNewFigure, setIsNewFigure] = useState(false)
  const [newFigure, setNewFigure] = useState({ name: "", affiliation: "", type: "pundit" as SourceType })

  // Prediction details
  const [prediction, setPrediction] = useState("")
  const [category, setCategory] = useState("")
  const [deadline, setDeadline] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [sourceDate, setSourceDate] = useState("")
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium")
  const [reasoning, setReasoning] = useState("")

  if (!isOpen) return null

  const handleSourceSelect = (source: typeof selectedSource) => {
    setSelectedSource(source)
    setIsNewFigure(false)
    setStep("details")
  }

  const handleNewFigureSubmit = () => {
    if (newFigure.name) {
      setSelectedSource({
        type: newFigure.type,
        name: newFigure.name,
        slug: newFigure.name.toLowerCase().replace(/\s+/g, "-"),
        affiliation: newFigure.affiliation,
      })
      setStep("details")
    }
  }

  const handleSubmit = () => {
    // Submit logic would go here
    onClose()
  }

  const renderSourceStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Who made this prediction?</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(sourceTypeConfig) as SourceType[]).map((type) => {
            const config = sourceTypeConfig[type]
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => {
                  setSourceType(type)
                  setIsNewFigure(false)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  sourceType === type ? config.color : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
                )}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      {sourceType === "member" ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Suggested members</p>
            {suggestedMembers.map((member) => (
              <button
                key={member.username}
                onClick={() =>
                  handleSourceSelect({
                    type: "member",
                    name: member.username,
                    slug: member.username,
                    avatar: member.avatar,
                  })
                }
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <img
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">u/{member.username}</div>
                  <div className="text-xs text-muted-foreground capitalize">{member.tier} tier</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search public figures..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>

          {!isNewFigure ? (
            <>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Tracked figures</p>
                {suggestedFigures
                  .filter((f) => sourceType === "pundit" || f.type === sourceType)
                  .map((figure) => {
                    const config = sourceTypeConfig[figure.type]
                    const Icon = config.icon
                    return (
                      <button
                        key={figure.slug}
                        onClick={() =>
                          handleSourceSelect({
                            type: figure.type,
                            name: figure.name,
                            slug: figure.slug,
                            avatar: figure.avatar,
                          })
                        }
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <img
                          src={figure.avatar || "/placeholder.svg"}
                          alt={figure.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{figure.name}</div>
                          <Badge variant="outline" className={cn("text-xs mt-1", config.color)}>
                            <Icon className="w-2.5 h-2.5 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )
                  })}
              </div>

              <button
                onClick={() => setIsNewFigure(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary"
              >
                <Plus className="w-4 h-4" />
                Add new public figure
              </button>
            </>
          ) : (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium text-sm">Add new public figure</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                  <Input
                    placeholder="e.g. Warren Buffett"
                    value={newFigure.name}
                    onChange={(e) => setNewFigure({ ...newFigure, name: e.target.value })}
                    className="bg-secondary border-0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Affiliation</label>
                  <Input
                    placeholder="e.g. Berkshire Hathaway"
                    value={newFigure.affiliation}
                    onChange={(e) => setNewFigure({ ...newFigure, affiliation: e.target.value })}
                    className="bg-secondary border-0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(["pundit", "tv", "author", "analyst", "politician", "celebrity"] as SourceType[]).map((type) => {
                      const config = sourceTypeConfig[type]
                      return (
                        <button
                          key={type}
                          onClick={() => setNewFigure({ ...newFigure, type })}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border transition-all",
                            newFigure.type === type
                              ? config.color
                              : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
                          )}
                        >
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsNewFigure(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleNewFigureSubmit} disabled={!newFigure.name} className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-5">
      {/* Selected source display */}
      {selectedSource && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {selectedSource.avatar ? (
            <img
              src={selectedSource.avatar || "/placeholder.svg"}
              alt={selectedSource.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium">
              {selectedSource.type === "member" ? `u/${selectedSource.name}` : selectedSource.name}
            </div>
            {selectedSource.affiliation && (
              <div className="text-xs text-muted-foreground">{selectedSource.affiliation}</div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep("source")} className="text-xs">
            Change
          </Button>
        </div>
      )}

      {/* Prediction text */}
      <div>
        <label className="text-sm font-medium mb-2 block">Prediction *</label>
        <textarea
          placeholder="What did they predict? Be specific and include measurable outcomes if possible."
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          className="w-full h-24 px-3 py-2 rounded-lg bg-secondary border-0 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category *</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat.value
                  ? cat.color + " border-current"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="text-sm font-medium mb-2 block">Resolution deadline *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">When should this prediction be evaluated?</p>
      </div>

      {/* Source URL */}
      <div>
        <label className="text-sm font-medium mb-2 block">Source URL</label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="https://twitter.com/... or article link"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Link to the original prediction (tweet, article, video)</p>
      </div>

      {/* Source date */}
      <div>
        <label className="text-sm font-medium mb-2 block">When was this predicted?</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={sourceDate}
            onChange={(e) => setSourceDate(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
      </div>

      {/* Confidence */}
      <div>
        <label className="text-sm font-medium mb-2 block">Implied confidence</label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setConfidence(level)}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                confidence === level
                  ? level === "low"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : level === "medium"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">How confident did they seem about this prediction?</p>
      </div>

      {/* Additional context */}
      <div>
        <label className="text-sm font-medium mb-2 block">Additional context (optional)</label>
        <textarea
          placeholder="Any relevant context about the prediction..."
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          className="w-full h-20 px-3 py-2 rounded-lg bg-secondary border-0 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
        {/* Source */}
        <div className="flex items-center gap-3">
          {selectedSource?.avatar ? (
            <img
              src={selectedSource.avatar || "/placeholder.svg"}
              alt={selectedSource.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <div className="font-medium">
              {selectedSource?.type === "member" ? `u/${selectedSource?.name}` : selectedSource?.name}
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs mt-1", sourceTypeConfig[selectedSource?.type || "member"].color)}
            >
              {sourceTypeConfig[selectedSource?.type || "member"].label}
            </Badge>
          </div>
        </div>

        {/* Prediction */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Prediction</p>
          <p className="font-medium">{prediction || "No prediction entered"}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="capitalize">{category || "Not selected"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p>{deadline || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="capitalize">{confidence}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Predicted on</p>
            <p>{sourceDate || "Not specified"}</p>
          </div>
        </div>

        {sourceUrl && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Source</p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate block"
            >
              {sourceUrl}
            </a>
          </div>
        )}

        {reasoning && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Context</p>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-400">AI will verify this submission</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Our AI will check for duplicates and validate the source before publishing.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-400">Community guidelines</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Predictions must be verifiable and have clear resolution criteria. False submissions may affect your ELO.
          </p>
        </div>
      </div>
    </div>
  )

  const canProceedToReview = prediction && category && deadline
  const currentStepIndex = step === "source" ? 0 : step === "details" ? 1 : 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-xl border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Submit Prediction</h2>
            <p className="text-xs text-muted-foreground">
              {step === "source" && "Step 1: Select who made the prediction"}
              {step === "details" && "Step 2: Enter prediction details"}
              {step === "review" && "Step 3: Review and submit"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-4 pt-4">
          {["source", "details", "review"].map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                i <= currentStepIndex ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === "source" && renderSourceStep()}
          {step === "details" && renderDetailsStep()}
          {step === "review" && renderReviewStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === "details") setStep("source")
              else if (step === "review") setStep("details")
              else onClose()
            }}
          >
            {step === "source" ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => {
              if (step === "source" && selectedSource) setStep("details")
              else if (step === "details" && canProceedToReview) setStep("review")
              else if (step === "review") handleSubmit()
            }}
            disabled={(step === "source" && !selectedSource) || (step === "details" && !canProceedToReview)}
          >
            {step === "review" ? "Submit Prediction" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
