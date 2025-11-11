import type { Metadata } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono, Orbitron } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ReferralCapture } from "@/components/providers/referral-capture"
import { Web3Provider } from "@/components/providers/web3-provider"
import { SolanaProvider } from "@/components/providers/solana-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ardra Hub",
  description: "Ardra is the futuristic hub for airdrop farming bots on Perp DEX.",
  icons: { icon: [{ url: "/favicon.ico" }], shortcut: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased bg-background text-foreground`}
      >
        <Script id="suppress-ext-runtime-error" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `(function(){
  function isTargetMsg(msg){
    try{
      if(!msg) return false;
      var s = String(msg);
      return s.includes('chrome.runtime.sendMessage') && (s.includes('must specify an Extension ID') || s.includes('called from a webpage'));
    }catch(_){return false}
  }
  window.addEventListener('error', function(e){
    if(isTargetMsg(e && e.message)){ e.preventDefault && e.preventDefault(); return true; }
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    var r = e && e.reason; var m = (r && (r.message || String(r))) || '';
    if(isTargetMsg(m)){ e.preventDefault && e.preventDefault(); return true; }
  }, true);
})();` }} />


        <Web3Provider>
          <SolanaProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <ReferralCapture />
              </Suspense>
              {children}
            </AuthProvider>
          </SolanaProvider>
        </Web3Provider>
      </body>
    </html>
  )
}










