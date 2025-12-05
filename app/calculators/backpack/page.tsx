import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BackpackCalculator } from "@/components/calculators/backpack-calculator"
import { Badge } from "@/components/ui/badge"
import { Sparkles, SlidersHorizontal, UserPlus2 } from "lucide-react"

export const metadata = {
    title: "Backpack Calculator | Ardra",
    description: "Project Backpack points with Ardra's interactive calculator inspired by backbot.",
}

const highlights = [
    {
        title: "Product-grade presets",
        body: "We use the same guardrails from the Telegram bot so you can mirror real orders before executing.",
        icon: <Sparkles className="h-7 w-7" />
    },
    {
        title: "Referral ready",
        body: "Model how many friends you need to invite to jump from Pulse tier to Nova.",
        icon: <UserPlus2 className="h-7 w-7" />
    },
    {
        title: "Key metrics visualized",
        body: "Volume, maker share, liquidity and referrals contribute to the score card in one place.",
        icon: <SlidersHorizontal className="h-7 w-7" />
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

                <section className="mt-16 grid gap-6 md:grid-cols-3">
                    {highlights.map(item => (
                        <div
                            key={item.title}
                            className="relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.06] p-7 shadow-[0_25px_120px_rgba(56,189,248,0.15)] backdrop-blur"
                        >
                            <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.15),transparent_45%)] opacity-60" />
                            <div className="flex items-center gap-3 text-white">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/40">
                                    {item.icon}
                                </div>
                                <p className="text-lg font-semibold">{item.title}</p>
                            </div>
                            <p className="mt-4 text-sm text-white/70">{item.body}</p>
                        </div>
                    ))}
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
