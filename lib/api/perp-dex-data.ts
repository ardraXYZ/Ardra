import fs from "fs/promises"
import path from "path"
import { GmxSdk } from "@gmx-io/sdk"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import {
    getReya,
    getGains,
    getVest,
    getMyx,
    getHibachi,
    getEdgex,
    getDrift as getDriftExternal,
    getGrvt,
    getApexProtocol,
    getJupiter,
    getDefillamaMetrics
} from "./perp-dex-external"

export type VariationStats = {
    change24h: number | null
    change7d: number | null
    change30d: number | null
}

export type PerpDexVariation = {
    volume: VariationStats
    openInterest: VariationStats
}

export type PerpDexData = {
    id: string
    name: string
    chain: string
    volume24h: number
    volume7d: number
    tvl: number
    openInterest: number
    pairs: number
    makerFee: string
    takerFee: string
    maxLeverage: string
    url: string
    icon: string
    variation?: PerpDexVariation
}

type StaticConfig = {
    name: string
    pairs: number
    makerFee: string
    takerFee: string
    maxLeverage: string
    url: string
    chain: string
    icon?: string
}

type FallbackMetrics = {
    volume24h?: number
    volume7d?: number
    tvl?: number
    openInterest?: number
}

type AsterTicker = {
    symbol: string
    lastPrice?: string
    quoteVolume?: string
}

type AsterExchangeInfo = {
    symbols?: unknown[]
}

type DefiLlamaProtocol = {
    slug?: string
    id?: string | number
    name?: string
    chain?: string
    volume24h?: number
    volume7d?: number
    tvl?: number
    openInterest?: number
    url?: string
    logo?: string
}

const REQUEST_TIMEOUT_MS = 8000
const DRIFT_DATA_BASE = "https://data.api.drift.trade"
const PACIFICA_BASE = "https://api.pacifica.fi"
const HISTORY_FILE = path.join(process.cwd(), "data", "perp-dex-history.json")
const HISTORY_LIMIT = 120
const SUPABASE_TABLE = "perp_metrics"
const SUPABASE_URL =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SERVICE_URL || ""
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

type PerpDexHistorySnapshot = {
    date: string
    data: Record<
        string,
        {
            volume24h: number
            openInterest: number
        }
    >
}

type SnapshotDataMap = PerpDexHistorySnapshot["data"]

let supabaseAdminClient: SupabaseClient | null = null

function getSupabaseAdminClient(): SupabaseClient | null {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null
    if (!supabaseAdminClient) {
        supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
    }
    return supabaseAdminClient
}

type HyperliquidMeta = {
    universe?: {
        name?: string
        maxLeverage?: number
    }[]
}

type HyperliquidAssetCtx = {
    dayNtlVlm?: string
    openInterest?: string
    markPx?: string
}

type BackpackMarket = {
    symbol: string
    marketType?: string
}

type BackpackTicker = {
    symbol: string
    quoteVolume?: string
}

type BackpackOpenInterest = {
    openInterest?: string
    symbol?: string
}

type LighterExchangeStats = {
    code?: number
    order_book_details?: LighterOrderBookDetail[]
}

type LighterOrderBookDetail = {
    symbol?: string
    taker_fee?: string
    maker_fee?: string
    daily_quote_token_volume?: number
    last_trade_price?: number
    open_interest?: number
}

type ParadexMarket = {
    symbol?: string
    asset_kind?: string
}

type ParadexSummary = {
    results?: {
        symbol?: string
        volume_24h?: string
        total_volume?: string
        open_interest?: string
        mark_price?: string
    }[]
}

type DriftMarketPrice = {
    symbol?: string
    currentPrice?: string
    marketType?: string
}

type DriftVolumeMarket = {
    symbol?: string
    quoteVolume?: string
    marketType?: string
}

type PacificaPrice = {
    symbol?: string
    volume24h?: string
    volume_24h?: string
    openInterest?: string
    open_interest?: string
    mid?: string
    funding?: string
}

type OstiumPair = {
    longOI?: string
    shortOI?: string
    lastTradePrice?: string
    makerFeeP?: string
    takerFeeP?: string
    group?: { maxLeverage?: string } | null
}

type OstiumTrade = {
    notional?: string
}

type GmxMarketInfo = {
    openInterestLong?: string
    openInterestShort?: string
}

type DydxPerpetualMarket = {
    ticker?: string
    status?: string
    oraclePrice?: string
    volume24H?: string
    openInterest?: string
    initialMarginFraction?: string
}

type ExtendedMarket = {
    marketStats?: {
        dailyVolume?: string
        openInterest?: string
    }
}

type DefillamaDerivativesOverview = {
    total24h?: number
    openInterest?: number
    protocols?: {
        defillamaId?: string
        name?: string
        total24h?: number
        openInterest?: number
    }[]
}

const STATIC_CONFIG: Record<string, StaticConfig> = {
    "aster-finance": {
        name: "Aster",
        pairs: 240,
        makerFee: "0.01%",
        takerFee: "0.035%",
        maxLeverage: "100x",
        url: "https://www.asterdex.com/en/referral/c67143",
        chain: "Multi",
        icon: "https://icons.llamao.fi/icons/protocols/aster-perps?w=48&h=48"
    },
    "hyperliquid-perps": {
        name: "Hyperliquid",
        pairs: 130,
        makerFee: "0.01%",
        takerFee: "0.045%",
        maxLeverage: "40x",
        url: "https://app.hyperliquid.xyz/join/ARDRA",
        chain: "Hyperliquid"
    },
    "gmx-v2-perps": {
        name: "GMX V2",
        pairs: 0,
        makerFee: "0.04%",
        takerFee: "0.06%",
        maxLeverage: "100x",
        url: "https://app.gmx.io/#/trade",
        chain: "Arbitrum/Avalanche"
    },
    "dydx-v4": {
        name: "dYdX V4",
        pairs: 60,
        makerFee: "0.02%",
        takerFee: "0.05%",
        maxLeverage: "20x",
        url: "https://dydx.exchange/",
        chain: "Cosmos"
    },
    "avantis": {
        name: "Avantis",
        pairs: 0,
        makerFee: "0.045%",
        takerFee: "0.045%",
        maxLeverage: "500x",
        url: "https://avantisfi.com",
        chain: "Base"
    },
    "reya": {
        name: "Reya",
        pairs: 0,
        makerFee: "0.04%",
        takerFee: "0.04%",
        maxLeverage: "100x",
        url: "https://app.reya.xyz",
        chain: "Reya"
    },
    "vest-exchange": {
        name: "Vest Exchange",
        pairs: 0,
        makerFee: "0.01%",
        takerFee: "0.01%",
        maxLeverage: "50x",
        url: "https://vestmarkets.com",
        chain: "Arbitrum"
    },
    "myx-finance": {
        name: "MYX Finance",
        pairs: 0,
        makerFee: "0.04%",
        takerFee: "0.06%",
        maxLeverage: "50x",
        url: "https://app.myx.finance",
        chain: "Arbitrum"
    },
    "grvt-perps": {
        name: "GRVT",
        pairs: 0,
        makerFee: "-0.01%",
        takerFee: "0.055%",
        maxLeverage: "50x",
        url: "https://grvt.io",
        chain: "Base"
    },
    "hibachi": {
        name: "Hibachi",
        pairs: 0,
        makerFee: "0%",
        takerFee: "0.045%",
        maxLeverage: "50x",
        url: "https://app.hibachi.xyz",
        chain: "Arbitrum"
    },
    "edgex": {
        name: "edgeX",
        pairs: 0,
        makerFee: "0.012%",
        takerFee: "0.038%",
        maxLeverage: "100x",
        url: "https://pro.edgex.exchange",
        chain: "zkSync"
    },
    "extended": {
        name: "Extended",
        pairs: 0,
        makerFee: "0%",
        takerFee: "0.025%",
        maxLeverage: "50x",
        url: "https://extended.exchange",
        chain: "Starknet"
    },
    "gains-network": {
        name: "gTrade (Gains)",
        pairs: 100,
        makerFee: "0.06%",
        takerFee: "0.06%",
        maxLeverage: "200x",
        url: "https://gains.trade",
        chain: "Polygon/Arb"
    },
    "apex-pro": {
        name: "ApeX Protocol",
        pairs: 0,
        makerFee: "0%",
        takerFee: "0.025%",
        maxLeverage: "50x",
        url: "https://apex.exchange",
        chain: "Ethereum"
    },
    "paradex-perps": {
        name: "Paradex",
        pairs: 0,
        makerFee: "0%",
        takerFee: "0%",
        maxLeverage: "50x",
        url: "https://paradex.trade",
        chain: "Starknet"
    },
    "pacifica-perps": {
        name: "Pacifica",
        pairs: 0,
        makerFee: "0.015%",
        takerFee: "0.04%",
        maxLeverage: "50x",
        url: "https://pacifica.fi",
        chain: "Unknown",
        icon: "https://icons.llamao.fi/icons/protocols/pacifica?w=48&h=48"
    },
    "backpack-perps": {
        name: "Backpack",
        pairs: 0,
        makerFee: "0.02%",
        takerFee: "0.05%",
        maxLeverage: "50x",
        url: "https://ubiquity.backpack.exchange",
        chain: "Solana",
        icon: "https://icons.llamao.fi/icons/protocols/backpack?w=48&h=48"
    },
    "lighter-perps": {
        name: "Lighter",
        pairs: 0,
        makerFee: "0%",
        takerFee: "0%",
        maxLeverage: "50x",
        url: "https://lighter.xyz",
        chain: "zkSync"
    },
    "drift-trade": {
        name: "Drift",
        pairs: 35,
        makerFee: "-0.02%",
        takerFee: "0.035%",
        maxLeverage: "50x",
        url: "https://app.drift.trade",
        chain: "Solana"
    },
    "jupiter-perpetual-exchange": {
        name: "Jupiter",
        pairs: 5,
        makerFee: "0.06%",
        takerFee: "0.06%",
        maxLeverage: "100x",
        url: "https://jup.ag/perps",
        chain: "Solana"
    },
    "ostium-perps": {
        name: "Ostium",
        pairs: 0,
        makerFee: "0.03%",
        takerFee: "0.1%",
        maxLeverage: "200x",
        url: "https://ostium.app",
        chain: "Arbitrum",
        icon: "https://icons.llamao.fi/icons/protocols/ostium?w=48&h=48"
    }
}

