import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AsterCalculator } from "@/components/calculators/aster-calculator"
import { Badge } from "@/components/ui/badge"

export const metadata = {
    title: "Aster Airdrop Calculator | Ardra",
    description: "Project your potential Aster airdrop using Ardra's simulator with FDV and allocation controls."
}

export default function AsterCalculatorPage() {
    return (
        <div className="relative min-h-screen bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.12),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
            </div>

            <SiteHeader />

            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-24 sm:px-6 md:px-10">
                <section className="mb-10 space-y-4">
                    <Badge className="border-cyan-300/40 bg-cyan-500/15 text-cyan-100">Aster Simulator</Badge>
                    <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl">Aster airdrop estimator</h1>
                    <p className="max-w-3xl text-sm text-white/65">
                        Inspired by AsterBot, adjust FDV, airdrop allocation and points to model a potential Season airdrop. Use your own
                        totals for the most accurate snapshot.
                    </p>
                </section>

                <AsterCalculator />
            </main>

            <SiteFooter />
        </div>
    )
}
