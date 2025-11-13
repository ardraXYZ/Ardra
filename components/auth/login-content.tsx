"use client"

import { useEffect, useState } from "react"

import { SolanaSignIn } from "@/components/auth/solana-sign-in"
import { readStoredReferral, writeStoredReferral } from "@/components/providers/referral-capture"
import { Input } from "@/components/ui/input"

type AccessInfo = {
  phase: "legacy" | "initial-code" | "invite-only" | "open"
  totalUsers: number
  nextThreshold: number | null
  remainingUntilNext: number | null
}

type LoginContentProps = {
  initialReferral?: string | null
  accessInfo: AccessInfo
}

export function LoginContent({ initialReferral, accessInfo }: LoginContentProps) {
  const [referralCode, setReferralCode] = useState(() => initialReferral?.toUpperCase() ?? "")

  useEffect(() => {
    if (initialReferral) {
      const normalized = initialReferral.toUpperCase()
      setReferralCode(normalized)
      writeStoredReferral(normalized)
      return
    }
    const stored = readStoredReferral()
    if (stored) {
      setReferralCode(stored.toUpperCase())
    }
  }, [initialReferral])

  const handleReferralChange = (value: string) => {
    const normalized = value.toUpperCase()
    setReferralCode(normalized)
    writeStoredReferral(normalized || null)
  }

  const requiresExactCode = accessInfo.phase === "initial-code"
  const requiresInviteFromMember = accessInfo.phase === "invite-only"
  const codeRequired = requiresExactCode || requiresInviteFromMember
  const normalizedValue = referralCode.trim().toUpperCase()
  const codeNotice = (() => {
    if (!codeRequired || normalizedValue) return null
    return requiresExactCode
      ? "Enter the access code you received to unlock this cohort."
      : "Paste an invite from an existing member before creating a new account."
  })()
  const helperText = requiresExactCode
    ? "Access remains gated while we finish onboarding this batch."
    : requiresInviteFromMember
      ? "Invites remain mandatory until we reach 1,000 members."
      : "Add a referral once and it will be reused for every login."
  const progressionText =
    codeRequired && typeof accessInfo.remainingUntilNext === "number" && accessInfo.remainingUntilNext > 0
      ? `${accessInfo.remainingUntilNext} slots left before the next phase.`
      : null
  const labelText = requiresExactCode
    ? "Access code"
    : requiresInviteFromMember
      ? "Invite code"
      : "Referral / invite (optional)"
  const placeholder = requiresExactCode ? "ACCESSCODE" : "INVITE123"

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">{labelText}</p>
        <Input
          value={referralCode}
          onChange={(event) => handleReferralChange(event.target.value)}
          placeholder={placeholder}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 uppercase"
        />
        <div className="space-y-1">
          <p className="text-xs text-white/60">{helperText}</p>
          {progressionText ? <p className="text-xs text-white/40">{progressionText}</p> : null}
          {codeNotice ? <p className="text-xs text-amber-200">{codeNotice}</p> : null}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Connect your Solana wallet</h2>
          <p className="text-sm text-white/60">Sign in with Solana wallet.</p>
        </div>
        <SolanaSignIn referralCode={referralCode} />
      </section>
    </div>
  )
}
