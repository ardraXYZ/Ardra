import { NextResponse } from "next/server"
import { fetchPerpDexData } from "@/lib/api/perp-dex-data"

export const dynamic = "force-dynamic"

function isAuthorized(req: Request): boolean {
    const secret = process.env.CRON_SECRET
    if (!secret) return true
    return req.headers.get("x-cron-secret") === secret
}

async function handler(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await fetchPerpDexData({ refresh: true })
        return NextResponse.json({ ok: true, count: data.length })
    } catch (error) {
        console.error("Perp snapshot job failed", error)
        return NextResponse.json({ error: "Snapshot failed" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    return handler(req)
}

export async function POST(req: Request) {
    return handler(req)
}
