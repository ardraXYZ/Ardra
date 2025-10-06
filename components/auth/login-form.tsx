"use client"

import { useState, startTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PASSWORD_MIN_LENGTH = 8

type LoginFormProps = {
  referralCode?: string
  onReferralCodeChange?: (value: string) => void
  showReferralField?: boolean
}

export function LoginForm({
  referralCode = "",
  onReferralCodeChange,
  showReferralField = true,
}: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedName = displayName.trim()

    if (!trimmedEmail) {
      setError("Please enter an email address")
      return
    }

    if (!trimmedPassword) {
      setError("Please enter your password")
      return
    }

    if (trimmedPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await signIn("credentials-email", {
        redirect: false,
        email: trimmedEmail,
        password: trimmedPassword,
        username: trimmedName || undefined,
      })
      if (res?.error) {
        throw new Error(res.error)
      }
      startTransition(() => {
        router.push("/profile")
      })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
          className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
        <p className="text-xs text-white/40">
          We only store a hashed version of your password. Use at least {PASSWORD_MIN_LENGTH} characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-white/80">
          Display name (for new accounts)
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="VoltageTrader"
          className="bg-white/10 border-white/15 text-white placeholder:text-white/30"
        />
        <p className="text-xs text-white/40">
          If this is your first time, we will use this name for your profile. You can update it later from your profile
          page.
        </p>
      </div>

      {showReferralField ? (
        <div className="space-y-2">
          <Label htmlFor="referralCode" className="text-white/80">
            Referral code (optional)
          </Label>
          <Input
            id="referralCode"
            value={referralCode}
            onChange={(event) => onReferralCodeChange?.(event.target.value.toUpperCase())}
            placeholder="INVITE123"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 uppercase"
          />
          <p className="text-xs text-white/40">
            Have a friend already inside Ardra? Drop their code to route them 10% of referral fees.
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button
        type="submit"
        className="w-full h-11 bg-cyan-500 text-black hover:bg-cyan-400"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in with email"}
      </Button>

      <p className="text-xs text-white/40 text-center">
        Need to link a different method later? Visit your profile after signing in to manage wallets and credentials.
        Continue exploring the
        <Link href="/leaderboard" className="text-cyan-300 hover:underline ml-1">
          leaderboard
        </Link>
        whenever you like.
      </p>
    </form>
  )
}
