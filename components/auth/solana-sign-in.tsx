"use client"

import { useState } from "react"
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
  const [error, setError] = useState<string | null>(null)

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
      let signatureBytes: Uint8Array
      try {
        signatureBytes = await signMessage(messageBytes)
      } catch (walletError) {
        const msgSign = walletError instanceof Error ? walletError.message : String(walletError || "")
        const lowerMsgSign = msgSign.toLowerCase()
        if (
          lowerMsgSign.includes("plugin closed") ||
          lowerMsgSign.includes("window closed") ||
          lowerMsgSign.includes("popup closed") ||
          lowerMsgSign.includes("user reject") ||
          lowerMsgSign.includes("cancelled")
        ) {
          setError("Signature cancelled in the wallet. Reopen the wallet and try again.")
          return
        }
        throw walletError
      }
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
      if (lower.includes("plugin closed")) {
        setError("Signature cancelled in the wallet. Reopen the wallet and try again.")
      } else if (lower.includes("denied") || lower.includes("rejected")) {
        setError("Signature rejected in the wallet. Try again.")
      } else if (lower.includes("window closed") || lower.includes("popup")) {
        setError("The wallet window was closed before signing.")
      } else {
        setError(msg || "Could not authenticate with the Solana wallet.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (loading) return
            setError(null)
            openModal(true)
          }}
          className="h-11 flex-1 justify-center border-white/25 text-white hover:border-cyan-400 hover:bg-white/10"
        >
          {connected ? "Switch Solana wallet" : "Connect Solana wallet"}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSign()}
          disabled={!connected || loading}
          className="h-11 flex-1 justify-center bg-cyan-500 text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing..." : "Sign message"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}
