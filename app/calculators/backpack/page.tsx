import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BackpackCalculator } from "@/components/calculators/backpack-calculator"
import { Badge } from "@/components/ui/badge"

export const metadata = {
    title: "Backpack Calculator | Ardra",
    description: "Project Backpack points with Ardra's interactive calculator inspired by backbot."
}

export default function BackpackCalculatorPage() {
    return (
        <div className="relative min-h-screen bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.88),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
            </div>

            <SiteHeader />

            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-28 sm:px-6 md:px-10">
                <section className="mb-12 space-y-4 text-white">
                    <Badge className="border-cyan-300/40 bg-cyan-500/15 text-cyan-100">Backpack Simulator</Badge>
                    <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl">Backpack airdrop estimator</h1>
                </section>

                <BackpackCalculator />
            </main>

            <SiteFooter />
        </div>
    )
}
