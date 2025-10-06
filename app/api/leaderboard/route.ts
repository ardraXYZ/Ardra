import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { computeLeaderboardFromImported, loadImportedLeaderboard } from "@/lib/leaderboard-import"

export async function GET() {
  try {
    // 1) Use imported leaderboard if present
    const imported = await loadImportedLeaderboard()
    if (imported) {
      const computed = computeLeaderboardFromImported(imported)
      const byRef = new Map(computed.map((e) => [e.refCode, e]))

      try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, username: true, refCode: true } })
        for (const u of users) {
          if (byRef.has(u.refCode)) continue
          const name = (u.username && u.username.length > 0) ? u.username : (u.name ?? "Pilot")
          computed.push({
            id: u.refCode,
            name,
            refCode: u.refCode,
            points: 0,
            referralPoints: 0,
            totalPoints: 0,
            feesGenerated: 0,
            referralFees: 0,
            totalFees: 0,
            referrals: 0,
          })
        }
      } catch {}

      computed.sort((a, b) => b.totalPoints - a.totalPoints)
      return NextResponse.json({ leaderboard: computed })
    }

    // 2) Fallback to DB-derived minimal leaderboard (referrals only)
    const referrals = await prisma.referral.groupBy({ by: ["referrerId"], _count: { _all: true } })
    const byReferrer = new Map<string, number>(referrals.map((r) => [r.referrerId, r._count._all]))

    const users = await prisma.user.findMany({ select: { id: true, name: true, username: true, refCode: true } })
    const POINTS_PER_REFERRAL = 50
    const entries = users.map((u) => {
      const referralsCount = byReferrer.get(u.id) ?? 0
      const refPoints = referralsCount * POINTS_PER_REFERRAL
      return {
        id: u.id,
        name: (u.username && u.username.length > 0) ? u.username : (u.name ?? "Pilot"),
        refCode: u.refCode,
        points: 0,
        referralPoints: refPoints,
        totalPoints: refPoints,
        feesGenerated: 0,
        referralFees: Number((referralsCount * 0).toFixed(2)),
        totalFees: 0,
        referrals: referralsCount,
      }
    })

    entries.sort((a, b) => b.totalPoints - a.totalPoints)
    return NextResponse.json({ leaderboard: entries })
  } catch (error) {
    console.error("[leaderboard]", error)
    return NextResponse.json({ leaderboard: [] }, { status: 500 })
  }
}
