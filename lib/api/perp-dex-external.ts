type ExternalMetrics = {
    dailyVolumeUsd: number
    openInterestUsd: number
}

type DefillamaProtocol = {
    name?: string
    slug?: string
    defillamaId?: string
    total24h?: number
    openInterest?: number
}

type DefillamaOverview = {
    protocols?: DefillamaProtocol[]
}

const DEFILLAMA_OVERVIEW_URL = "https://api.llama.fi/overview/derivatives"
const DEFILLAMA_CACHE_TTL = 5 * 60 * 1000

let overviewCache: { timestamp: number; data: DefillamaOverview | null } = {
    timestamp: 0,
    data: null
}

async function fetchOverview(): Promise<DefillamaOverview | null> {
    const now = Date.now()
    if (overviewCache.data && now - overviewCache.timestamp < DEFILLAMA_CACHE_TTL) {
        return overviewCache.data
    }

    try {
        const res = await fetch(DEFILLAMA_OVERVIEW_URL, { cache: "no-store" })
        if (!res.ok) return null
        const json = (await res.json()) as DefillamaOverview
        overviewCache = { timestamp: now, data: json }
        return json
    } catch (error) {
        console.error("Failed to fetch DefiLlama derivatives overview", error)
        return null
    }
}

function matchProtocol(
    overview: DefillamaOverview | null,
    aliases: string[]
): DefillamaProtocol | null {
    if (!overview?.protocols) return null
    const lowers = aliases.map(alias => alias.toLowerCase())
    return (
        overview.protocols.find(protocol => {
            const candidates = [
                protocol.slug,
                protocol.name,
                protocol.defillamaId
            ]
                .filter(Boolean)
                .map(item => item!.toLowerCase())
            return candidates.some(candidate => lowers.includes(candidate))
        }) ?? null
    )
}

export async function getDefillamaMetrics(aliases: string[]): Promise<ExternalMetrics | null> {
    const overview = await fetchOverview()
    const protocol = matchProtocol(overview, aliases)
    if (!protocol) return null
    return {
        dailyVolumeUsd: protocol.total24h ?? 0,
        openInterestUsd: protocol.openInterest ?? 0
    }
}

export const getReya = () =>
    getDefillamaMetrics(["reya", "reya-dex", "reya-perps"])

export const getGains = () =>
    getDefillamaMetrics(["gains-network", "gtrade", "gains"])

export const getVest = () =>
    getDefillamaMetrics(["vest", "vest-exchange", "vest-markets"])

export const getMyx = () =>
    getDefillamaMetrics(["myx-finance", "myx"])

export const getHibachi = () =>
    getDefillamaMetrics(["hibachi"])

export const getEdgex = () =>
    getDefillamaMetrics(["edgex", "edgeX"])

export const getDrift = () =>
    getDefillamaMetrics(["drift", "drift-trade"])

export const getGrvt = () =>
    getDefillamaMetrics(["grvt", "grvt-perps"])

export const getApexProtocol = () =>
    getDefillamaMetrics(["apex-protocol", "apex"])

export const getJupiter = () =>
    getDefillamaMetrics(["jupiter-perpetual-exchange", "jupiter"])
