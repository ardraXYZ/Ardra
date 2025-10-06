import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, username: true, email: true, refCode: true, profileWallets: true },
    })
    if (!user) return NextResponse.json({ user: null })

    const shaped = {
      id: user.id,
      name: (user.username && user.username.length > 0) ? user.username : (user.name ?? (user.email ?? "Pilot")),
      username: user.username ?? null,
      refCode: user.refCode,
      referrals: [],
      points: 0,
      referralPoints: 0,
      feesGenerated: 0,
      referralFees: 0,
      wallets: typeof user.profileWallets === "object" && user.profileWallets !== null ? (user.profileWallets as Record<string, unknown>) : {},
      authBindings: [],
    }

    return NextResponse.json({ user: shaped })
  } catch (error) {
    console.error("[auth/me]", error)
    return NextResponse.json({ user: null })
  }
}

