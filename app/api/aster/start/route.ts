import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { start } from "@/lib/aster-manager"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    start(session.user.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[aster/start]", e)
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}

