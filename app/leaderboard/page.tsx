import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { SiteHeader } from "@/components/site-header"

export default function LeaderboardPage() {
  return (
    <div className="min-h-[100svh] bg-black text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24 space-y-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
          <h1 className="text-4xl font-orbitron text-glow">Ardra leaderboard</h1>
          <p className="mt-3 text-sm text-white/60">
            Watch who is leading the Ardra ecosystem. Referrals grant 10% of generated fees, so share your code from the
            profile section and farm together.
          </p>
        </div>
        <LeaderboardTable />
      </div>
    </div>
  )
}

