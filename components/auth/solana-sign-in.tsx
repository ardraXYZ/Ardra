"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import bs58 from "bs58"

import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

type Props = {
  referralCode?: string | null
}

export function SolanaSignIn({ referralCode }: Props) {
  const { connected, publicKey, signMessage } = useWallet()
  const { setVisible: openModal } = useWalletModal()
  const [loading, setLoading] = useState(false)
  const [pendingSign, setPendingSign] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pendingSign && connected && !loading) {
      void handleSign()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSign, connected])

  const handleClick = async () => {
    if (loading) return
    setError(null)

    if (!connected) {
      setPendingSign(true)
      openModal(true)
      return
    }

    await handleSign()
  }

  const handleSign = async () => {
    if (!connected) return

    setLoading(true)
    try {
      const address = publicKey?.toBase58()
      if (!address) throw new Error("Could not read the wallet address.")
      if (typeof signMessage !== "function") throw new Error("This wallet cannot sign messages.")

      const nonceRes = await fetch("/api/siwe/nonce")
      const nonce = await nonceRes.text()
      const domain = window.location.host
      const issuedAt = new Date().toISOString()
      const message = `Sign-In with Solana\nDomain: ${domain}\nAddress: ${address}\nStatement: Sign in to Ardra\nURI: ${window.location.origin}\nNonce: ${nonce}\nIssued At: ${issuedAt}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)

      const res = await signIn("credentials-solana", {
        redirect: false,
        address,
        signature,
        message,
        nonce,
      })

      if (res?.error) throw new Error(res.error)

      window.location.href = "/profile"
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err || "")
      const lower = msg.toLowerCase()
      if (lower.includes("denied") || lower.includes("rejected")) {
        setError("Signature rejected in the wallet. Try again.")
      } else if (lower.includes("window closed") || lower.includes("popup")) {
        setError("The wallet window was closed before signing.")
      } else {
        setError(msg || "Could not authenticate with the Solana wallet.")
      }
    } finally {
      setLoading(false)
      setPendingSign(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={() => void handleClick()}
        className="h-11 w-full justify-center bg-cyan-500 text-black hover:bg-cyan-400"
      >
        {loading ? "Signing..." : connected ? "Sign message" : "Connect Solana wallet"}
      </Button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}