type VariationMap = Record<string, PerpDexVariation>

type DeltaSnapshotSet = {
    change24h?: PerpDexHistorySnapshot
    change7d?: PerpDexHistorySnapshot
    change30d?: PerpDexHistorySnapshot
}

async function readHistoryFile(): Promise<PerpDexHistorySnapshot[]> {
    try {
        const content = await fs.readFile(HISTORY_FILE, "utf-8")
        const parsed = JSON.parse(content)
        return Array.isArray(parsed) ? parsed : []
    } catch (error: any) {
        if (error?.code === "ENOENT") {
            await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true })
            await fs.writeFile(HISTORY_FILE, "[]", "utf-8")
            return []
        }
        if (error instanceof SyntaxError) {
            console.warn("Perp history file corrupted, resetting.", error)
            await fs.writeFile(HISTORY_FILE, "[]", "utf-8")
            return []
        }
        throw error
    }
}

async function writeHistoryFile(entries: PerpDexHistorySnapshot[]) {
    await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true })
    await fs.writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2), "utf-8")
}

function formatDateKey(date: Date): string {
    const iso = date.toISOString()
    return iso.slice(0, 10)
}

function addDays(date: Date, days: number): Date {
    const cloned = new Date(date)
    cloned.setUTCDate(cloned.getUTCDate() + days)
    return cloned
}

function computeChange(current: number, previous?: number): number | null {
    if (previous === undefined || previous === null || Number.isNaN(previous) || previous === 0) return null
    return (current - previous) / previous
}

function pickDeltaSnapshots(history: PerpDexHistorySnapshot[], baseDate: Date): DeltaSnapshotSet {
    const offsets: Array<["change24h" | "change7d" | "change30d", number]> = [
        ["change24h", -1],
        ["change7d", -7],
        ["change30d", -30]
    ]
    const result: DeltaSnapshotSet = {}
    for (const [key, offset] of offsets) {
        const targetKey = formatDateKey(addDays(baseDate, offset))
        const snapshot = history.find(entry => entry.date === targetKey)
        if (snapshot) {
            result[key] = snapshot
        }
    }
    return result
}

function buildSnapshotData(data: PerpDexData[]): SnapshotDataMap {
    const snapshotData: SnapshotDataMap = {}
    for (const dex of data) {
        snapshotData[dex.id] = {
            volume24h: dex.volume24h,
            openInterest: dex.openInterest
        }
    }
    return snapshotData
}

async function recordAndComputeVariationsWithFile(
    snapshotData: SnapshotDataMap,
    todayKey: string
): Promise<VariationMap> {
    const history = await readHistoryFile()
    const existingIndex = history.findIndex(entry => entry.date === todayKey)
    let updatedHistory = [...history]
    if (existingIndex === -1) {
        updatedHistory.push({ date: todayKey, data: snapshotData })
    } else {
        updatedHistory[existingIndex] = { date: todayKey, data: snapshotData }
    }

    if (updatedHistory.length > HISTORY_LIMIT) {
        updatedHistory = updatedHistory.slice(-HISTORY_LIMIT)
    }

    await writeHistoryFile(updatedHistory)

    const deltaSnapshots = pickDeltaSnapshots(updatedHistory, new Date(`${todayKey}T00:00:00.000Z`))
    return buildVariationMap(snapshotData, deltaSnapshots)
}

function buildVariationMap(snapshotData: SnapshotDataMap, deltas: DeltaSnapshotSet): VariationMap {
    const variationMap: VariationMap = {}

    for (const dexId of Object.keys(snapshotData)) {
        variationMap[dexId] = {
            volume: computeMetricVariation("volume24h", dexId, snapshotData, deltas),
            openInterest: computeMetricVariation("openInterest", dexId, snapshotData, deltas)
        }
    }

    return variationMap
}

const computeMetricVariation = (
    metricKey: "volume24h" | "openInterest",
    dexId: string,
    snapshotData: SnapshotDataMap,
    deltas: DeltaSnapshotSet
): VariationStats => ({
    change24h: computeChange(snapshotData[dexId][metricKey], deltas.change24h?.data?.[dexId]?.[metricKey]),
    change7d: computeChange(snapshotData[dexId][metricKey], deltas.change7d?.data?.[dexId]?.[metricKey]),
    change30d: computeChange(snapshotData[dexId][metricKey], deltas.change30d?.data?.[dexId]?.[metricKey])
})

async function recordAndComputeVariations(
    data: PerpDexData[],
    options?: { persist?: boolean }
): Promise<VariationMap> {
    const today = new Date()
    const todayKey = formatDateKey(today)
    const snapshotData = buildSnapshotData(data)
    const shouldPersist = options?.persist ?? false

    const supabaseClient = getSupabaseAdminClient()
    if (supabaseClient) {
        try {
            if (shouldPersist) {
                await persistSupabaseSnapshot(supabaseClient, todayKey, snapshotData)
            }
            const history = await fetchSupabaseSnapshots(supabaseClient, [
                formatDateKey(addDays(today, -1)),
                formatDateKey(addDays(today, -7)),
                formatDateKey(addDays(today, -30))
            ])
            const deltaSnapshots = pickDeltaSnapshots(history, today)
            return buildVariationMap(snapshotData, deltaSnapshots)
        } catch (error) {
            console.error("Supabase metrics sync failed", error)
        }
    }

    return recordAndComputeVariationsWithFile(snapshotData, todayKey)
}

async function persistSupabaseSnapshot(
    client: SupabaseClient,
    dateKey: string,
    snapshotData: SnapshotDataMap
) {
    const rows = Object.entries(snapshotData).map(([dexId, metrics]) => ({
        date: dateKey,
        dex_id: dexId,
        volume24h: metrics.volume24h,
        openInterest: metrics.openInterest
    }))
    if (rows.length === 0) return
    const { error } = await client.from(SUPABASE_TABLE).upsert(rows, { onConflict: "date,dex_id" })
    if (error) throw error
}

