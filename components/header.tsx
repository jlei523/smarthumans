"use client"

import { useState } from "react"
import { Search, Bell, Sparkles, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SubmitPredictionModal } from "@/components/submit-prediction-modal"

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">SmartHumans<span className="text-primary/80">.ai</span></span>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input
                placeholder="Search predictions..."
                className="pl-9 h-8 text-xs bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
            </Button>
            <Button variant="ghost" className="gap-1.5 px-1.5 h-8">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/diverse-avatars.png" />
                <AvatarFallback className="text-[10px]">JD</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 text-muted-foreground/60" />
            </Button>
          </div>
        </div>
      </header>

      <SubmitPredictionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
