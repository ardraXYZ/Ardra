"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, RefreshCcw, Sparkles, Info, Clock, Download } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const currencyCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4, minimumFractionDigits: 4 })
const numberFmt = new Intl.NumberFormat("en-US")

// Aster Stage 4: 1.5% of supply over 6 epochs => 0.25% per epoch
const STAGE4_EPOCHS = 6
const STAGE4_TOKENS_TOTAL = 120_000_000
const STAGE4_TOKENS_PER_EPOCH = STAGE4_TOKENS_TOTAL / STAGE4_EPOCHS // 20M
const TOTAL_SUPPLY_TOKENS = STAGE4_TOKENS_TOTAL / 0.015 // 8B implied

const DEFAULT_EPOCH_TOTALS: (number | null)[] = Array(6).fill(null)

const STATIC_EPOCH_DATA = [
    { epochId: 1, userRh: 6788, totalRh: 148_866_780_518 },
    { epochId: 2, userRh: 7742, totalRh: 172_494_360_597 },
    { epochId: 3, userRh: 1779, totalRh: 115_957_740_809 },
    { epochId: 4, userRh: 6425, totalRh: 156_278_807_980 },
    { epochId: 5, userRh: 31, totalRh: 42_801_160_920 },
    { epochId: 6, userRh: 0, totalRh: null }
] as const

const DEFAULT_STATE = {
    userPoints: 0,
    userPointsEpochs: Array(6).fill(0) as number[],
    totalPoints: STATIC_EPOCH_DATA.reduce((sum, e) => (e.totalRh ? sum + e.totalRh : sum), 0)
}

