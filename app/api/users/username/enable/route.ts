import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 404 })
    }
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { canEditUsername: true } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[users/username/enable]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

