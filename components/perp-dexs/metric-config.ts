export type PerpMetricMode = "volume" | "openInterest"

export const METRIC_CONFIG: Record<
    PerpMetricMode,
    { label: string; shortLabel: string; key: "volume24h" | "openInterest"; color: string }
> = {
    volume: {
        label: "Volume (24h)",
        shortLabel: "Volume",
        key: "volume24h",
        color: "#22d3ee"
    },
    openInterest: {
        label: "Open Interest",
        shortLabel: "Open Interest",
        key: "openInterest",
        color: "#a855f7"
    }
}
