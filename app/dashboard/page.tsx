import { SiteHeader } from "@/components/site-header"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default function DashboardPage() {
  return (
    <div className="min-h-[100svh] bg-[#05040f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
          <p className="text-sm uppercase tracking-[0.45em] text-cyan-200/80">Telemetry</p>
          <h1 className="mt-2 font-orbitron text-4xl text-glow">Ardra Dashboard</h1>
          <p className="mt-3 text-sm text-white/70">
            Watch every point and fee you and your referrals generate per Perp DEX. Powered by the same real-time backend that feeds the leaderboard.
          </p>
        </div>

        <div className="mt-10">
          <DashboardClient />
        </div>
      </main>
    </div>
  )
}
