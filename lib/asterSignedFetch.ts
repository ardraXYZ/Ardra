import crypto from "crypto"

function hmacSHA256Hex(secret: string, payload: string) {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

function buildQuery(params: Record<string, string | number>) {
    const entries = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)] as const)
        .sort(([a], [b]) => a.localeCompare(b))

    return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
}

export async function asterSignedGet(url: string, apiKey: string, secret: string, recvWindow = 5000) {
    const timestamp = Date.now()
    const query = buildQuery({ recvWindow, timestamp })
    const signature = hmacSHA256Hex(secret, query)
    const fullUrl = `${url}?${query}&signature=${signature}`

    const res = await fetch(fullUrl, {
        method: "GET",
        headers: {
            "X-MBX-APIKEY": apiKey,
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        cache: "no-store"
    })

    const text = await res.text()
    let json: any = null
    try {
        json = JSON.parse(text)
    } catch {
        // ignore
    }

    return { ok: res.ok, status: res.status, json, text, fullUrl }
}
