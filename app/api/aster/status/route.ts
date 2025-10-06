import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getStatus } from "@/lib/aster-manager"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const status = getStatus(session.user.id)
    return NextResponse.json({ status })
  } catch (e: any) {
    console.error("[aster/status]", e)
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 })
  }
}

