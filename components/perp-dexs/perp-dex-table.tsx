
"use client"

import type { PerpDexData } from "@/lib/api/perp-dex-data"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { METRIC_CONFIG, PerpMetricMode } from "./metric-config"

const formatCurrency = (value: number) => {
    if (!value || value <= 0) return "-"
    const abs = Math.abs(value)
    if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`
    if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
}

const DELTA_FIELDS: { key: keyof NonNullable<PerpDexData["variation"]>["volume"]; label: string }[] = [
    { key: "change24h", label: "24h" },
    { key: "change7d", label: "7d" },
    { key: "change30d", label: "30d" }
]

const formatDelta = (value: number | null) => {
    if (value === null || value === undefined) return { text: "—", tone: "neutral" as const }
    const percentage = value * 100
    const magnitude = Math.abs(percentage) >= 1 ? percentage.toFixed(1) : percentage.toFixed(2)
    const text = `${value > 0 ? "+" : ""}${magnitude}%`
    if (value > 0) return { text, tone: "positive" as const }
    if (value < 0) return { text, tone: "negative" as const }
    return { text, tone: "neutral" as const }
}

const toneColors: Record<ReturnType<typeof formatDelta>["tone"], string> = {
    positive: "#6ee7b7",
    negative: "#f87171",
    neutral: "#94a3b8"
}

type Props = {
    data: PerpDexData[]
    metric: PerpMetricMode
}

export function PerpDexTable({ data, metric }: Props) {
    const metricPreset = METRIC_CONFIG[metric]
    const getMetricValue = (dex: PerpDexData) => (metric === "volume" ? dex.volume24h : dex.openInterest)

    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-cyan-500/5 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
            <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase text-white/50">
                    <tr>
                        <th className="px-4 py-4 font-medium">#</th>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium text-right">{metricPreset.label}</th>
                        <th className="px-4 py-4 font-medium text-right">24h Δ</th>
                        <th className="px-4 py-4 font-medium text-right">7d Δ</th>
                        <th className="px-4 py-4 font-medium text-right">30d Δ</th>
                        <th className="px-6 py-4 font-medium text-center">Fees (M/T)</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((dex, idx) => {
                        const metricValue = getMetricValue(dex)
                        const variation =
                            metric === "volume" ? dex.variation?.volume : dex.variation?.openInterest
                        return (
                            <tr key={dex.id} className="group transition-colors hover:bg-white/5">
                                <td className="px-4 py-4 font-mono text-sm text-white/60">{idx + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {dex.icon ? (
                                            <img src={dex.icon} alt={dex.name} className="h-8 w-8 rounded-full" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />
                                        )}
                                        <div>
                                            <div className="font-medium text-white transition-colors group-hover:text-cyan-400">
                                                {dex.name}
                                            </div>
                                            <div className="text-xs text-white/40">{dex.chain}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-white/90">
                                    {formatCurrency(metricValue)}
                                </td>
                                {DELTA_FIELDS.map(field => {
                                    const deltaInfo = formatDelta(variation?.[field.key] ?? null)
                                    return (
                                        <td key={field.key} className="px-4 py-4 text-right font-mono">
                                            <span style={{ color: toneColors[deltaInfo.tone] }}>{deltaInfo.text}</span>
                                        </td>
                                    )
                                })}
                                <td className="px-6 py-4 text-center text-xs text-white/70">
                                    {dex.makerFee} / {dex.takerFee}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={dex.url}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyan-500/20 hover:text-cyan-400"
                                    >
                                        Trade
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
