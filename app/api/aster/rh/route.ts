import { NextResponse } from "next/server"
import { asterSignedGet } from "@/lib/asterSignedFetch"

const ENDPOINT = "https://www.asterdex.com/bapi/futures/v1/private/campaign/ae/rh/phase4/history"

export async function GET() {
    const apiKey = process.env.ASTER_API_KEY
    const secret = process.env.ASTER_API_SECRET
    const cookie = process.env.ASTER_WEB_COOKIE // opcional fallback

    if (!apiKey || !secret) {
        return NextResponse.json({ error: "Missing ASTER_API_KEY/ASTER_API_SECRET" }, { status: 500 })
    }

    // Mode A: signed request
    const signed = await asterSignedGet(ENDPOINT, apiKey, secret)
    const signedOk = signed.ok && signed.json?.code === "000000" && Array.isArray(signed.json?.data) && signed.json.data.length > 0
    if (signedOk) {
        return NextResponse.json({
            source: "signed",
            data: signed.json.data
        })
    }

    // Mode B: cookie fallback (if endpoint needs web session)
    if (cookie) {
        const res = await fetch(ENDPOINT, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0",
                Referer: "https://www.asterdex.com/en/stage4/statistics",
                Cookie: cookie
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

        const cookieOk = res.ok && json?.code === "000000" && Array.isArray(json?.data) && json.data.length > 0
        if (cookieOk) {
            return NextResponse.json({
                source: "cookie",
                data: json.data
            })
        }

        return NextResponse.json(
            {
                error: "Aster RH endpoint failed (signed + cookie)",
                signed: { status: signed.status, body: signed.json ?? signed.text },
                cookieMode: { status: res.status, body: json ?? text }
            },
            { status: 502 }
        )
    }

    // If we got here, signed failed and no cookie fallback
    return NextResponse.json(
        {
            error: "Aster RH endpoint failed (signed). Endpoint may require web session cookies.",
            signed: { status: signed.status, body: signed.json ?? signed.text }
        },
        { status: 502 }
    )
}
