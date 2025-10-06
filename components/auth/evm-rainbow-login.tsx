"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useSignMessage } from "wagmi"
import { signIn } from "next-auth/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAuth } from "@/components/providers/auth-provider"

export function EvmRainbowLogin() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()
  const { refresh } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    if (!address || !isConnected) return
    setError(null)
    setLoading(true)
    try {
      const nonceRes = await fetch("/api/siwe/nonce")
      if (!nonceRes.ok) throw new Error("Failed to get nonce")
      const nonce = await nonceRes.text()
      const domain = window.location.host
      const issuedAt = new Date().toISOString()
      const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Ardra\n\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`

      const signature = await signMessageAsync({ message })

      const res = await signIn("credentials-evm", {
        redirect: false,
        address,
        message,
        signature,
        nonce,
        chainId: 1,
      })
      if (res?.error) throw new Error(res.error)
      // Ensure session cookie is visible to the app before navigating
      await refresh()
      router.push("/profile")
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <ConnectButton />
      <button
        type="button"
        onClick={handleSignIn}
        disabled={!isConnected || loading}
        className="h-11 w-full rounded-md bg-cyan-500 text-black disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in with connected wallet"}
      </button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}
