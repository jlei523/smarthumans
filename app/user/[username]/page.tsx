import { Header } from "@/components/header"
import { UserProfile } from "@/components/user-profile"
import { UserPredictions } from "@/components/user-predictions"
import { UserStats } from "@/components/user-stats"

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UserProfile username={username} />
            <UserPredictions username={username} />
          </div>
          <div className="space-y-6">
            <UserStats username={username} />
          </div>
        </div>
      </main>
    </div>
  )
}
