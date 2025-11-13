import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { computeLeaderboardFromImported, loadImportedLeaderboard } from "@/lib/leaderboard-import"

type BonusEntry = { bonusPoints: number; bonusReferralPoints: number }

function formatUserDisplayName(user: { name: string | null; username: string | null; refCode: string }) {
  if (user.username && user.username.length > 0) return user.username
  if (user.name && user.name.length > 0) return user.name
  return user.refCode
}

function applyBonusPoints<T extends { refCode: string; points: number; referralPoints: number; totalPoints: number }>(
  entries: T[],
  bonusMap: Map<string, BonusEntry>
) {
  for (const entry of entries) {
    const bonus = bonusMap.get(entry.refCode)
    if (!bonus) continue
    const boostedPoints = Math.max(0, Math.round(entry.points + (bonus.bonusPoints ?? 0)))
    const boostedRefPoints = Math.max(0, Math.round(entry.referralPoints + (bonus.bonusReferralPoints ?? 0)))
    entry.points = boostedPoints
    entry.referralPoints = boostedRefPoints
    entry.totalPoints = boostedPoints + boostedRefPoints
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        refCode: true,
        bonusPoints: true,
        bonusReferralPoints: true,
      },
    })
    const bonusMap = new Map(
      users.map((u) => [
        u.refCode,
        { bonusPoints: u.bonusPoints ?? 0, bonusReferralPoints: u.bonusReferralPoints ?? 0 },
      ])
    )

    // 1) Use imported leaderboard if present
    const imported = await loadImportedLeaderboard()
    if (imported) {
      const computed = computeLeaderboardFromImported(imported)
      const perDex: Record<string, typeof computed> = {}
      if (imported.perDexEntries && typeof imported.perDexEntries === "object") {
        const perDexRate =
          imported.rates?.perDexReferralPointsRate ??
          imported.rates?.referralPointsRate ??
          0.2
        for (const [dex, entries] of Object.entries(imported.perDexEntries)) {
          try {
            const payloadForDex = {
              ...imported,
              rates: {
                ...imported.rates,
                referralPointsRate: 0,
                perDexReferralPointsRate: perDexRate,
              },
            }
            perDex[dex] = computeLeaderboardFromImported(payloadForDex, entries, { usePerDexPoints: true })
          } catch (error) {
            console.warn(`[leaderboard] failed to compute dex ${dex}`, error)
          }
        }
      }
      const byRef = new Map(computed.map((e) => [e.refCode, e]))
      for (const u of users) {
        if (byRef.has(u.refCode)) continue
        computed.push({
          id: u.refCode,
          name: formatUserDisplayName(u),
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

      applyBonusPoints(computed, bonusMap)
      computed.sort((a, b) => b.totalPoints - a.totalPoints)
      return NextResponse.json({ leaderboard: computed, perDex })
    }

    // 2) Fallback to DB-derived minimal leaderboard (referrals only)
    const referrals = await prisma.referral.groupBy({ by: ["referrerId"], _count: { _all: true } })
    const byReferrer = new Map<string, number>(referrals.map((r) => [r.referrerId, r._count._all]))

    const POINTS_PER_REFERRAL = 50
    const entries = users.map((u) => {
      const referralsCount = byReferrer.get(u.id) ?? 0
      const refPoints = referralsCount * POINTS_PER_REFERRAL
      return {
        id: u.id,
        name: formatUserDisplayName(u),
        refCode: u.refCode,
        referrerRefCode: null,
        points: 0,
        referralPoints: refPoints,
        totalPoints: refPoints,
        feesGenerated: 0,
        referralFees: Number((referralsCount * 0).toFixed(2)),
        totalFees: 0,
        referrals: referralsCount,
      }
    })

    applyBonusPoints(entries, bonusMap)
    entries.sort((a, b) => b.totalPoints - a.totalPoints)
    return NextResponse.json({ leaderboard: entries, perDex: {} })
  } catch (error) {
    console.error("[leaderboard]", error)
    return NextResponse.json({ leaderboard: [], perDex: {} }, { status: 500 })
  }
}
