"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Info, RefreshCcw, Target } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: "percent" })

const TOTAL_SEASON_POINTS = 423_770_000

const DEFAULT_STATE = {
    userPoints: 120_000,
    fdvEstimate: 2_500_000_000,
    allocation: 6
}

export function BackpackCalculator() {
    const [values, setValues] = useState(DEFAULT_STATE)

    const handleChange = (key: keyof typeof DEFAULT_STATE, val: number) => {
        setValues(prev => ({ ...prev, [key]: Number.isFinite(val) ? Math.max(val, 0) : 0 }))
    }

    const results = useMemo(() => {
        const share = Math.min(values.userPoints / TOTAL_SEASON_POINTS, 1)
        const poolUsd = values.fdvEstimate * (values.allocation / 100)
        const estimateUsd = share * poolUsd
        return {
            share,
            poolUsd,
            estimateUsd
        }
    }, [values])

    return (
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/50">Input</p>
                    <h2 className="text-xl font-semibold text-white">Estimate your Backpack payout</h2>
                    <p className="text-sm text-white/65">
                        Season 4 totals {currency.format(TOTAL_SEASON_POINTS)} points. Enter your current points, an FDV target and the %
                        of tokens you believe will go to the airdrop.
                    </p>
                </header>

                <div className="grid gap-5">
                    <FormRow label="Your Backpack points">
                        <Input
                            type="number"
                            inputMode="decimal"
                            value={values.userPoints}
                            onChange={event => handleChange("userPoints", Number(event.target.value))}
                            className="bg-black/40"
                        />
                    </FormRow>

                    <FormRow label="Estimated FDV (USD)">
                        <Input
                            type="number"
                            inputMode="decimal"
                            value={values.fdvEstimate}
                            onChange={event => handleChange("fdvEstimate", Number(event.target.value))}
                            className="bg-black/40"
                        />
                    </FormRow>

                    <FormRow label="Airdrop allocation">
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={1}
                                max={20}
                                step={0.5}
                                value={values.allocation}
                                onChange={event => handleChange("allocation", Number(event.target.value))}
                                className="h-1 flex-1 cursor-pointer accent-cyan-300"
                            />
                            <span className="w-16 text-right text-sm text-white/80">{values.allocation}%</span>
                        </div>
                    </FormRow>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="ghost"
                            className="border border-white/15 text-white hover:border-cyan-400/40 hover:text-cyan-50"
                            onClick={() => setValues(DEFAULT_STATE)}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reset sample
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:from-cyan-300 hover:to-emerald-300">
                            <a href="https://backpack.exchange/stats" target="_blank" rel="noreferrer">
                                View Backpack stats
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
                    <h2 className="text-xl font-semibold text-white">Estimated allocation</h2>
                </header>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white shadow-inner">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/40">Your share</p>
                    <p className="mt-2 text-4xl font-semibold text-cyan-200">{percent.format(results.share || 0)}</p>
                    <div className="mt-3 grid gap-3 text-sm text-white/70">
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <span>Estimated airdrop value</span>
                            <span className="font-semibold text-white">{currency.format(Math.round(results.estimateUsd || 0))}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                            <span>Pool size ({values.allocation}% of FDV)</span>
                            <span className="font-semibold text-white">{currency.format(Math.round(results.poolUsd || 0))}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/75">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-cyan-300" />
                        <span className="text-white/60">Assumptions</span>
                    </div>
                    <ul className="list-disc space-y-2 pl-5 text-xs text-white/60">
                        <li>The total season supply is fixed at {currency.format(TOTAL_SEASON_POINTS)} points.</li>
                        <li>USD value = FDV × allocation% × (your points / season points).</li>
                        <li>Numbers are illustrative. Always compare with the official Backpack docs and announcements.</li>
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
