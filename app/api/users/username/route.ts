import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

function normalizeUsername(raw: string) {
  const trimmed = raw.trim().toLowerCase()
  // allow letters, numbers, underscore and hyphen
  const cleaned = trimmed.replace(/[^a-z0-9_-]/g, "")
  return cleaned
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as { username?: string }
    const desired = normalizeUsername(body?.username ?? "")
    if (!desired || desired.length < 3 || desired.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const exists = await prisma.user.findFirst({ where: { username: desired } })
    if (exists && exists.id !== session.user.id) {
      return NextResponse.json({ error: "Username already in use" }, { status: 409 })
    }

    const updated = await prisma.user.update({ where: { id: session.user.id }, data: { username: desired } })
    return NextResponse.json({ ok: true, username: updated.username })
  } catch (error) {
    console.error("[users/username]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
