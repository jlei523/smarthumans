import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { PredictionsFeed } from "@/components/predictions-feed"
import { TrendingTopics } from "@/components/trending-topics"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <PredictionsFeed />
          </main>
          <aside className="hidden lg:block w-56 shrink-0">
            <TrendingTopics />
          </aside>
        </div>
      </div>
    </div>
  )
}