export function AsterCalculator() {
    const [values, setValues] = useState(DEFAULT_STATE)
    const [tokenPrice, setTokenPrice] = useState<number | null>(null)
    const [priceError, setPriceError] = useState<string | null>(null)
    const [epochTotals, setEpochTotals] = useState<(number | null)[]>(DEFAULT_EPOCH_TOTALS)
    const [downloading, setDownloading] = useState(false)
    const shareCardRef = useRef<HTMLDivElement>(null)

    const handleChange = (key: keyof typeof DEFAULT_STATE, val: number) => {
        setValues(prev => ({ ...prev, [key]: Number.isFinite(val) ? Math.max(val, 0) : 0 }))
    }

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const ids = ["aster-2", "aster"].join(",")
                    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
                        cache: "no-store"
                    })
                    if (!res.ok) throw new Error(`Status ${res.status}`)
                    const json = await res.json()
                    const price = json?.["aster-2"]?.usd ?? json?.aster?.usd ?? json?.["aster-protocol"]?.usd
                    if (mounted) {
                        if (typeof price === "number") {
                            setTokenPrice(price)
                            setPriceError(null)
                        } else {
                            setTokenPrice(null)
                            setPriceError("Price unavailable")
                        }
                    }
                } catch (error: any) {
                    if (mounted) {
                        setTokenPrice(null)
                        setPriceError("Price fetch failed")
                    }
                }
            })()
        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        // Usar dados prontos (fallback manual)
        const totals: (number | null)[] = Array(6).fill(null)
        const perUser: number[] = Array(6).fill(0)
        STATIC_EPOCH_DATA.forEach(entry => {
            const idx = entry.epochId - 1
            if (idx >= 0 && idx < totals.length) {
                totals[idx] = entry.totalRh ?? null
                perUser[idx] = typeof entry.userRh === "number" ? entry.userRh : 0
            }
        })
        setEpochTotals(totals)
        const sum = perUser.reduce((a, b) => a + b, 0)
        setValues(prev => ({ ...prev, userPointsEpochs: perUser, userPoints: sum }))
    }, [])

    const results = useMemo(() => {
        const totalRhSum = epochTotals.reduce((acc, t) => (t ? acc + t : acc), 0)
        const share = totalRhSum > 0 ? values.userPoints / totalRhSum : 0
        const priceUsed = tokenPrice ?? 0

        // Stage 4 token flows
        const epochTokens = values.userPointsEpochs.map((points, idx) => {
            const epochTotal = epochTotals[idx]
            if (!epochTotal || epochTotal <= 0) return 0
            const epochShare = points > 0 ? points / epochTotal : 0
            return epochShare * STAGE4_TOKENS_PER_EPOCH
        })
        const userTokensPerEpoch = epochTokens
        const userTokensTotal = epochTokens.reduce((acc, t) => acc + t, 0)

        // Optional USD projections using FDV
        const estimateUsd = userTokensTotal * priceUsed
        const poolUsd = STAGE4_TOKENS_TOTAL * priceUsed
        const valuePerPointTokens = values.totalPoints > 0 ? STAGE4_TOKENS_TOTAL / values.totalPoints : 0

        return {
            totalRhSum,
            share,
            tokenPrice: priceUsed,
            userTokensPerEpoch,
            userTokensTotal,
            estimateUsd,
            poolUsd,
            valuePerPointTokens
        }
    }, [values, tokenPrice])

    const handleDownloadCard = async () => {
        if (!shareCardRef.current || downloading) return
        setDownloading(true)
        try {
            const { toPng } = await import("html-to-image")
            const dataUrl = await toPng(shareCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#05040f",
                useCORS: true,
                filter: (node) => {
                    return !(node instanceof HTMLElement && node.hasAttribute("data-html2canvas-ignore"))
                }
            })
            const link = document.createElement("a")
            link.download = `ardra-aster-estimate-${Date.now()}.png`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error("Failed to export Aster card", error)
        } finally {
            setDownloading(false)
        }
    }

    const reset = () => setValues(DEFAULT_STATE)

    return (
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left column - Epoch inputs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/50">Input</p>
                    <h2 className="text-xl font-semibold text-white">Enter your RH per epoch</h2>
                    <p className="text-sm text-white/65">
                        Stage 4: 6 epochs · 20M tokens each · live price from CoinGecko
                    </p>
                </header>

                <div className="flex items-center gap-2 text-sm text-white/70">
                    <Clock className="h-4 w-4 text-amber-300" />
                    <span>Epoch 1-4 final, 5 in progress, 6 pending.</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {values.userPointsEpochs.map((val, idx) => {
                        const total = epochTotals[idx]
                        const share = total ? (val / total) * 100 : 0
                        const tokens = total ? (val / total) * STAGE4_TOKENS_PER_EPOCH : 0
                        const status =
                            idx < 4 ? "final" : idx === 4 ? "live" : "pending"

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition",
                                    status === "final" && "border-emerald-400/30",
                                    status === "live" && "border-amber-300/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">Epoch {idx + 1}</p>
                                    <span
                                        className={cn(
                                            "rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.25em]",
                                            status === "final"
                                                ? "bg-emerald-400/10 text-emerald-200"
                                                : status === "live"
                                                    ? "bg-amber-300/15 text-amber-200"
                                                    : "bg-white/10 text-white/60"
                                        )}
                                    >
                                        {status === "final" ? "Final" : status === "live" ? "Live" : "Pending"}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-white/60">
                                    {total ? `Total RH: ${numberFmt.format(total)}` : "Total RH: not available"}
                                </p>

                                <div className="mt-3 space-y-2">
                                    <Label className="text-[11px] uppercase tracking-[0.25em] text-white/60">Your RH</Label>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        value={val}
                                        onChange={event => {
                                            const next = [...values.userPointsEpochs]
                                            next[idx] = Number(event.target.value) || 0
                                            const totalPts = next.reduce((a, b) => a + b, 0)
                                            setValues(prev => ({
                                                ...prev,
                                                userPointsEpochs: next,
                                                userPoints: totalPts
                                            }))
                                        }}
                                        className="h-11 rounded-lg border-white/15 bg-black/30 text-base font-semibold text-white"
                                    />
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/80">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Your share</p>
                                        <p className="text-lg font-semibold text-cyan-200">{total ? `${share.toFixed(6)}%` : "-"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Tokens</p>
                                        <p className="text-lg font-semibold text-emerald-200">
                                            {total ? `${tokens.toFixed(2)} ASTER` : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Right column - Result card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
                <section className="space-y-4">
                    <header className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/50">Projection & share card</p>
                        <h2 className="text-xl font-semibold text-white">Estimated allocation</h2>
                    </header>

                    <div className="space-y-4">
                        <div
                            ref={shareCardRef}
                            className="group relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0E1526]/70 to-[#07090F]/60 p-5"
                        >
                            {/* Pepe mascot background image */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 hidden bg-[url('/images/aster-pepe-bg.webp')] bg-cover bg-right opacity-20 md:block"
                            />

                            <div className="relative space-y-4">
                                {/* Header - Your allocation */}
                                <div>
                                    <p className="text-sm text-white/70">Your allocation</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Image
                                            src="/images/asterlo.png"
                                            alt="Aster Logo"
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded-full bg-white/5 object-contain p-1 ring-1 ring-white/10"
                                            unoptimized
                                            priority
                                        />
                                        <div className="font-orbitron font-normal text-3xl md:text-4xl">
                                            <span>{numberFmt.format(Number((results.userTokensTotal || 0).toFixed(0)))}</span>
                                            <span className="ml-2 align-middle text-xl text-white/70 md:text-2xl">ASTER</span>
                                        </div>
                                    </div>
                                </div>

                                {/* USD Value - Neon green */}
                                <div>
                                    <p className="font-orbitron font-normal text-4xl text-[#31F8A5] drop-shadow-[0_0_10px_rgba(49,248,165,0.5),0_0_30px_rgba(42,127,255,0.35)] md:text-5xl">
                                        {currency.format(Math.round(results.estimateUsd || 0))}
                                    </p>
                                </div>

                                {/* Stats grid - 2 columns */}
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <div className="text-xs text-white/55">My RH Points</div>
                                        <div className="text-sm font-bold">
                                            {numberFmt.format(values.userPoints)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/55">Aster Price</div>
                                        <div className="text-sm font-bold">
                                            {tokenPrice ? currencyCents.format(tokenPrice) : tokenPrice === 0 ? "$0.0000" : "Loading..."}
                                        </div>
                                    </div>
                                </div>

                                {/* Formula */}
                                <div className="text-xs text-white/50">
                                    Formula: 120,000,000 tokens × (My RH / Total RH across all 6 epochs)
                                </div>

                                {/* Credit */}
                                <div className="text-xs text-white/60">
                                    by: ArdraHub
                                </div>

                                {/* Download button */}
                                <div className="pt-2" data-html2canvas-ignore="true">
                                    <Button
                                        onClick={handleDownloadCard}
                                        disabled={downloading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_32px_rgba(34,211,238,0.35)] transition-all hover:from-cyan-300 hover:via-sky-300 hover:to-emerald-300 hover:shadow-[0_18px_40px_rgba(34,211,238,0.45)]"
                                    >
                                        <Download className="h-4 w-4" />
                                        {downloading ? "Generating PNG..." : "Download PNG"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Assumptions section */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/75">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-cyan-300" />
                        <span className="text-white/60">Assumptions</span>
                    </div>
                    <ul className="list-disc space-y-2 pl-5 text-xs text-white/60">
                        <li>Stage 4 distributes 120M ASTER tokens over 6 epochs (20M each).</li>
                        <li>Your allocation = (Your RH / Total RH) × 20M per epoch.</li>
                        <li>Live price fetched from CoinGecko. Numbers are illustrative.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}

type MiniCardProps = {
    label: string
    children: React.ReactNode
}

function MiniCard({ label, children }: MiniCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">{label}</Label>
            <div className="mt-2">{children}</div>
        </div>
    )
}

type AsterStatProps = {
    label: string
    value: string
    helper?: string
}

function AsterStat({ label, value, helper }: AsterStatProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">{label}</p>
            {helper ? <p className="text-xs text-white/60">{helper}</p> : null}
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
    )
}
