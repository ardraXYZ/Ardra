"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import bs58 from "bs58"
import { signIn } from "next-auth/react"
import { Check, Loader2, PenLine, Plug } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit"
import { useAccount, useSignMessage } from "wagmi"
import type { Connector } from "wagmi"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

type Eip1193RequestArgs = {
  method: string
  params?: unknown[]
}

type Eip1193Provider = {
  request: (args: Eip1193RequestArgs) => Promise<unknown>
  isMetaMask?: boolean
  isRabby?: boolean
  providers?: Eip1193Provider[]
}

type EthereumWindow = {
  ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] }
}

type WalletAvailability = Record<string, boolean>

type EvmStage = "idle" | "connecting" | "awaitingSignature" | "signing" | "completed"

type StepState = "pending" | "active" | "done"

type StepMeta = {
  key: "connect" | "sign"
  title: string
  description: string
  state: StepState
}

type WalletSignInProps = {
  referralCode?: string | null
}

function toBase58(pubkey: Parameters<typeof bs58.encode>[0] | { toBase58?: () => string } | string | null | undefined) {
  if (!pubkey) return null
  if (typeof pubkey === "string") return pubkey
  if (typeof (pubkey as any).toBase58 === "function") return (pubkey as any).toBase58()
  return null
}

function getEvmProviders(): Eip1193Provider[] {
  if (typeof window === "undefined") return []
  const ethereum = (window as unknown as EthereumWindow).ethereum
  if (!ethereum) return []
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers
  }
  return [ethereum]
}

function resolveEvmProvider(target: string): Eip1193Provider | null {
  const providers = getEvmProviders()
  if (!providers.length) return null

  const normalizedTarget = target?.toLowerCase?.() ?? "default"

  const matcher = (provider: Eip1193Provider) => {
    if (normalizedTarget === "metamask") return !!provider?.isMetaMask
    if (normalizedTarget === "rabby") return !!provider?.isRabby
    return true
  }

  const matched = providers.find(matcher)
  if (matched) return matched
  return normalizedTarget === "default" ? providers[0] : null
}

function resolveSolanaProvider(target: string): SolanaAdapter | null {
  if (typeof window === "undefined") return null
  const anyWindow = window as unknown as SolanaWindow
  const base = anyWindow.solana
  if (target === "phantom") {
    if (anyWindow.phantom?.solana?.isPhantom) return anyWindow.phantom.solana
    if (base?.isPhantom) return base
  }
  if (target === "backpack") {
    if (anyWindow.backpack?.isBackpack) return anyWindow.backpack
    if (base?.isBackpack) return base
  }
  if (target === "solflare") {
    if (anyWindow.solflare?.isSolflare) return anyWindow.solflare
    if (base?.isSolflare) return base
  }
  return null
}

function buildLoginMessage(address: string) {
  const timestamp = new Date().toISOString()
  return `Ardra Login\nAddress: ${address}\nTimestamp: ${timestamp}`
}

