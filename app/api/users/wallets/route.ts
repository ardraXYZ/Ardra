import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const wallets = body?.wallets
    if (!wallets || typeof wallets !== "object") {
      return NextResponse.json({ error: "Wallet data missing" }, { status: 400 })
    }

    type SanitizedWalletValue = string | Record<string, string>

    function isEvmAddress(str: string) {
      return /^0x[0-9a-fA-F]{40}$/.test(str.trim())
    }
    function normalizeIdentifier(id: string) {
      const v = (id ?? "").trim()
      if (!v) return ""
      return isEvmAddress(v) ? v.toLowerCase() : v
    }
    function* collectStringsDeep(input: unknown): Generator<string> {
      if (typeof input === "string") {
        const t = input.trim()
        if (t) yield t
        return
      }
      if (Array.isArray(input)) {
        for (const v of input) yield* collectStringsDeep(v)
        return
      }
      if (input && typeof input === "object") {
        for (const v of Object.values(input as Record<string, unknown>)) {
          yield* collectStringsDeep(v)
        }
      }
    }
    function sanitizeWalletValue(value: unknown): SanitizedWalletValue | null {
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (!trimmed) return null
        return isEvmAddress(trimmed) ? trimmed.toLowerCase() : trimmed
      }
      if (!value || typeof value !== "object") {
        return null
      }
      const result: Record<string, string> = {}
      for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
        if (typeof raw !== "string") continue
        const trimmed = raw.trim()
        if (!trimmed) continue
        result[key] = key === "evm" && isEvmAddress(trimmed) ? trimmed.toLowerCase() : trimmed
      }
      return Object.keys(result).length > 0 ? result : null
    }

    const sanitized: Record<string, SanitizedWalletValue> = {}
    for (const [key, value] of Object.entries(wallets as Record<string, unknown>)) {
      const next = sanitizeWalletValue(value)
      if (next) {
        sanitized[key] = next
      }
    }

    const attempted = new Set<string>()
    for (const value of Object.values(sanitized)) {
      for (const raw of collectStringsDeep(value)) {
        const normalized = normalizeIdentifier(raw)
        if (normalized) {
          attempted.add(normalized)
        }
      }
    }

    if (attempted.size > 0) {
      // Check canonical wallets table
      const allWallets = await prisma.wallet.findMany({ select: { address: true, userId: true } })
      const canonicalOwner = new Map<string, string>()
      for (const w of allWallets) {
        const norm = normalizeIdentifier(w.address)
        if (!norm) continue
        canonicalOwner.set(norm, w.userId)
      }

      // Check other users' profile wallets
      const others = await prisma.user.findMany({
        where: { NOT: { id: session.user.id }, profileWallets: { not: null } },
        select: { id: true, profileWallets: true },
      })
      const profileOwner = new Map<string, string>()
      for (const u of others) {
        for (const raw of collectStringsDeep(u.profileWallets)) {
          const norm = normalizeIdentifier(raw)
          if (!norm) continue
          if (!profileOwner.has(norm)) profileOwner.set(norm, u.id)
        }
      }

      const conflicts: string[] = []
      for (const id of attempted) {
        const ownerCanonical = canonicalOwner.get(id)
        if (ownerCanonical && ownerCanonical !== session.user.id) {
          conflicts.push(id)
          continue
        }
        const ownerProfile = profileOwner.get(id)
        if (ownerProfile && ownerProfile !== session.user.id) {
          conflicts.push(id)
        }
      }

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error:
              conflicts.length === 1
                ? `This wallet is already linked to another account: ${conflicts[0]}`
                : `These wallets are already linked to other accounts: ${conflicts.join(", ")}`,
            conflicts,
          },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.user.update({ where: { id: session.user.id }, data: { profileWallets: sanitized } })
    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name ?? (updated.email ?? "Pilot"),
        refCode: updated.refCode,
        referrals: [],
        points: 0,
        referralPoints: 0,
        feesGenerated: 0,
        referralFees: 0,
        wallets: sanitized,
        authBindings: [],
      },
    })
  } catch (error) {
    console.error("[users/wallets]", error)
    return NextResponse.json({ error: "Failed to save wallets" }, { status: 500 })
  }
}
