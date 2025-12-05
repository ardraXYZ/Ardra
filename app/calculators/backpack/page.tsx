import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BackpackCalculator } from "@/components/calculators/backpack-calculator"
import { Badge } from "@/components/ui/badge"

export const metadata = {
    title: "Backpack Calculator | Ardra",
    description: "Project Backpack points with Ardra's interactive calculator inspired by backbot.",
}

const highlights = [
    {
        title: "Product-grade presets",
        body: "We use the same guardrails from the Telegram bot so you can mirror real orders before executing."
    },
    {
        title: "Referral ready",
        body: "Model how many friends you need to invite to jump from Pulse tier to Nova."
    },
    {
        title: "Key metrics visualized",
        body: "Volume, maker share, liquidity and referrals contribute to the score card in one place."
    }
]

export default function BackpackCalculatorPage() {
    return (
        <div className="relative min-h-screen bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.15),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.88),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
            </div>

            <SiteHeader />

            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-28 sm:px-6 md:px-10">
                <section className="mb-12 space-y-6 text-white">
                    <Badge className="border-cyan-300/40 bg-cyan-500/15 text-cyan-100">Backpack Simulator</Badge>
                    <div className="space-y-4">
                        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl">Estimate your Backpack airdrop score</h1>
                    <p className="max-w-3xl text-base text-white/70">
                        Inspired by the Backbot calculator, the Ardra version lets you type “1” and choose “billion” or “million” to build the
                        FDV, then pick the airdrop percentage (up to 100%). Combine that with your current points to see a quick estimate for
                        Season 4’s 423.77M total supply.
                    </p>
                    </div>
                </section>

                <BackpackCalculator />

                <section className="mt-14 grid gap-4 md:grid-cols-3">
                    {highlights.map(item => (
                        <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/70 backdrop-blur">
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-2 text-xs text-white/60">{item.body}</p>
                        </div>
                    ))}
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
