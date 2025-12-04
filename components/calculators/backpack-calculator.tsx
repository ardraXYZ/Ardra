"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Info, RefreshCcw, Target } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const formatNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

const DEFAULT_STATE = {
    dailyVolume: 150_000,
    averageLeverage: 2,
    makerShare: 15,
    daysActive: 28,
    referrals: 6,
    liquidityStaked: 20_000
}

export function BackpackCalculator() {
    const [values, setValues] = useState(DEFAULT_STATE)

    const handleChange = (key: keyof typeof DEFAULT_STATE, val: number) => {
        setValues(prev => ({ ...prev, [key]: Number.isFinite(val) ? Math.max(val, 0) : 0 }))
    }

    const results = useMemo(() => {
        const traderPoints = values.dailyVolume * values.averageLeverage * 0.0015 * (values.daysActive / 30)
        const makerPoints = values.dailyVolume * (values.makerShare / 100) * 0.0021
        const referralPoints = values.referrals * 350
        const stakePoints = Math.sqrt(values.liquidityStaked) * 120

        const activityBoost = 1 + Math.min(values.daysActive / 60, 1) * 0.2
        const total = (traderPoints + makerPoints + referralPoints + stakePoints) * activityBoost

        const tier =
            total > 750_000 ? "Nova" : total > 350_000 ? "Astra" : total > 150_000 ? "Pulse" : total > 50_000 ? "Ignite" : "Kickoff"

        return {
            traderPoints,
            makerPoints,
            referralPoints,
            stakePoints,
            boost: activityBoost,
            total,
            tier
        }
    }, [values])

    const breakdown = [
        { label: "Trader flow", value: results.traderPoints },
        { label: "Maker share", value: results.makerPoints },
        { label: "Invites", value: results.referralPoints },
        { label: "Liquidity staked", value: results.stakePoints }
    ]

    return (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/50">Input</p>
                    <h2 className="text-xl font-semibold text-white">Simulate your Backpack activity</h2>
                    <p className="text-sm text-white/65">
                        Adjust the sliders to match your current trading cadence. All numbers are estimations and do not represent official
                        point formulas from Backpack.
                    </p>
                </header>

                <div className="grid gap-5">
                    <FormRow label="Daily notional volume" description="Average USD flow traded by your bot or manual strategy.">
                        <Input
                            type="number"
                            inputMode="decimal"
                            value={values.dailyVolume}
                            onChange={event => handleChange("dailyVolume", Number(event.target.value))}
                            className="bg-black/40"
                        />
                    </FormRow>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormRow label="Average leverage">
                            <Input
                                type="number"
                                step="0.1"
                                value={values.averageLeverage}
                                onChange={event => handleChange("averageLeverage", Number(event.target.value))}
                                className="bg-black/40"
                            />
                        </FormRow>
                        <FormRow label="Maker percentage">
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={0}
                                    max={50}
                                    value={values.makerShare}
                                    onChange={event => handleChange("makerShare", Number(event.target.value))}
                                    className="h-1 flex-1 cursor-pointer accent-cyan-300"
                                />
                                <span className="w-12 text-right text-sm text-white/80">{values.makerShare}%</span>
                            </div>
                        </FormRow>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormRow label="Days active / 30">
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={1}
                                    max={30}
                                    value={values.daysActive}
                                    onChange={event => handleChange("daysActive", Number(event.target.value))}
                                    className="h-1 flex-1 cursor-pointer accent-cyan-300"
                                />
                                <span className="w-10 text-right text-sm text-white/80">{values.daysActive}</span>
                            </div>
                        </FormRow>
                        <FormRow label="New referees">
                            <Input
                                type="number"
                                value={values.referrals}
                                onChange={event => handleChange("referrals", Number(event.target.value))}
                                className="bg-black/40"
                            />
                        </FormRow>
                    </div>

                    <FormRow label="Liquidity staked" description="LP tokens or vault deposits on Backpack Perps.">
                        <Input
                            type="number"
                            value={values.liquidityStaked}
                            onChange={event => handleChange("liquidityStaked", Number(event.target.value))}
                            className="bg-black/40"
                        />
                    </FormRow>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="ghost"
                            className="border border-white/15 text-white hover:border-cyan-400/40 hover:text-cyan-50"
                            onClick={() => setValues(DEFAULT_STATE)}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reset to sample
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:from-cyan-300 hover:to-emerald-300">
                            <a href="https://backpack.exchange/stats" target="_blank" rel="noreferrer">
                                Compare with Backpack stats
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/50">Projection</p>
                    <h2 className="text-xl font-semibold text-white">Estimated Backpack score</h2>
                </header>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white shadow-inner">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/40">Projected total</p>
                    <p className="mt-2 text-4xl font-semibold text-cyan-200">{formatNumber.format(Math.round(results.total))} pts</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/50">
                            <Target className="h-4 w-4 text-emerald-300" />
                            Tier {results.tier}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                            Activity boost × {results.boost.toFixed(2)}
                        </span>
                    </div>
                </div>

                    <div className="grid gap-3">
                        {breakdown.map(item => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                                <span>{item.label}</span>
                                <span className="font-semibold text-white">{formatNumber.format(Math.round(item.value))}</span>
                            </div>
                        ))}
                    </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/75">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-cyan-300" />
                        <span className="text-white/60">Assumptions</span>
                    </div>
                    <ul className="list-disc space-y-2 pl-5 text-xs text-white/60">
                        <li>Formulas are fictional but mirror the weighting structure shared publicly by Backpack contributors.</li>
                        <li>Maker share and liquidity staked unlock compounding boosts when activity exceeds 30 days.</li>
                        <li>Invite multipliers stack linearly for simplicity. Always cross-check with official Backpack announcements.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}

type FormRowProps = {
    label: string
    description?: string
    children: React.ReactNode
}

function FormRow({ label, description, children }: FormRowProps) {
    return (
        <div className="space-y-2">
            <div>
                <Label className="text-sm text-white">{label}</Label>
                {description ? <p className="text-xs text-white/50">{description}</p> : null}
            </div>
            {children}
        </div>
    )
}
