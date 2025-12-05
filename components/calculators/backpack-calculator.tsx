"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Download, Info, RefreshCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const currencyCents = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})
const TOTAL_SEASON_POINTS = 423_770_000
const FDV_MULTIPLIER = {
    million: 1_000_000,
    billion: 1_000_000_000
}
type FdvUnit = keyof typeof FDV_MULTIPLIER

const DEFAULT_STATE = {
    userPoints: 120_000,
    fdvBase: 2.5,
    fdvUnit: "billion" as FdvUnit,
    allocation: 6
}

export function BackpackCalculator() {
    const [values, setValues] = useState(DEFAULT_STATE)
    const [downloading, setDownloading] = useState(false)
    const shareCardRef = useRef<HTMLDivElement>(null)

    const handleChange = (key: "userPoints" | "fdvBase" | "allocation", val: number) => {
        setValues(prev => ({ ...prev, [key]: Number.isFinite(val) ? Math.max(val, 0) : 0 }))
    }

    const results = useMemo(() => {
        const share = Math.min(values.userPoints / TOTAL_SEASON_POINTS, 1)
        const fdv = values.fdvBase * FDV_MULTIPLIER[values.fdvUnit]
        const poolUsd = fdv * (values.allocation / 100)
        const estimateUsd = share * poolUsd
        const madLadsPerNft = (fdv * 0.01) / 10_000
        const valuePerPoint = poolUsd / TOTAL_SEASON_POINTS
        return {
            share,
            poolUsd,
            estimateUsd,
            madLadsPerNft,
            valuePerPoint
        }
    }, [values])

    const handleDownloadCard = async () => {
        if (!shareCardRef.current || downloading) return
        setDownloading(true)
        try {
            const { toPng } = await import("html-to-image")
            const dataUrl = await toPng(shareCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#05030b"
            })
            const link = document.createElement("a")
            link.download = `ardra-backpack-estimate-${Date.now()}.png`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error("Failed to export Backpack calculator card", error)
        } finally {
            setDownloading(false)
        }
    }

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
                            className="h-12 rounded-xl border-white/15 bg-black/40 text-xl font-semibold text-white"
                        />
                    </FormRow>

                    <FormRow label="Estimated FDV">
                        <div className="grid gap-2 sm:grid-cols-[1.1fr_0.9fr]">
                            <Input
                                type="number"
                                step="0.1"
                                inputMode="decimal"
                                value={values.fdvBase}
                                onChange={event => handleChange("fdvBase", Number(event.target.value))}
                                className="h-12 rounded-xl border-white/15 bg-black/40 text-lg font-semibold text-white"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1">
                                {(["million", "billion"] as FdvUnit[]).map(unit => (
                                    <button
                                        key={unit}
                                        className={cn(
                                            "flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition",
                                            values.fdvUnit === unit
                                                ? "bg-cyan-400 text-black"
                                                : "text-white/70 hover:text-white"
                                        )}
                                        onClick={() => setValues(prev => ({ ...prev, fdvUnit: unit }))}
                                        type="button"
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FormRow>

                    <FormRow label="Airdrop allocation" compactHeader>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={1}
                                max={100}
                                step={0.5}
                                value={values.allocation}
                                onChange={event => handleChange("allocation", Number(event.target.value))}
                                className="h-2 flex-1 cursor-pointer accent-cyan-300"
                            />
                            <span className="w-16 text-right text-base font-semibold text-white/90">{values.allocation}%</span>
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
                <section className="space-y-4">
                    <header className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/50">Projection & share card</p>
                        <h2 className="text-xl font-semibold text-white">Estimated allocation</h2>
                    </header>

                    <div className="space-y-4">
                        <div
                            ref={shareCardRef}
                            className="group relative flex aspect-[16/9] w-full flex-col justify-between overflow-hidden rounded-[40px] border border-white/10 bg-[#05030b] px-8 py-8 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] min-h-[420px] transition-all duration-500 hover:border-cyan-300/20 hover:shadow-[0_50px_120px_-15px_rgba(8,189,248,0.15)]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(5,4,22,0.72), rgba(5,18,45,0.62)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 80% 25%, rgba(0,200,255,0.18), transparent 50%), url(/images/tools/calculator.webp)",
                                backgroundSize: "cover, cover, cover, cover",
                                backgroundPosition: "center, center, center, center",
                                backgroundRepeat: "no-repeat"
                            }}
                        >
                            {/* Background Elements */}
                            <div className="absolute inset-0 -z-10">
                                <Image
                                    src="/images/tools/calculator.webp"
                                    alt="card background"
                                    fill
                                    sizes="100vw"
                                    priority
                                    className="object-cover opacity-40 mix-blend-overlay"
                                />
                                {/* Ardra Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-fuchsia-950/30 to-emerald-950/50" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.15),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.15),transparent_50%)]" />

                                {/* Gradient Border Effect */}
                                <div className="absolute inset-[1px] rounded-[39px] border border-white/5 bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/5 to-emerald-500/10 opacity-50" />
                            </div>

                            {/* Header */}
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Logo without container */}
                                    <Image
                                        src="/images/support/Backpack.png"
                                        alt="Backpack exchange"
                                        width={160}
                                        height={160}
                                        className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
                                                Airdrop
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-white/50">Estimated Value Projection</p>
                                    </div>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)] backdrop-blur-md">
                                    Live Estimate
                                </div>
                            </div>

                            {/* Main Value */}
                            <div className="relative py-2">
                                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                                    Your Projected Allocation
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.3)] md:text-6xl">
                                        {currency.format(Math.round(results.estimateUsd || 0))}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3">
                                <ShareStat
                                    label="Value / Point"
                                    value={results.valuePerPoint > 0 ? currencyCents.format(results.valuePerPoint) : "$0.00"}
                                />
                                <ShareStat
                                    label="Pool Size"
                                    helper={`${values.allocation}% of FDV`}
                                    value={currency.format(Math.round(results.poolUsd || 0))}
                                />
                                <ShareStat
                                    label="My Points"
                                    helper="Your current total"
                                    value={new Intl.NumberFormat("en-US").format(values.userPoints)}
                                />
                            </div>

                            {/* Footer */}
                            <div className="relative mt-2 flex justify-end pt-2">
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm transition group-hover:border-cyan-300/50 group-hover:text-cyan-100">
                                    Generated by @ArdraHub
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleDownloadCard}
                            disabled={downloading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-6 text-base font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/15 hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.2)]"
                        >
                            <Download className="h-4 w-4" />
                            {downloading ? "Generating card..." : "Download projection card"}
                        </Button>
                    </div>
                </section>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/75">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-cyan-300" />
                        <span className="text-white/60">Assumptions</span>
                    </div>
                    <ul className="list-disc space-y-2 pl-5 text-xs text-white/60">
                        <li>The total season supply is fixed at {currency.format(TOTAL_SEASON_POINTS)} points.</li>
                        <li>USD value = FDV x allocation% x (your points / season points).</li>
                        <li>Numbers are illustrative. Always compare with the official Backpack docs and announcements.</li>
                    </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src="https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fcreator-hub-prod.s3.us-east-2.amazonaws.com%2Fmad_lads_pfp_1682211343777.png"
                                alt="Mad Lads"
                                width={56}
                                height={56}
                                className="h-14 w-14 object-contain"
                                unoptimized
                            />
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Mad Lads (not confirmed)</p>
                                <p className="mt-1 text-lg text-white">
                                    1 Mad Lads ~= <span className="font-semibold text-emerald-300">
                                        {currency.format(Math.round(results.madLadsPerNft || 0))}
                                    </span>
                                </p>
                                <p className="text-xs text-white/50">Assuming FDV x 1% divided across ~10,000 NFTs.</p>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-full border border-white/20 bg-black/40 px-5 py-2 text-white hover:border-cyan-300/40 hover:text-cyan-50"
                        >
                            <a href="https://magiceden.io/marketplace/mad_lads" target="_blank" rel="noreferrer">
                                Buy on Magic Eden
                            </a>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

type FormRowProps = {
    label: string
    description?: string
    compactHeader?: boolean
    children: React.ReactNode
}

function FormRow({ label, description, compactHeader = false, children }: FormRowProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(5,4,17,0.45)]">
            <div className={compactHeader ? "mb-2 flex items-center justify-between" : "mb-3"}>
                <Label className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/65">{label}</Label>
                {compactHeader && description ? <span className="text-xs text-white/50">{description}</span> : null}
                {!compactHeader && description ? <p className="text-xs text-white/50">{description}</p> : null}
            </div>
            {children}
        </div>
    )
}

type ShareStatProps = {
    label: string
    value: string
    helper?: string
}

function ShareStat({ label, value, helper }: ShareStatProps) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</p>
                {helper ? <p className="mt-0.5 text-[10px] font-medium text-white/30">{helper}</p> : null}
            </div>
            <p className="mt-3 text-lg font-bold tracking-tight text-white">{value}</p>
        </div>
    )
}
