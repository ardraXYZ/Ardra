import Link from "next/link"
import { Calculator, Flame } from "lucide-react"
import Image from "next/image"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

const calculators = [
    {
        id: "backpack",
        title: "Backpack",
        description: "Project Backpack points with the same parameters supported by the Ardra Telegram bot.",
        href: "/calculators/backpack",
        live: true,
        logo: "/images/support/Backpack.png"
    },
    {
        id: "aster",
        title: "Aster",
        description: "Aster Stage 4 epoch calculator with live token pricing.",
        href: "/calculators/aster",
        live: true,
        logo: "/images/support/Aster.png"
    },
    {
        id: "pacifica",
        title: "Pacifica",
        description: "Cross-margin + referral rotation simulator (coming soon).",
        live: false
    }
]

export const metadata = {
    title: "Calculators | Ardra",
    description: "Pick the calculator for each Perp DEX. Backpack is live, others arrive soon.",
}

export default function CalculatorsHubPage() {
    return (
        <div className="relative min-h-screen bg-[#05040f] text-white">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.16),_transparent_50%),radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)]" />
                <div className="absolute inset-0 bg-hero-grid opacity-[0.08]" />
            </div>

            <SiteHeader />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 md:px-10">
                <section className="mb-12 space-y-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/50">Calculators</p>
                    <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl leading-tight">
                        Choose a venue to estimate your airdrop score
                    </h1>
                    <p className="max-w-3xl text-sm sm:text-base text-white/70">
                        Ardra calculators help you plan daily flow, maker share, and referrals for each Perp DEX. Backpack is live today and
                        more venues will be added as soon as their public point systems are documented.
                    </p>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {calculators.map(calc => (
                        <article
                            key={calc.id}
                            className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_80px_rgba(56,189,248,0.12)] transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.07]"
                        >
                            <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-cyan-400/0 via-fuchsia-400/10 to-emerald-400/0 opacity-0 blur-3xl transition group-hover:opacity-100" />
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/40">
                                        {calc.logo ? (
                                            <Image src={calc.logo} alt={calc.title} width={42} height={42} className="h-9 w-9 object-contain" />
                                        ) : (
                                            <Calculator className="h-6 w-6 text-cyan-200" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white leading-tight">{calc.title}</h2>
                                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                                            {calc.live ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-300">
                                                    <Flame className="h-3 w-3" /> Live
                                                </span>
                                            ) : (
                                                "Coming soon"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">{calc.description}</p>
                            <div className="mt-auto">
                                {calc.live ? (
                                    <Button asChild className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black shadow-[0_12px_40px_rgba(56,189,248,0.25)] hover:from-cyan-400 hover:to-fuchsia-400">
                                        <Link href={calc.href!}>Open calculator</Link>
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline" className="w-full rounded-full border-white/15 text-white/50">
                                        In development
                                    </Button>
                                )}
                            </div>
                        </article>
                    ))}
                </section>
            </main>
            <SiteFooter />
        </div>
    )
}
