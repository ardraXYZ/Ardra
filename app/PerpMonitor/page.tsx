import { fetchPerpDexData } from "@/lib/api/perp-dex-data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PerpDexMetricShell } from "@/components/perp-dexs/perp-dex-metric-shell"
import { LoginPrompt } from "@/components/auth/login-prompt"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const metadata = {
    title: "PerpMonitor | Ardra",
    description: "Monitor for live volume and open interest across the top Perp DEXs.",
}

export default async function PerpMonitorPage() {
    const session = await auth()
    if (!session?.user) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#05040f] text-white">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.15),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)]" />
                    <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
                </div>

                <SiteHeader />
                <main className="relative z-10 pb-24 pt-24">
                    <div className="mx-auto w-full max-w-3xl px-4">
                        <LoginPrompt
                            title="Sign in to view PerpMonitor"
                            message="PerpMonitor aggregates real-time volume and OI from live venues. Log in to unlock the leaderboard and charts."
                            redirect="/login?callbackUrl=%2FPerpMonitor"
                            cta="Sign in to view data"
                        />
                    </div>
                </main>
                <SiteFooter />
            </div>
        )
    }

    const data = await fetchPerpDexData()

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.15),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
            </div>

            <SiteHeader />

            <main className="relative z-10 pb-24 pt-24">
                <div className="mx-auto w-full max-w-6xl px-4">
                    <PerpDexMetricShell data={data} />
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