export function WalletSignIn({ referralCode }: WalletSignInProps) {
  const router = useRouter()
  const { refresh } = useAuth()
  const { address: connectedEvmAddress, isConnected: evmConnected, connector: activeConnector } = useAccount()
  const { connected: solConnected, publicKey: solPublicKey, signMessage, connect } = useWallet()
  const { setVisible: openSolanaModal } = useWalletModal()
  const { openConnectModal: openConnectModalHook } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const [availability, setAvailability] = useState<WalletAvailability>({})

  const { signMessageAsync } = useSignMessage()
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [evmStage, setEvmStage] = useState<EvmStage>("idle")

  const [evmAddress, setEvmAddress] = useState<string | null>(null)

  const [pendingSolSign, setPendingSolSign] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const next: WalletAvailability = {
      metamask: !!resolveEvmProvider("metamask"),
      rabby: !!resolveEvmProvider("rabby"),
      evm: !!resolveEvmProvider("default"),
    }
    setAvailability(next)
  }, [])

  useEffect(() => {
    if (pendingSolSign && solConnected) {
      void handleSolanaSign()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSolSign, solConnected])

  useEffect(() => {
    if (evmConnected && connectedEvmAddress) {
      const normalized = connectedEvmAddress.toLowerCase()
      setEvmAddress(normalized)
      setEvmStage((stage) => {
        if (stage === "completed" || stage === "signing") return stage
        return "awaitingSignature"
      })
    }
    if (!evmConnected) {
      setEvmAddress(null)
      setEvmStage((stage) => (stage === "completed" ? stage : "idle"))
    }
  }, [evmConnected, connectedEvmAddress])

  const anyWalletAvailable = useMemo(() => Object.values(availability).some(Boolean), [availability])

  const shortEvmAddress = useMemo(() => {
    if (!evmAddress) return null
    return `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
  }, [evmAddress])

  const evmStatus = useMemo(() => {
    const connectDone = evmStage === "awaitingSignature" || evmStage === "signing" || evmStage === "completed"
    const connectState: StepState = connectDone ? "done" : "active"

    let signState: StepState
    if (evmStage === "completed") {
      signState = "done"
    } else if (evmStage === "awaitingSignature" || evmStage === "signing") {
      signState = "active"
    } else {
      signState = "pending"
    }

    const stageLabelMap: Record<EvmStage, string> = {
      idle: "Waiting to connect",
      connecting: "Connecting wallet",
      awaitingSignature: "Ready to sign",
      signing: "Awaiting signature",
      completed: "Signed in",
    }

    const connectDescription =
      connectState === "done" && shortEvmAddress
        ? `Connected as ${shortEvmAddress}`
        : evmStage === "connecting"
          ? "Confirm the connection in your wallet."
          : "Select MetaMask or another EVM wallet."

    const signDescription =
      signState === "done"
        ? "Signature accepted. Redirecting..."
        : evmStage === "signing"
          ? "Waiting for the wallet to finish signing."
          : evmStage === "awaitingSignature"
            ? "Approve the login request in your wallet."
            : "This step unlocks after the wallet connects."

    return {
      stageLabel: stageLabelMap[evmStage],
      steps: [
        { key: "connect", title: "Connect wallet", description: connectDescription, state: connectState },
        { key: "sign", title: "Sign message", description: signDescription, state: signState },
      ] as StepMeta[],
    }
  }, [evmStage, shortEvmAddress])

  const availabilityKnown = Object.keys(availability).length > 0
  const isEvmLoading = loadingWallet === "evm-sign" || loadingWallet === "metamask" || loadingWallet === "rabby"
  const evmSpinner = isEvmLoading || evmStage === "signing"
  const evmButtonLabel = (() => {
    if (evmStage === "completed") return "Wallet signed"
    if (evmSpinner) return "Awaiting signature..."
    if (evmStage === "awaitingSignature") return "Sign login request"
    if (evmStage === "connecting") return "Connecting..."
    if (!availabilityKnown) return "Detecting wallets..."
    if (!anyWalletAvailable) return "No EVM wallet detected"
    return "Connect EVM Wallet"
  })()

  const evmButtonClasses =
    evmStage === "completed"
      ? "bg-emerald-500 text-black hover:bg-emerald-400"
      : !availabilityKnown || anyWalletAvailable
        ? "bg-cyan-500 text-black hover:bg-cyan-400"
        : "bg-white/10 text-white hover:bg-white/20"

  async function handleEvm(walletId: string, connector?: Connector) {
    if (loadingWallet) return
    const normalizedWalletId = walletId?.toLowerCase?.() ?? "default"
    const tag = normalizedWalletId === "default" ? "evm-sign" : normalizedWalletId
    setLoadingWallet(tag)
    setError(null)

    setEvmStage((stage) => {
      if (stage === "completed" || stage === "signing" || stage === "awaitingSignature") return stage
      return "connecting"
    })

    try {
      let provider: Eip1193Provider | null = null
      if (connector?.getProvider) {
        try {
          provider = (await connector.getProvider()) as Eip1193Provider | null
        } catch (err) {
          console.warn('[WalletSignIn][EVM] connector.getProvider failed', err)
        }
      }
      if (!provider) {
        provider = resolveEvmProvider(normalizedWalletId) ?? resolveEvmProvider("default")
      }
      if (!provider) {
        setEvmStage("idle")
        throw new Error("No EVM wallet detected in this browser.")
      }

      const accountsResult = await provider.request({ method: "eth_requestAccounts" })
      const accounts = Array.isArray(accountsResult) ? accountsResult : []
      const rawAddress = typeof accounts[0] === "string" ? accounts[0] : undefined
      const address = rawAddress?.toLowerCase()
      if (!address) {
        setEvmStage(evmConnected ? "awaitingSignature" : "idle")
        throw new Error("Could not read the wallet address.")
      }

      setEvmAddress(address)
      setEvmStage((stage) => (stage === "completed" ? stage : "awaitingSignature"))

      const nonceRes = await fetch("/api/siwe/nonce")
      const nonce = await nonceRes.text()
      const domain = window.location.host
      const issuedAt = new Date().toISOString()
      const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Ardra\n\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`
      setEvmStage("signing")
      const signatureResult = await provider.request({ method: "personal_sign", params: [message, address] })
      if (typeof signatureResult !== "string") {
        setEvmStage(evmConnected ? "awaitingSignature" : "idle")
        throw new Error("The wallet did not return a valid signature.")
      }
      const signature = signatureResult

      const normalizedReferral = referralCode?.trim().toUpperCase() || undefined

      const res = await signIn("credentials-evm", {
        redirect: false,
        address,
        message,
        signature,
        nonce,
        chainId: 1,
      })
      if (res?.error) throw new Error(res.error)
      setEvmStage("completed")
      await refresh()
      router.push("/profile")
    } catch (err: unknown) {
      const code = typeof err === "object" && err !== null && "code" in err ? (err as { code?: number }).code : undefined
      const rawMessage = err instanceof Error ? err.message : String(err || "")
      const msg = rawMessage.toLowerCase()
      if (code === 4001 || msg.includes("denied") || msg.includes("rejected")) {
        setError("The request was rejected in the wallet.")
      } else if (code === -32002 || msg.includes("request already pending")) {
        setError("A signature request is already pending in your wallet. Open the extension and approve or reject it.")
      } else if (rawMessage.includes("Failed to connect to MetaMask")) {
        setError("MetaMask could not initialize. Make sure the extension is allowed to run on this site, then try again.")
      } else if (msg.includes("chrome.runtime.sendmessage") || msg.includes("extensionid")) {
        setError("The browser blocked the wallet extension. In Chrome, enable site access for the extension and reload.")
      } else {
        setError(err instanceof Error ? err.message : "Could not authenticate with the EVM wallet.")
      }
      setEvmStage((stage) => {
        if (stage === "completed") return stage
        return evmConnected ? "awaitingSignature" : "idle"
      })
      console.warn("[WalletSignIn][EVM]", err)
    } finally {
      setLoadingWallet(null)
      if (!evmConnected) {
        setEvmAddress(null)
        setEvmStage((stage) => (stage === "completed" ? stage : "idle"))
      }
    }
  }

  async function handleSolanaClick() {
    if (loadingWallet) return
    setError(null)
    if (!solConnected) {
      openSolanaModal(true)
      setPendingSolSign(true)
      return
    }
    await handleSolanaSign()
  }

  async function handleSolanaSign() {
    setLoadingWallet("solana")
    try {
      const address = toBase58(solPublicKey)
      if (!address) throw new Error("Could not read the Solana wallet address.")
      if (typeof signMessage !== "function") throw new Error("This wallet cannot sign messages.")

      const nonceRes = await fetch("/api/siwe/nonce")
      const nonce = await nonceRes.text()
      const domain = window.location.host
      const issuedAt = new Date().toISOString()
      const message = `Sign-In with Solana\nDomain: ${domain}\nAddress: ${address}\nStatement: Sign in to Ardra\nURI: ${window.location.origin}\nNonce: ${nonce}\nIssued At: ${issuedAt}`
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)

      const res = await signIn("credentials-solana", { redirect: false, address, signature, message, nonce })
      if (res?.error) throw new Error(res.error)
      await refresh()
      setPendingSolSign(false)
      router.push("/profile")
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err || "")
      const msg = raw.toLowerCase()
      if (msg.includes("plugin closed") || msg.includes("window closed") || msg.includes("popup closed")) {
        setError("The wallet window was closed before signing. Please try again and approve in the wallet.")
      } else if (msg.includes("denied") || msg.includes("rejected")) {
        setError("The request was rejected in the wallet.")
      } else {
        setError(raw || "Could not authenticate with the Solana wallet.")
      }
      setPendingSolSign(false)
      console.warn("[WalletSignIn][Solana]", err)
    } finally {
      setLoadingWallet(null)
      if (!evmConnected) {
        setEvmAddress(null)
        setEvmStage((stage) => (stage === "completed" ? stage : "idle"))
      }
    }
  }

  function renderEvmConnect() {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, account }) => (
          <Button
            type="button"
            onClick={() => {
              if (account) {
                const connectorId = account.connector?.id?.toLowerCase?.()
                const target = connectorId && connectorId.length ? connectorId : "default"
                void handleEvm(target, account.connector ?? undefined)
              } else {
                setEvmStage((stage) => (stage === "signing" || stage === "completed" ? stage : "connecting"))
                openConnectModal?.()
              }
            }}
            className={`h-11 w-full justify-center ${evmButtonClasses} disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={evmSpinner}
          >
            {evmSpinner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {evmButtonLabel}
          </Button>
        )}
      </ConnectButton.Custom>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Button
          type="button"
          onClick={() => void handleSolanaClick()}
          className="h-11 w-full justify-center bg-cyan-500 text-black hover:bg-cyan-400"
        >
          {loadingWallet === "solana" ? "Signing..." : "Connect Solana Wallet"}
        </Button>
        {renderEvmConnect()}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/40">
          <span>EVM Login Flow</span>
          <span className="tracking-normal text-white/60">{evmStatus.stageLabel}</span>
          {evmStage === "awaitingSignature" || evmStage === "signing" ? (
            <button
              type="button"
              onClick={() => openAccountModal?.()}
              className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] tracking-[0.2em] text-white/60 hover:bg-white/10"
            >
              Change wallet
            </button>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {evmStatus.steps.map((step) => {
            const isDone = step.state === "done"
            const isActive = step.state === "active"
            const iconClasses = isDone
              ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
              : isActive
                ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                : "border-white/10 bg-white/5 text-white/40"
            const statusLabel = isDone ? "Done" : isActive ? "In progress" : "Waiting"
            const statusIcon = isDone ? (
              <Check className="h-4 w-4 text-emerald-300" />
            ) : isActive ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white/40" />
            )
            const leadingIcon = step.key === "connect" ? <Plug className="h-4 w-4" /> : <PenLine className="h-4 w-4" />

            return (
              <div
                key={step.key}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${iconClasses}`}>
                  {leadingIcon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="font-medium">{step.title}</span>
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      {statusIcon}
                      <span>{statusLabel}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error ? (
        <div className="space-y-2">
          <p className="text-sm text-red-400">{error}</p>
          {solConnected ? (
            <Button
              type="button"
              onClick={() => void handleSolanaSign()}
              className="h-10 w-full justify-center bg-white/10 text-white hover:bg-white/20"
            >
              Try sign again
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}





