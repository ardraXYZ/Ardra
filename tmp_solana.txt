"use client"

import { PropsWithChildren, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"`r`nimport * as WalletAdapters from "@solana/wallet-adapter-wallets"

import "@solana/wallet-adapter-react-ui/styles.css"

export function SolanaProvider({ children }: PropsWithChildren) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com"

  const wallets = useMemo(() => { const base = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]; const maybe = (Ctor: any) => (typeof Ctor === "function" ? new Ctor() : null); const Backpack = (WalletAdapters as any).BackpackWalletAdapter; const Glow = (WalletAdapters as any).GlowWalletAdapter; const extra = [maybe(Backpack), maybe(Glow)].filter(Boolean) as any[]; return [...base, ...extra] }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}


