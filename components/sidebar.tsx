"use client"

import {
  Home,
  Flame,
  Clock,
  Bookmark,
  Settings,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", active: false },
  { icon: Flame, label: "Popular", active: false },
  { icon: TrendingUp, label: "Trending", active: false },
  { icon: Clock, label: "Recent", active: false },
]

export function Sidebar() {
  return (
    <aside className="hidden md:block w-36 shrink-0">
      <div className="sticky top-16 space-y-0.5">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors",
                item.active
                  ? "bg-secondary/60 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground transition-colors">
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary/30 hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>
    </aside>
  )
}
