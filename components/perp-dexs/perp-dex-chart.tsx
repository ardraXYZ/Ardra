
"use client"

import type { PerpDexData } from "@/lib/api/perp-dex-data"
import { useEffect, useMemo, useState, useId } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
    LabelList
} from "recharts"
import { METRIC_CONFIG, PerpMetricMode } from "./metric-config"

type Props = {
    data: PerpDexData[]
    metric: PerpMetricMode
}

type CursorHighlightProps = {
    x?: number
    y?: number
    width?: number
    height?: number
    gradientId: string
}

function CursorHighlight({ x = 0, y = 0, width = 0, height = 0, gradientId }: CursorHighlightProps) {
    if (width === 0 || height === 0) return null

    const paddingX = 6
    const paddingY = 12

    return (
        <g>
            <rect
                x={x - paddingX}
                y={y - paddingY}
                width={width + paddingX * 2}
                height={height + paddingY * 2}
                rx={18}
                fill={`url(#${gradientId})`}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
                opacity={0.9}
            />
        </g>
    )
}

export function PerpDexChart({ data, metric }: Props) {
    const [isClient, setIsClient] = useState(false)
    const cursorGradientId = useId().replace(/:/g, "-")

    useEffect(() => {
        setIsClient(true)
    }, [])

    const preset = METRIC_CONFIG[metric]
    const gradientColors = ["#22d3ee", "#39b5f2", "#6d83f5", "#a855f7", "#ec4899", "#f97316", "#facc15", "#34d399", "#14b8a6", "#0ea5e9"]

    const chartData = useMemo(
        () =>
            data.map((dex, idx) => ({
                order: idx,
                name: dex.name,
                chain: dex.chain,
                logo: dex.icon,
                value: metric === "volume" ? dex.volume24h : dex.openInterest
            })),
        [data, metric]
    )

    const renderTick = (props: any) => {
        const { x, y, payload } = props
        const entry = chartData.find(item => item.name === payload.value)
        if (!entry) return null
        const logo =
            entry.logo && entry.logo.length > 0
                ? entry.logo
                : `https://icons.llamao.fi/icons/protocols/${encodeURIComponent(entry.name.toLowerCase())}?w=48&h=48`
        const clipId = `tick-logo-${entry.order}`

        return (
            <g transform={`translate(${x},${y})`}>
                <defs>
                    <clipPath id={clipId}>
                        <circle cx="0" cy="0" r="16" />
                    </clipPath>
                </defs>
                <g transform="translate(0,18)">
                    <circle cx={0} cy={0} r={18} fill="rgba(148,163,184,0.25)" />
                    <image
                        href={logo}
                        x={-16}
                        y={-16}
                        width={32}
                        height={32}
                        clipPath={`url(#${clipId})`}
                    />
                </g>
                {payload.value.split(" ").map((segment: string, index: number) => (
                    <text key={`${payload.value}-${index}`} y={58 + index * 12} fill="#ffffffc0" textAnchor="middle" fontSize={11}>
                        {segment}
                    </text>
                ))}
            </g>
        )
    }

    if (!isClient) {
        return <div className="h-[420px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md" />
    }

    const formatAxisValue = (value: number) => {
        const abs = Math.abs(value)
        if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`
        if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
        if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
        if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
        return `$${value.toFixed(0)}`
    }

    const renderBarLabel = (props: any) => {
        const { x = 0, y = 0, width = 0, value } = props
        if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null
        const labelX = x + width / 2
        const labelY = y - 8
        return (
            <text x={labelX} y={labelY} fill="#ffffffd9" fontSize={12} textAnchor="middle">
                {formatAxisValue(value)}
            </text>
        )
    }

    return (
        <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-cyan-500/5 p-4 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(147,51,234,0.08),transparent_30%)]" />
            <h3 className="relative mb-4 text-lg font-medium text-white">{preset.label}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <defs>
                        <linearGradient id={cursorGradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                            <stop offset="100%" stopColor="rgba(59,130,246,0.12)" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#ffffff50"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={renderTick}
                        interval={0}
                        height={100}
                    />
                    <YAxis
                        stroke="#ffffff50"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatAxisValue}
                    />
                    <Tooltip
                        cursor={<CursorHighlight gradientId={cursorGradientId} />}
                        contentStyle={{
                            backgroundColor: "#000000cc",
                            border: "1px solid #ffffff20",
                            borderRadius: "8px"
                        }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: number) => [formatAxisValue(value), preset.label]}
                    />
                    <Legend />
                    <Bar dataKey="value" name={preset.label} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" content={renderBarLabel} />
                        {chartData.map((entry, index) => (
                            <Cell key={`${entry.name}-${entry.order}`} fill={gradientColors[index % gradientColors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