async function fetchSupabaseSnapshots(
    client: SupabaseClient,
    dateKeys: string[]
): Promise<PerpDexHistorySnapshot[]> {
    const uniqueKeys = Array.from(new Set(dateKeys.filter(Boolean)))
    if (uniqueKeys.length === 0) return []

    const { data, error } = await client
        .from(SUPABASE_TABLE)
        .select("date,dex_id,volume24h,openInterest")
        .in("date", uniqueKeys)

    if (error) throw error

    const grouped = new Map<string, SnapshotDataMap>()
    for (const row of data ?? []) {
        const date = row.date as string
        if (!grouped.has(date)) grouped.set(date, {})
        grouped.get(date)![row.dex_id as string] = {
            volume24h: Number(row.volume24h) || 0,
            openInterest: Number(row.openInterest) || 0
        }
    }

    return Array.from(grouped.entries()).map(([date, snapshot]) => ({ date, data: snapshot }))
}

async function loadLatestSupabasePerpData(client: SupabaseClient): Promise<PerpDexData[] | null> {
    const { data: latestDateRows, error } = await client
        .from(SUPABASE_TABLE)
        .select("date")
        .order("date", { ascending: false })
        .limit(1)

    if (error) {
        console.error("Failed to fetch latest Supabase date", error)
        return null
    }

    const latestDate = latestDateRows?.[0]?.date as string | undefined
    if (!latestDate) return null

    const latestSnapshots = await fetchSupabaseSnapshots(client, [latestDate])
    const latestSnapshot = latestSnapshots.find(entry => entry.date === latestDate)
    if (!latestSnapshot) return null

    const baseDate = new Date(`${latestDate}T00:00:00.000Z`)
    const history = await fetchSupabaseSnapshots(client, [
        formatDateKey(addDays(baseDate, -1)),
        formatDateKey(addDays(baseDate, -7)),
        formatDateKey(addDays(baseDate, -30))
    ])
    const deltaSnapshots = pickDeltaSnapshots(history, baseDate)
    const variationMap = buildVariationMap(latestSnapshot.data, deltaSnapshots)

    return hydrateSnapshotToPerpDexData(latestSnapshot.data, variationMap)
}

function hydrateSnapshotToPerpDexData(
    snapshotData: SnapshotDataMap,
    variationMap: VariationMap
): PerpDexData[] {
    return Object.entries(snapshotData)
        .map(([id, metrics]) => {
            const baseConfig = STATIC_CONFIG[id] || {}
            return {
                id,
                name: baseConfig.name ?? id,
                chain: baseConfig.chain ?? "Unknown",
                volume24h: metrics.volume24h,
                volume7d: metrics.volume24h * 7,
                tvl: 0,
                openInterest: metrics.openInterest,
                pairs: baseConfig.pairs ?? 0,
                makerFee: baseConfig.makerFee ?? "N/A",
                takerFee: baseConfig.takerFee ?? "N/A",
                maxLeverage: baseConfig.maxLeverage ?? "—",
                url: baseConfig.url ?? "",
                icon: baseConfig.icon ?? getProtocolIcon(id),
                variation: variationMap[id]
            }
        })
        .sort((a, b) => b.volume24h - a.volume24h)
}

const getProtocolIcon = (slug?: string) =>
    slug ? `https://icons.llamao.fi/icons/protocols/${encodeURIComponent(slug)}?w=64&h=64` : ""

type FetchPerpOptions = {
    refresh?: boolean
}

export async function fetchPerpDexData(options?: FetchPerpOptions): Promise<PerpDexData[]> {
    if (options?.refresh) {
        return collectLivePerpDexData(true)
    }

    const supabaseClient = getSupabaseAdminClient()
    if (supabaseClient) {
        try {
            const cached = await loadLatestSupabasePerpData(supabaseClient)
            if (cached && cached.length > 0) {
                return cached
            }
        } catch (error) {
            console.error("Failed to load Supabase cached data", error)
        }
    }

    return collectLivePerpDexData(false)
}

const FALLBACK_METRICS: Record<string, FallbackMetrics> = {
    "gmx-v2-perps": {
        volume24h: 620_000_000,
        volume7d: 4_100_000_000,
        tvl: 600_000_000,
        openInterest: 450_000_000
    },
    "dydx-v4": {
        volume24h: 450_000_000,
        volume7d: 3_000_000_000,
        tvl: 380_000_000,
        openInterest: 210_000_000
    },
    "gains-network": {
        volume24h: 60_000_000,
        volume7d: 400_000_000,
        tvl: 50_000_000,
        openInterest: 35_000_000
    },
    "drift-trade": {
        volume24h: 180_000_000,
        volume7d: 1_100_000_000,
        tvl: 130_000_000,
        openInterest: 90_000_000
    },
    "jupiter-perpetual-exchange": {
        volume24h: 25_000_000,
        volume7d: 170_000_000,
        tvl: 30_000_000,
        openInterest: 20_000_000
    }
}

function buildFallbackEntries(): PerpDexData[] {
    return Object.entries(STATIC_CONFIG)
        .filter(([key]) => Boolean(FALLBACK_METRICS[key]))
        .map(([key, config]) => ({
            id: key,
            name: config.name,
            chain: config.chain,
            volume24h: FALLBACK_METRICS[key]?.volume24h ?? 0,
            volume7d: FALLBACK_METRICS[key]?.volume7d ?? (FALLBACK_METRICS[key]?.volume24h ?? 0) * 7,
            tvl: FALLBACK_METRICS[key]?.tvl ?? 0,
            openInterest: FALLBACK_METRICS[key]?.openInterest ?? 0,
            pairs: config.pairs,
            makerFee: config.makerFee,
            takerFee: config.takerFee,
            maxLeverage: config.maxLeverage,
            url: config.url,
            icon: config.icon || getProtocolIcon(key)
        }))
}

const toNumber = (value: unknown, fallback = 0): number => (typeof value === "number" && Number.isFinite(value) ? value : fallback)

