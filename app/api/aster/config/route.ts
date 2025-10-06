import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildDefaultConfig, writeUserConfig } from "@/lib/aster-manager"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = (await req.json().catch(() => ({}))) as {
      apiKey?: string
      secretKey?: string
      symbols?: string[]
      trading_settings?: Record<string, any>
      technical_indicators?: Record<string, any>
    }
    if (!body.apiKey || !body.secretKey) return NextResponse.json({ error: "Missing API keys" }, { status: 400 })
    const cfg = buildDefaultConfig({ apiKey: body.apiKey, secretKey: body.secretKey, ...body })
    const path = writeUserConfig(session.user.id, cfg)
    return NextResponse.json({ ok: true, configPath: path })
  } catch (e) {
    console.error("[aster/config]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

