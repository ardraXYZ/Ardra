"use client"

import { PropsWithChildren, useMemo } from "react"
import { http, createConfig, WagmiProvider } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"

const chains = [mainnet, sepolia]

export function Web3Provider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])

  const config = useMemo(
    () =>
      createConfig({
        chains,
        connectors: [
          injected({
            target: "metaMask",
          }),
        ],
        transports: {
          [mainnet.id]: http(),
          [sepolia.id]: http(),
        },
        ssr: true,
      }),
    []
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({ accentColor: "#22d3ee", borderRadius: "large", overlayBlur: "small" })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