async function fetchAsterData(): Promise<PerpDexData | null> {
    try {
        const [tickerRes, exchangeInfoRes] = await Promise.all([
            fetch("https://fapi.asterdex.com/fapi/v1/ticker/24hr", { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
            fetch("https://fapi.asterdex.com/fapi/v1/exchangeInfo", { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
        ])

        if (!tickerRes.ok || !exchangeInfoRes.ok) {
            throw new Error(`Aster API returned ${tickerRes.status}/${exchangeInfoRes.status}`)
        }

        const tickers: AsterTicker[] = await tickerRes.json()
        const exchangeInfo: AsterExchangeInfo = await exchangeInfoRes.json()

        const volume24h = Array.isArray(tickers)
            ? tickers.reduce((acc, t) => acc + Number.parseFloat(t.quoteVolume ?? "0"), 0)
            : 0
        const pairs = Array.isArray(exchangeInfo.symbols)
            ? exchangeInfo.symbols.length
            : STATIC_CONFIG["aster-finance"].pairs

        // Fetch open interest across all symbols and convert to notional using lastPrice
        const symbolPrices = new Map<string, number>(
            (Array.isArray(tickers) ? tickers : []).map(t => [
                t.symbol,
                Number.parseFloat(
                    t.lastPrice ??
                    // fallbacks in case lastPrice is missing or zero
                    (t as { weightedAvgPrice?: string }).weightedAvgPrice ??
                    "0"
                )
            ])
        )
        const allSymbols = (Array.isArray(tickers) ? tickers : []).map(t => t.symbol)

        let openInterestNotional = 0
        const chunkSize = 50
        for (let i = 0; i < allSymbols.length; i += chunkSize) {
            const batch = allSymbols.slice(i, i + chunkSize)
            const oiResponses = await Promise.allSettled(
                batch.map(symbol =>
                    fetch(`https://fapi.asterdex.com/fapi/v1/openInterest?symbol=${symbol}`, {
                        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
                    })
                        .then(res => (res.ok ? res.json() : null))
                        .catch(() => null)
                )
            )
            openInterestNotional += oiResponses.reduce((acc, result, idx) => {
                if (result.status === "fulfilled" && result.value) {
                    const oiAmount = Number.parseFloat((result.value as { openInterest?: string })?.openInterest ?? "0")
                    const price = symbolPrices.get(batch[idx]) ?? 0
                    return acc + oiAmount * price
                }
                return acc
            }, 0)
        }

        // Combine chunks may still miss late-listed pairs; allow volume ratio as a correction factor
        const totalVolume = volume24h > 0 ? volume24h : 1
        const oiToVolRatio = openInterestNotional / totalVolume

        return {
            id: "aster-finance",
            name: "Aster",
            chain: "Multi",
            volume24h,
            volume7d: volume24h * 7,
            // Aster API não expõe TVL; mantemos 0 e exibimos apenas o OI notional
            tvl: 0,
            // Alinhar com o dashboard público (long + short): dobrar o OI reportado
            openInterest: openInterestNotional > 0 ? openInterestNotional * 2 : oiToVolRatio * volume24h * 2,
            pairs,
            makerFee: STATIC_CONFIG["aster-finance"].makerFee,
            takerFee: STATIC_CONFIG["aster-finance"].takerFee,
            maxLeverage: STATIC_CONFIG["aster-finance"].maxLeverage,
            url: STATIC_CONFIG["aster-finance"].url,
            icon: STATIC_CONFIG["aster-finance"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Aster data", e)
        return null
    }
}

async function fetchHyperliquidData(): Promise<PerpDexData | null> {
    try {
        const res = await fetch("https://api.hyperliquid.xyz/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "metaAndAssetCtxs" }),
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })

        if (!res.ok) {
            throw new Error(`Hyperliquid API returned ${res.status}`)
        }

        const parsed = (await res.json()) as [HyperliquidMeta, HyperliquidAssetCtx[]]
        const meta = parsed?.[0]
        const assetCtxs = parsed?.[1] ?? []

        const volume24h = assetCtxs.reduce((acc, ctx) => acc + Number.parseFloat(ctx.dayNtlVlm ?? "0"), 0)
        const openInterest = assetCtxs.reduce(
            (acc, ctx) => acc + Number.parseFloat(ctx.openInterest ?? "0") * Number.parseFloat(ctx.markPx ?? "0"),
            0
        )

        const pairs = Array.isArray(meta?.universe) ? meta.universe.length : STATIC_CONFIG["hyperliquid-perps"].pairs

        return {
            id: "hyperliquid-perps",
            name: "Hyperliquid",
            chain: "Hyperliquid",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs,
            makerFee: STATIC_CONFIG["hyperliquid-perps"].makerFee,
            takerFee: STATIC_CONFIG["hyperliquid-perps"].takerFee,
            maxLeverage: STATIC_CONFIG["hyperliquid-perps"].maxLeverage,
            url: "https://app.hyperliquid.xyz/join/ARDRA",
            icon: STATIC_CONFIG["hyperliquid-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Hyperliquid data", e)
        return null
    }
}

async function fetchBackpackData(): Promise<PerpDexData | null> {
    try {
        const [marketsRes, tickersRes] = await Promise.all([
            fetch("https://api.backpack.exchange/api/v1/markets", {
                cache: "no-store",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            }),
            fetch("https://api.backpack.exchange/api/v1/tickers", {
                cache: "no-store",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })
        ])

        if (!marketsRes.ok || !tickersRes.ok) {
            throw new Error(`Backpack API returned ${marketsRes.status}/${tickersRes.status}`)
        }

        const markets: BackpackMarket[] = await marketsRes.json()
        const tickers: BackpackTicker[] = await tickersRes.json()

        const perpMarkets = markets.filter(m => m.marketType === "PERP")
        const perpTickers = tickers.filter(t => t.symbol.endsWith("_PERP"))
        const priceBySymbol = new Map(
            perpTickers.map(t => [t.symbol, Number.parseFloat((t as BackpackTicker & { lastPrice?: string; firstPrice?: string }).lastPrice ?? (t as BackpackTicker & { firstPrice?: string }).firstPrice ?? "0")])
        )

        const [volume24h, openInterest] = await Promise.all([
            Promise.resolve(perpTickers.reduce((acc, t) => acc + Number.parseFloat(t.quoteVolume ?? "0"), 0)),
            (async () => {
                const allPerpSymbols = perpTickers.map(t => t.symbol)

                const oiResponses = await Promise.allSettled(
                    allPerpSymbols.map(sym =>
                        fetch(`https://api.backpack.exchange/api/v1/openInterest?symbol=${sym}`, {
                            cache: "no-store",
                            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
                        })
                            .then(res => (res.ok ? res.json() : null))
                            .catch(() => null)
                    )
                )
                return oiResponses.reduce((acc, result) => {
                    if (result.status === "fulfilled" && Array.isArray(result.value) && result.value[0]) {
                        const entry = result.value[0] as BackpackOpenInterest
                        const oi = Number.parseFloat(entry.openInterest ?? "0")
                        const price = priceBySymbol.get(entry.symbol ?? "") ?? 0
                        return acc + (price > 0 ? oi * price : oi)
                    }
                    return acc
                }, 0)
            })()
        ])

        const pairs = perpMarkets.length

        return {
            id: "backpack-perps",
            name: "Backpack",
            chain: "Solana",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs,
            makerFee: STATIC_CONFIG["backpack-perps"].makerFee,
            takerFee: STATIC_CONFIG["backpack-perps"].takerFee,
            maxLeverage: STATIC_CONFIG["backpack-perps"].maxLeverage,
            url: "https://backpack.exchange",
            icon: STATIC_CONFIG["backpack-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Backpack data", e)
        return null
    }
}

async function fetchLighterData(): Promise<PerpDexData | null> {
    try {
        const res = await fetch("https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails", {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })

        if (!res.ok) {
            throw new Error(`Lighter API returned ${res.status}`)
        }

        const data: LighterExchangeStats = await res.json()
        const details = Array.isArray(data.order_book_details) ? data.order_book_details : []

        const volume24h = details.reduce((acc, s) => acc + (s.daily_quote_token_volume ?? 0), 0)
        const openInterest = details.reduce(
            (acc, s) => acc + (s.open_interest ?? 0) * (s.last_trade_price ?? 0),
            0
        )
        const pairs = details.length

        const makerFee = details[0]?.maker_fee ? `${(Number.parseFloat(details[0].maker_fee) * 100).toFixed(4)}%` : null
        const takerFee = details[0]?.taker_fee ? `${(Number.parseFloat(details[0].taker_fee) * 100).toFixed(4)}%` : null

        return {
            id: "lighter-perps",
            name: "Lighter",
            chain: "zkSync",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            // OI agregado por par representa um lado; duplicamos para alinhar com dashboards (long + short)
            openInterest: openInterest * 2,
            pairs,
            makerFee: makerFee ?? STATIC_CONFIG["lighter-perps"].makerFee,
            takerFee: takerFee ?? STATIC_CONFIG["lighter-perps"].takerFee,
            maxLeverage: STATIC_CONFIG["lighter-perps"].maxLeverage,
            url: "https://lighter.xyz",
            icon: STATIC_CONFIG["lighter-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Lighter data", e)
        return null
    }
}

async function fetchParadexData(): Promise<PerpDexData | null> {
    const token =
        process.env.PARADEX_READONLY_TOKEN ||
        "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJhdCtKV1QiLCJ0b2tlbl91c2FnZSI6InJlYWRvbmx5IiwicHVia2V5IjoiMHgyODBkNWFmNDViN2IxMmJmODFmYWUwMTZlMjQ4MTI5YTkxOTM3ZDg5N2YzYmFiZDM2YjdhMGI1NGViMTZlMDgiLCJpc3MiOiJQYXJhZGV4IHByb2QiLCJzdWIiOiIweDdiYThmZDFhZGFhMzA0OTA1ZTI0YTJjZDdlNWZkNTlmOGU3NGUzMTI0Y2RiMTNiZDEyZWUxYjU5NTQ1NjUyZSIsImV4cCI6MTc5NjE0NTkyNiwibmJmIjoxNzY0NjA5OTI2LCJpYXQiOjE3NjQ2MDk5MjYsImp0aSI6IjRhZThjYWU4LTNjZDgtNGYwMS04N2JkLTUzNThiZDliNmIzZCJ9._dXR8I14PWfSuJ7jvXC0CoM16BRXnOuzGqbaAcQQ29FL7G_tEoChTcU8TFQQCfjXeGFvMeXkTuGMt2ZmIo8MlQ"

    try {
        const marketsRes = await fetch("https://api.prod.paradex.trade/v1/markets", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (!marketsRes.ok) throw new Error(`Paradex markets returned ${marketsRes.status}`)

        const marketsJson = await marketsRes.json()
        const perpMarkets: string[] = (marketsJson.results as ParadexMarket[]).filter(m => m.asset_kind === "PERP").map(m => m.symbol!).filter(Boolean)

        const chunkSize = 25
        let volume24h = 0
        let openInterest = 0

        for (let i = 0; i < perpMarkets.length; i += chunkSize) {
            const batch = perpMarkets.slice(i, i + chunkSize)
            const summaries = await Promise.allSettled(
                batch.map(symbol =>
                    fetch(`https://api.prod.paradex.trade/v1/markets/summary?market=${encodeURIComponent(symbol)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
                    })
                        .then(res => (res.ok ? res.json() : null))
                        .catch(() => null)
                )
            )

            for (const summary of summaries) {
                if (summary.status === "fulfilled" && summary.value) {
                    const result = (summary.value as ParadexSummary).results?.[0]
                    if (!result) continue
                    const vol = Number.parseFloat(result.volume_24h ?? "0")
                    const oi = Number.parseFloat(result.open_interest ?? "0")
                    const price = Number.parseFloat(result.mark_price ?? "0")
                    volume24h += vol || 0
                    openInterest += (oi || 0) * (price || 0)
                }
            }
        }

        return {
            id: "paradex-perps",
            name: "Paradex",
            chain: "Starknet",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: perpMarkets.length,
            makerFee: STATIC_CONFIG["paradex-perps"].makerFee,
            takerFee: STATIC_CONFIG["paradex-perps"].takerFee,
            maxLeverage: STATIC_CONFIG["paradex-perps"].maxLeverage,
            url: "https://paradex.trade",
            icon: STATIC_CONFIG["paradex-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Paradex data", e)
        return null
    }
}

async function fetchDriftData(): Promise<PerpDexData | null> {
    try {
        // Fetch prices to discover markets and current price
        const pricesRes = await fetch(`${DRIFT_DATA_BASE}/stats/markets/prices`, {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (!pricesRes.ok) {
            console.warn?.(`Drift prices returned ${pricesRes.status}, skipping native aggregation.`)
            return null
        }
        const pricesJson = await pricesRes.json()
        const priceMarkets: DriftMarketPrice[] = pricesJson.markets || []
        const perpSymbols = priceMarkets.filter(m => (m.marketType || "").toLowerCase() === "perp").map(m => m.symbol || "")
        const priceBySymbol = new Map<string, number>(
            priceMarkets.map(m => [m.symbol || "", Number.parseFloat(m.currentPrice ?? "0")])
        )

        // Volume (24h) for all markets; we'll filter perps
        const nowSec = Math.floor(Date.now() / 1000)
        const startSec = nowSec - 24 * 3600
        let volumeBySymbol = new Map<string, number>()
        try {
            const volumeRes = await fetch(`${DRIFT_DATA_BASE}/stats/markets/volume?startTs=${startSec}&endTs=${nowSec}`, {
                cache: "no-store",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })
            if (volumeRes.ok) {
                const volumeJson = await volumeRes.json()
                const volumeMarkets: DriftVolumeMarket[] = volumeJson.markets || []
                volumeBySymbol = new Map(
                    volumeMarkets
                        .filter(m => (m.marketType || "").toLowerCase() === "perp")
                        .map(m => [m.symbol || "", Number.parseFloat(m.quoteVolume ?? "0")])
                )
            } else {
                console.warn?.(`Drift volume endpoint returned ${volumeRes.status}`)
            }
        } catch (err) {
            console.warn?.("Failed to fetch Drift volume data", err)
        }

        // Open interest: latest value per marketName (base units), convert to notional using currentPrice
        let openInterest = 0
        const oiBatchSize = 20
        for (let i = 0; i < perpSymbols.length; i += oiBatchSize) {
            const batch = perpSymbols.slice(i, i + oiBatchSize)
            const oiResponses = await Promise.allSettled(
                batch.map(symbol =>
                    fetch(
                        `${DRIFT_DATA_BASE}/amm/openInterest?marketName=${encodeURIComponent(symbol)}&start=${startSec}&end=${nowSec}`,
                        { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
                    )
                        .then(res => (res.ok ? res.json() : null))
                        .catch(() => null)
                )
            )
            oiResponses.forEach((result, idx) => {
                if (result.status === "fulfilled" && result.value && Array.isArray(result.value.data)) {
                    const dataArr = result.value.data as [number, string][]
                    if (dataArr.length > 0) {
                        const last = dataArr[dataArr.length - 1]
                        const oiBase = Number.parseFloat(last[1] || "0")
                        const price = priceBySymbol.get(batch[idx]) || 0
                        openInterest += oiBase * price
                    }
                }
            })
        }

        let volume24h = perpSymbols.reduce((acc, sym) => acc + (volumeBySymbol.get(sym) ?? 0), 0)
        if (volume24h <= 0) {
            try {
                const fallback = await getDriftExternal()
                if (fallback?.dailyVolumeUsd && fallback.dailyVolumeUsd > 0) {
                    volume24h = fallback.dailyVolumeUsd
                }
                if (openInterest <= 0 && fallback?.openInterestUsd && fallback.openInterestUsd > 0) {
                    openInterest = fallback.openInterestUsd
                }
            } catch (err) {
                console.warn?.("Drift fallback volume unavailable", err)
            }
        }

        return {
            id: "drift-trade",
            name: "Drift",
            chain: "Solana",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: perpSymbols.length,
            makerFee: STATIC_CONFIG["drift-trade"].makerFee,
            takerFee: STATIC_CONFIG["drift-trade"].takerFee,
            maxLeverage: STATIC_CONFIG["drift-trade"].maxLeverage,
            url: "https://app.drift.trade",
            icon: STATIC_CONFIG["drift-trade"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Drift data", e)
        return null
    }
}

async function fetchPacificaData(): Promise<PerpDexData | null> {
    try {
        const res = await fetch(`${PACIFICA_BASE}/api/v1/info/prices`, {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (!res.ok) throw new Error(`Pacifica prices returned ${res.status}`)

        const json = await res.json()
        const prices: PacificaPrice[] = json.data || []

        // Primary volume source: direct 24h volume from prices endpoint
        let volume24h = prices.reduce(
            (acc, p) => acc + Number.parseFloat(p.volume_24h ?? p.volume24h ?? "0"),
            0
        )

        // If API returns zeros, attempt a lightweight kline-based fallback per market
        if (volume24h === 0 && prices.length > 0) {
            const startTime = Date.now() - 24 * 3600 * 1000
            const endTime = Date.now()
            const volumeResults = await Promise.allSettled(
                prices.map(p =>
                    fetch(
                        `${PACIFICA_BASE}/api/v1/kline?symbol=${encodeURIComponent(p.symbol ?? "")}&interval=1h&startTime=${startTime}&endTime=${endTime}`,
                        { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
                    )
                        .then(res => (res.ok ? res.json() : []))
                        .catch(() => [])
                )
            )

            volumeResults.forEach((result, idx) => {
                if (result.status === "fulfilled" && Array.isArray(result.value)) {
                    const mid = Number.parseFloat(prices[idx]?.mid ?? "0")
                    const baseVolume = result.value.reduce(
                        (acc: number, k: { v?: string }) => acc + Number.parseFloat(k?.v ?? "0"),
                        0
                    )
                    if (baseVolume > 0 && mid > 0) {
                        volume24h += baseVolume * mid
                    }
                }
            })
        }

        const openInterest = prices.reduce((acc, p) => {
            const oiBase = Number.parseFloat(p.openInterest ?? p.open_interest ?? "0")
            const mid = Number.parseFloat(p.mid ?? "0")
            return acc + oiBase * mid
        }, 0)

        return {
            id: "pacifica-perps",
            name: "Pacifica",
            chain: "Unknown",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: prices.length,
            makerFee: STATIC_CONFIG["pacifica-perps"].makerFee,
            takerFee: STATIC_CONFIG["pacifica-perps"].takerFee,
            maxLeverage: STATIC_CONFIG["pacifica-perps"].maxLeverage,
            url: "https://pacifica.fi",
            icon: STATIC_CONFIG["pacifica-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Pacifica data", e)
        return null
    }
}

async function fetchGmxData(): Promise<PerpDexData | null> {
    const chains = [
        {
            name: "Arbitrum",
            rest: "https://arbitrum-api.gmxinfra.io",
            rpcUrl: "https://arb1.arbitrum.io/rpc",
            oracleUrl: "https://arbitrum-api.gmxinfra.io",
            subsquidUrl: "https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql",
            chainId: 42161
        },
        {
            name: "Avalanche",
            rest: "https://avalanche-api.gmxinfra.io",
            rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
            oracleUrl: "https://avalanche-api.gmxinfra.io",
            subsquidUrl: "https://gmx.squids.live/gmx-synthetics-avalanche:prod/api/graphql",
            chainId: 43114
        }
    ]

    let totalOI = 0
    let pairs = 0
    let volume24h = 0

    const getChainVolume = async (chain: typeof chains[number]): Promise<number> => {
        try {
            const sdk = new GmxSdk({
                chainId: chain.chainId,
                rpcUrl: chain.rpcUrl,
                oracleUrl: chain.oracleUrl,
                subsquidUrl: chain.subsquidUrl
            })
            const vols = await sdk.markets.getDailyVolumes()
            const entries = Object.values(vols ?? {})
            const total = entries.reduce<bigint>((acc, v) => {
                if (typeof v === "bigint") return acc + v
                if (typeof v === "number") return acc + BigInt(Math.trunc(v))
                if (typeof v === "string") {
                    try {
                        return acc + BigInt(v)
                    } catch {
                        return acc
                    }
                }
                return acc
            }, 0n)
            return Number(total) / 1e30
        } catch (err) {
            console.error(`GMX SDK volume fetch failed for ${chain.name}`, err)
            return 0
        }
    }

    for (const chain of chains) {
        try {
            const res = await fetch(`${chain.rest}/markets/info`, {
                cache: "no-store",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })
            if (res.ok) {
                const json = await res.json()
                const markets: GmxMarketInfo[] = json?.markets ?? []
                pairs += markets.length
                totalOI += markets.reduce((acc, m) => {
                    const longOi = Number.parseFloat(m.openInterestLong ?? "0")
                    const shortOi = Number.parseFloat(m.openInterestShort ?? "0")
                    return acc + (longOi + shortOi) / 1e30
                }, 0)
            }
        } catch (err) {
            console.error(`GMX markets fetch failed for ${chain.name}`, err)
        }

        volume24h += await getChainVolume(chain)
    }

    if (totalOI <= 0 || volume24h <= 0) {
        try {
            const fallback = await getDefillamaMetrics(["gmx", "gmx-v2", "gmx-perps"])
            if (fallback) {
                if (fallback.dailyVolumeUsd > 0) volume24h = fallback.dailyVolumeUsd
                if (fallback.openInterestUsd > 0) totalOI = fallback.openInterestUsd
            }
        } catch (error) {
            console.warn("DefiLlama fallback for GMX failed", error)
        }
    }

    if (totalOI === 0 && volume24h === 0) return null

    return {
        id: "gmx-v2-perps",
        name: "GMX V2",
        chain: "Arbitrum/Avalanche",
        volume24h,
        volume7d: volume24h * 7,
        tvl: 0,
        openInterest: totalOI,
        pairs,
        makerFee: STATIC_CONFIG["gmx-v2-perps"].makerFee,
        takerFee: STATIC_CONFIG["gmx-v2-perps"].takerFee,
        maxLeverage: STATIC_CONFIG["gmx-v2-perps"].maxLeverage,
        url: STATIC_CONFIG["gmx-v2-perps"].url,
        icon: STATIC_CONFIG["gmx-v2-perps"].icon ?? ""
    }
}

async function fetchDydxData(): Promise<PerpDexData | null> {
    try {
        const res = await fetch("https://indexer.dydx.trade/v4/perpetualMarkets", {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (!res.ok) throw new Error(`dYdX indexer returned ${res.status}`)

        const json = await res.json()
        const markets: DydxPerpetualMarket[] = Object.values(json?.markets ?? {})
        if (!markets.length) return null

        const volume24h = markets.reduce((acc, m) => acc + Number.parseFloat(m.volume24H ?? "0"), 0)
        const openInterest = markets.reduce((acc, m) => {
            const oiBase = Number.parseFloat(m.openInterest ?? "0")
            const price = Number.parseFloat(m.oraclePrice ?? "0")
            return acc + oiBase * price
        }, 0)
        const maxLev = markets.reduce((acc, m) => {
            const imf = Number.parseFloat(m.initialMarginFraction ?? "0")
            const lev = imf > 0 ? 1 / imf : 0
            return Math.max(acc, lev)
        }, 0)

        return {
            id: "dydx-v4",
            name: "dYdX V4",
            chain: "Cosmos",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: markets.length,
            makerFee: STATIC_CONFIG["dydx-v4"].makerFee,
            takerFee: STATIC_CONFIG["dydx-v4"].takerFee,
            maxLeverage: maxLev > 0 ? `${Math.floor(maxLev)}x` : STATIC_CONFIG["dydx-v4"].maxLeverage,
            url: STATIC_CONFIG["dydx-v4"].url,
            icon: STATIC_CONFIG["dydx-v4"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch dYdX data", e)
        return null
    }
}

async function fetchOstiumData(): Promise<PerpDexData | null> {
    const graphUrl = "https://subgraph.satsuma-prod.com/391a61815d32/ostium/ost-prod/api"
    try {
        // Pairs: pull OI, fees, leverage, price
        const pairsQuery = `
          query OstiumPairs {
            pairs(first: 500) {
              longOI
              shortOI
              lastTradePrice
              makerFeeP
              takerFeeP
              group { maxLeverage }
            }
          }
        `

        // Trades last 24h for volume (paginated)
        const since = Math.floor(Date.now() / 1000) - 24 * 3600
        const tradesQuery = `
          query OstiumTrades($since: BigInt!, $skip: Int!) {
            trades(first: 1000, skip: $skip, where: { timestamp_gt: $since }, orderBy: timestamp, orderDirection: desc) {
              notional
            }
          }
        `

        const [pairsRes] = await Promise.all([
            fetch(graphUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: pairsQuery }),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })
        ])

        if (!pairsRes.ok) {
            throw new Error(`Ostium graph returned ${pairsRes.status}`)
        }

        const pairsJson = await pairsRes.json()

        const pairs: OstiumPair[] = pairsJson?.data?.pairs ?? []

        if (pairs.length === 0) {
            throw new Error("Ostium pairs empty")
        }

        // Paginate trades to avoid truncation
        let trades: OstiumTrade[] = []
        for (let skip = 0; skip < 10_000; skip += 1000) {
            const res = await fetch(graphUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: tradesQuery, variables: { since: `${since}`, skip } }),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })
            if (!res.ok) break
            const json = await res.json()
            const page: OstiumTrade[] = json?.data?.trades ?? []
            trades = trades.concat(page)
            if (page.length < 1000) break
        }

        // Open interest: (long + short) are 1e18 scaled base; price 1e18; convert to notional USD
        const openInterest = pairs.reduce((acc, p) => {
            const longOi = Number.parseFloat(p.longOI ?? "0")
            const shortOi = Number.parseFloat(p.shortOI ?? "0")
            const price = Number.parseFloat(p.lastTradePrice ?? "0")
            const notional = ((longOi + shortOi) / 1e18) * (price / 1e18)
            return acc + (Number.isFinite(notional) ? notional : 0)
        }, 0)

        // Volume 24h: sum trade.notional (USDC 6 decimals in subgraph)
        const volume24h = trades.reduce((acc, t) => acc + Number.parseFloat(t.notional ?? "0") / 1e6, 0)

        const makerFeeRaw = Number.parseFloat(pairs[0]?.makerFeeP ?? "0")
        const takerFeeRaw = Number.parseFloat(pairs[0]?.takerFeeP ?? "0")
        const makerFee = `${((makerFeeRaw / 1e8) * 100).toFixed(3)}%`
        const takerFee = `${((takerFeeRaw / 1e8) * 100).toFixed(3)}%`

        const maxLevRaw = Math.max(
            ...pairs.map(p => Number.parseFloat(p.group?.maxLeverage ?? "0")).filter(n => Number.isFinite(n))
        )
        const maxLeverage = maxLevRaw > 0 ? `${(maxLevRaw / 100).toFixed(0)}x` : "N/A"

        return {
            id: "ostium-perps",
            name: "Ostium",
            chain: "Arbitrum",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: pairs.length,
            makerFee,
            takerFee,
            maxLeverage,
            url: STATIC_CONFIG["ostium-perps"].url,
            icon: STATIC_CONFIG["ostium-perps"].icon ?? ""
        }
    } catch (e) {
        console.error("Failed to fetch Ostium data", e)
        return null
    }
}

async function fetchExtendedData(): Promise<PerpDexData | null> {
    try {
        const res = await fetch("https://api.starknet.extended.exchange/api/v1/info/markets", {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (!res.ok) throw new Error(`Extended API returned ${res.status}`)

        const json = await res.json()
        const markets: ExtendedMarket[] = json?.data ?? []
        if (!markets.length) return null

        const volume24h = markets.reduce((acc, m) => acc + Number.parseFloat(m.marketStats?.dailyVolume ?? "0"), 0)
        const openInterest = markets.reduce((acc, m) => acc + Number.parseFloat(m.marketStats?.openInterest ?? "0"), 0)

        return {
            id: "extended",
            name: "Extended",
            chain: "Starknet",
            volume24h,
            volume7d: volume24h * 7,
            tvl: 0,
            openInterest,
            pairs: markets.length,
            makerFee: STATIC_CONFIG["extended"].makerFee,
            takerFee: STATIC_CONFIG["extended"].takerFee,
            maxLeverage: STATIC_CONFIG["extended"].maxLeverage,
            url: STATIC_CONFIG["extended"].url,
            icon: ""
        }
    } catch (e) {
        console.error("Failed to fetch Extended data", e)
        return null
    }
}

const DEFILLAMA_OVERVIEW_URLS = [
    "https://pro-api.llama.fi/api/overview/derivatives",
    "https://api.llama.fi/overview/derivatives"
]
const DEFILLAMA_OI_URLS = [
    "https://pro-api.llama.fi/api/overview/open-interest",
    "https://api.llama.fi/overview/open-interest",
    "https://api.llama.fi/overview/open-interest" // duplicate to ensure fallback order
]
const DEFILLAMA_CACHE_TTL = 5 * 60 * 1000
let defillamaCache: { timestamp: number; data: DefillamaDerivativesOverview | null } = { timestamp: 0, data: null }
const DEFILLAMA_OI_CACHE_TTL = 5 * 60 * 1000
let defillamaOiCache: { timestamp: number; data: Record<string, number> | null } = { timestamp: 0, data: null }

async function fetchJsonWithOptionalKey(url: string, apiKey?: string) {
    let res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (res.ok) return res.json()
    if ((res.status === 401 || res.status === 403) && apiKey) {
        const u = new URL(url)
        const withKey = `${u.origin}/${apiKey}${u.pathname}${u.search}`
        res = await fetch(withKey, { headers: { accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
        if (res.ok) return res.json()
    }
    throw new Error(`DefiLlama request failed ${res.status}`)
}

async function fetchDefillamaOverview(): Promise<DefillamaDerivativesOverview | null> {
    try {
        const now = Date.now()
        if (defillamaCache.data && now - defillamaCache.timestamp < DEFILLAMA_CACHE_TTL) {
            return defillamaCache.data
        }
        const apiKey = process.env.DEFILLAMA_API_KEY
        for (const url of DEFILLAMA_OVERVIEW_URLS) {
            try {
                const data = (await fetchJsonWithOptionalKey(url, apiKey)) as DefillamaDerivativesOverview
                defillamaCache = { timestamp: now, data }
                return data
            } catch (inner) {
                continue
            }
        }
        return null
    } catch (e) {
        console.error("Failed to fetch DefiLlama overview", e)
        return null
    }
}

async function fetchDefillamaOpenInterest(slug: string): Promise<number> {
    const now = Date.now()
    if (defillamaOiCache.data && now - defillamaOiCache.timestamp < DEFILLAMA_OI_CACHE_TTL) {
        const cached = defillamaOiCache.data[slug.toLowerCase()]
        if (typeof cached === "number") return cached
    }

    for (const url of DEFILLAMA_OI_URLS) {
        try {
            const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
            if (!res.ok) continue
            const json = await res.json()
            const protocols: { name?: string; slug?: string; defillamaId?: string; total24h?: number }[] = json?.protocols ?? []
            const map: Record<string, number> = {}
            for (const proto of protocols) {
                if (!proto) continue
                const key =
                    (proto.slug ?? proto.name ?? proto.defillamaId ?? "")
                        .toString()
                        .toLowerCase()
                if (!key) continue
                if (typeof proto.total24h === "number") {
                    map[key] = proto.total24h
                }
            }
            defillamaOiCache = { timestamp: Date.now(), data: map }
            const candidate =
                map[slug.toLowerCase()] ??
                map["avantis"] ??
                map["4108"]
            if (typeof candidate === "number") return candidate
        } catch (err) {
            console.warn?.("DefiLlama open-interest fetch failed", err)
            continue
        }
    }

    return 0
}

async function fetchAvantisData(): Promise<PerpDexData | null> {
    const overview = await fetchDefillamaOverview()
    const protocol = overview?.protocols?.find(p => (p.defillamaId ?? "").toLowerCase() === "avantis" || (p.name ?? "").toLowerCase() === "avantis")
    if (!protocol) return null

    const volume24h = protocol.total24h ?? 0

    // open interest via open-interest overview
    let openInterest = protocol.openInterest ?? 0
    if (openInterest === 0) {
        openInterest = await fetchDefillamaOpenInterest(protocol.slug ?? protocol.defillamaId ?? "avantis")
    }

    return {
        id: "avantis",
        name: "Avantis",
        chain: "Base",
        volume24h,
        volume7d: volume24h * 7,
        tvl: 0,
        openInterest,
        pairs: 0,
        makerFee: STATIC_CONFIG["avantis"].makerFee,
        takerFee: STATIC_CONFIG["avantis"].takerFee,
        maxLeverage: STATIC_CONFIG["avantis"].maxLeverage,
        url: STATIC_CONFIG["avantis"].url,
        icon: STATIC_CONFIG["avantis"].icon ?? ""
    }
}

async function collectLivePerpDexData(persistSnapshot: boolean): Promise<PerpDexData[]> {
    let llamaProtocols: DefiLlamaProtocol[] = []
    try {
        const response = await fetch("https://api.llama.fi/protocols", {
            cache: "no-store",
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
        if (response.ok) {
            const parsed = await response.json()
            llamaProtocols = Array.isArray(parsed) ? parsed : []
        } else {
            console.warn(`DefiLlama protocols returned ${response.status}`)
        }
    } catch (error) {
        console.warn("DefiLlama protocol fetch failed, continuing with partial data.", error)
    }

    try {
        let mappedData: PerpDexData[] = buildFallbackEntries()

        const defiLlamaEntries = llamaProtocols
            .filter((protocol): protocol is DefiLlamaProtocol & { slug: string } =>
                Boolean(protocol.slug && STATIC_CONFIG[protocol.slug])
            )
            .map(protocol => {
                const config = STATIC_CONFIG[protocol.slug]
                const fallback = FALLBACK_METRICS[protocol.slug] || {}
                const allowFallback = !["hyperliquid-perps", "aster-finance"].includes(protocol.slug)

                const volume24h = toNumber(protocol.volume24h, allowFallback ? fallback.volume24h ?? 0 : 0)
                const volume7d = toNumber(protocol.volume7d, allowFallback ? fallback.volume7d ?? volume24h * 7 : 0)
                const tvl = toNumber(protocol.tvl, allowFallback ? fallback.tvl ?? 0 : 0)
                const openInterest = toNumber(protocol.openInterest, allowFallback ? fallback.openInterest ?? 0 : 0)

                return {
                    id: protocol.slug ?? String(protocol.id),
                    name: config.name || protocol.name || "Unknown",
                    chain: config.chain || protocol.chain || "Unknown",
                    volume24h,
                    volume7d,
                    tvl,
                    openInterest,
                    pairs: config.pairs || 0,
                    makerFee: config.makerFee || "N/A",
                    takerFee: config.takerFee || "N/A",
                    maxLeverage: config.maxLeverage || "N/A",
                    url: config.url || protocol.url || "",
                    icon: config.icon || protocol.logo || ""
                }
            })

        for (const entry of defiLlamaEntries) {
            const idx = mappedData.findIndex(d => d.id === entry.id)
            if (idx !== -1) {
                mappedData[idx] = {
                    ...mappedData[idx],
                    ...entry
                }
            } else {
                mappedData.push(entry)
            }
        }

        const asterData = await fetchAsterData()
        if (asterData) {
            const existingIndex = mappedData.findIndex(d => d.name === "Aster")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...asterData
                }
            } else {
                mappedData.push(asterData)
            }
        }

        const hyperliquidData = await fetchHyperliquidData()
        if (hyperliquidData) {
            const existingIndex = mappedData.findIndex(d => d.id === "hyperliquid-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...hyperliquidData
                }
            } else {
                mappedData.push(hyperliquidData)
            }
        }

        const backpackData = await fetchBackpackData()
        if (backpackData) {
            const existingIndex = mappedData.findIndex(d => d.id === "backpack-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...backpackData
                }
            } else {
                mappedData.push(backpackData)
            }
        }

        const lighterData = await fetchLighterData()
        if (lighterData) {
            const existingIndex = mappedData.findIndex(d => d.id === "lighter-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...lighterData
                }
            } else {
                mappedData.push(lighterData)
            }
        }

        const paradexData = await fetchParadexData()
        if (paradexData) {
            const existingIndex = mappedData.findIndex(d => d.id === "paradex-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...paradexData
                }
            } else {
                mappedData.push(paradexData)
            }
        }

        const driftData = await fetchDriftData()
        if (driftData) {
            const existingIndex = mappedData.findIndex(d => d.id === "drift-trade")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...driftData
                }
            } else {
                mappedData.push(driftData)
            }
        }

        const pacificaData = await fetchPacificaData()
        if (pacificaData) {
            const existingIndex = mappedData.findIndex(d => d.id === "pacifica-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...pacificaData
                }
            } else {
                mappedData.push(pacificaData)
            }
        }

        const ostiumData = await fetchOstiumData()
        if (ostiumData) {
            const existingIndex = mappedData.findIndex(d => d.id === "ostium-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...ostiumData
                }
            } else {
                mappedData.push(ostiumData)
            }
        }

        const gmxData = await fetchGmxData()
        if (gmxData) {
            const existingIndex = mappedData.findIndex(d => d.id === "gmx-v2-perps")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...gmxData
                }
            } else {
                mappedData.push(gmxData)
            }
        }

        const dydxData = await fetchDydxData()
        if (dydxData) {
            const existingIndex = mappedData.findIndex(d => d.id === "dydx-v4")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...dydxData
                }
            } else {
                mappedData.push(dydxData)
            }
        }

        const extendedData = await fetchExtendedData()
        if (extendedData) {
            const existingIndex = mappedData.findIndex(d => d.id === "extended")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...extendedData
                }
            } else {
                mappedData.push(extendedData)
            }
        }

        const avantisData = await fetchAvantisData()
        if (avantisData) {
            const existingIndex = mappedData.findIndex(d => d.id === "avantis")
            if (existingIndex !== -1) {
                mappedData[existingIndex] = {
                    ...mappedData[existingIndex],
                    ...avantisData
                }
            } else {
                mappedData.push(avantisData)
            }
        }

        // External connectors (native + DefiLlama fallback)
        const [reya, gains, vest, myx, hibachi, edgex, driftExternal, grvt, apex, jupiter] = await Promise.allSettled([
            getReya(),
            getGains("arbitrum"),
            getVest("prod"),
            getMyx(),
            getHibachi(),
            getEdgex(),
            getDriftExternal(),
            getGrvt(),
            getApexProtocol(),
            getJupiter()
        ])

        const mergeMetric = (id: string, metrics: { dailyVolumeUsd: number; openInterestUsd: number }) => {
            const existingIndex = mappedData.findIndex(d => d.id === id)
            const baseConfig = STATIC_CONFIG[id] || {}
            const allowZeroOpenInterestOverride = id === "jupiter-perpetual-exchange"
            const entryOpenInterest =
                metrics.openInterestUsd > 0 || (allowZeroOpenInterestOverride && metrics.openInterestUsd === 0)
                    ? metrics.openInterestUsd
                    : 0
            const entry: PerpDexData = {
                id,
                name: baseConfig.name ?? id,
                chain: baseConfig.chain ?? "Unknown",
                volume24h: metrics.dailyVolumeUsd,
                volume7d: metrics.dailyVolumeUsd * 7,
                tvl: 0,
                openInterest: entryOpenInterest,
                pairs: baseConfig.pairs ?? 0,
                makerFee: baseConfig.makerFee ?? "N/A",
                takerFee: baseConfig.takerFee ?? "N/A",
                maxLeverage: baseConfig.maxLeverage ?? "N/A",
                url: baseConfig.url ?? "",
                icon: baseConfig.icon ?? ""
            }
            if (existingIndex !== -1) {
                const current = mappedData[existingIndex]
                mappedData[existingIndex] = {
                    ...current,
                    ...entry,
                    volume24h: metrics.dailyVolumeUsd > 0 ? metrics.dailyVolumeUsd : current.volume24h,
                    volume7d: metrics.dailyVolumeUsd > 0 ? metrics.dailyVolumeUsd * 7 : current.volume7d,
                    openInterest:
                        metrics.openInterestUsd > 0
                            ? metrics.openInterestUsd
                            : allowZeroOpenInterestOverride && metrics.openInterestUsd === 0
                              ? 0
                              : current.openInterest
                }
            } else {
                mappedData.push(entry)
            }
        }

        if (reya.status === "fulfilled" && reya.value) mergeMetric("reya", reya.value)
        if (gains.status === "fulfilled" && gains.value) mergeMetric("gains-network", gains.value)
        if (vest.status === "fulfilled" && vest.value) mergeMetric("vest-exchange", vest.value)
        if (myx.status === "fulfilled" && myx.value) mergeMetric("myx-finance", myx.value)
        if (hibachi.status === "fulfilled" && hibachi.value) mergeMetric("hibachi", hibachi.value)
        if (edgex.status === "fulfilled" && edgex.value) mergeMetric("edgex", edgex.value)
        if (grvt.status === "fulfilled" && grvt.value) mergeMetric("grvt-perps", grvt.value)
        if (apex.status === "fulfilled" && apex.value) mergeMetric("apex-pro", apex.value)
        if (jupiter.status === "fulfilled" && jupiter.value) mergeMetric("jupiter-perpetual-exchange", jupiter.value)
        if (driftExternal.status === "fulfilled" && driftExternal.value) mergeMetric("drift-trade", driftExternal.value)

        const normalizedData = mappedData.map(item => {
            const override = STATIC_CONFIG[item.id]
            return {
                ...item,
                makerFee: override?.makerFee || item.makerFee || "N/A",
                takerFee: override?.takerFee || item.takerFee || "N/A",
                maxLeverage: override?.maxLeverage || item.maxLeverage || "—",
                icon: item.icon || override?.icon || getProtocolIcon(item.id)
            }
        })

        let variationMap: VariationMap = {}
        try {
            variationMap = await recordAndComputeVariations(normalizedData, { persist: persistSnapshot })
        } catch (historyError) {
            console.error("Failed to persist perp history", historyError)
        }

        const enrichedData = normalizedData.map(item => ({
            ...item,
            variation: variationMap[item.id]
        }))

        return enrichedData.sort((a, b) => b.volume24h - a.volume24h)
    } catch (error) {
        console.error("Failed to fetch PerpDex data", error)

        return buildFallbackEntries().sort((a, b) => b.volume24h - a.volume24h)
    }
}
