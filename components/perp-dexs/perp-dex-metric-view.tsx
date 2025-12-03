"use client"

import { useMemo, useState } from "react"
import type { PerpDexData } from "@/lib/api/perp-dex-data"
import { METRIC_CONFIG, PerpMetricMode } from "./metric-config"
import { PerpDexChart } from "./perp-dex-chart"
import { PerpDexTable } from "./perp-dex-table"

type Props = {
    data: PerpDexData[]
}

export function PerpDexMetricView({ data }: Props) {
    const [metric, setMetric] = useState<PerpMetricMode>("volume")
    const preset = METRIC_CONFIG[metric]

    const orderedData = useMemo(() => {
        const clone = [...data]
        const key = metric === "volume" ? "volume24h" : "openInterest"
        clone.sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
        return clone
    }, [data, metric])

    const normalizeName = (name: string) => {
        const lower = name.toLowerCase()
        if (lower.includes("apex")) return "Apex"
        if (lower.includes("gains")) return "Gains"
        if (lower.includes("myx")) return "MYX"
        return name
    }

    const normalizedData = useMemo(
        () =>
            orderedData.map(item => ({
                ...item,
                name: normalizeName(item.name)
            })),
        [orderedData]
    )

    return (
        <div className="space-y-8 mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Ranking by {preset.shortLabel}
                    </h2>
                </div>
                <div className="inline-flex rounded-2xl border border-white/15 bg-white/5 p-1 text-xs font-semibold text-white/70">
                    {(["volume", "openInterest"] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setMetric(mode)}
                            className={`px-4 py-2 rounded-xl transition ${
                                metric === mode
                                    ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            {METRIC_CONFIG[mode].shortLabel}
                        </button>
                    ))}
                </div>
            </div>

            <PerpDexChart data={normalizedData} metric={metric} />

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Live table</p>
                        <h2 className="text-2xl font-semibold text-white">Exchange overview</h2>
                    </div>
                    <div className="text-xs text-white/50">
                        Sorted by {preset.label} • {orderedData.length} venues
                    </div>
                </div>
                <div className="mt-4">
                    <PerpDexTable data={normalizedData} metric={metric} />
                </div>
            </section>
        </div>
    )
}
