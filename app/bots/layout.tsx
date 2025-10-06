import { SiteHeader } from "@/components/site-header"
import type { ReactNode } from "react"

export default function BotsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-black text-white">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
