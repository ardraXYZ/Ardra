import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getLogs } from "@/lib/aster-manager"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const logs = getLogs(session.user.id)
    return NextResponse.json({ logs })
  } catch (e: any) {
    console.error("[aster/logs]", e)
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}

