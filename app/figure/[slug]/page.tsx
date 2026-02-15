import { Header } from "@/components/header"
import { FigureProfile } from "@/components/figure-profile"
import { FigurePredictions } from "@/components/figure-predictions"
import { FigureStats } from "@/components/figure-stats"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function FigurePage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FigureProfile slug={slug} />
            <FigurePredictions slug={slug} />
          </div>
          <div className="space-y-6">
            <FigureStats slug={slug} />
          </div>
        </div>
      </main>
    </div>
  )
}
