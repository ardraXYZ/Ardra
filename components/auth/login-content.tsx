"use client"

import { useEffect, useState } from "react"

import { SolanaSignIn } from "@/components/auth/solana-sign-in"
import { readStoredReferral, writeStoredReferral } from "@/components/providers/referral-capture"
import { Input } from "@/components/ui/input"

type LoginContentProps = {
  initialReferral?: string | null
}

export function LoginContent({ initialReferral }: LoginContentProps) {
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

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Referral (optional)</p>
        <Input
          value={referralCode}
          onChange={(event) => handleReferralChange(event.target.value)}
          placeholder="INVITE123"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 uppercase"
        />
        <p className="text-xs text-white/40">
          Apply a referral once and it will be used for every login method below.
        </p>
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
