"use client"

import dynamic from "next/dynamic"
import type { PerpDexData } from "@/lib/api/perp-dex-data"

const LazyMetricView = dynamic(
    () => import("./perp-dex-metric-view").then(mod => mod.PerpDexMetricView),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-6">
                <div className="h-10 w-48 rounded-full bg-white/10 animate-pulse" />
                <div className="h-[420px] w-full rounded-2xl border border-white/10 bg-white/5" />
                <div className="h-[520px] w-full rounded-2xl border border-white/10 bg-white/5" />
            </div>
        )
    }
)

type Props = {
    data: PerpDexData[]
}

export function PerpDexMetricShell({ data }: Props) {
    return <LazyMetricView data={data} />
}
