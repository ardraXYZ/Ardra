"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/bots", label: "Bots" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "#", label: "Docs" },
  { href: "#", label: "Roadmap" },
]

export function SiteHeader({ className }: { className?: string }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors",
        "border-b border-white/10 bg-black/50",
        "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/ArdraLogo.png"
              alt="Ardra"
              width={180}
              height={60}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1.5">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && (pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/"))

              if (item.href === "#") {
                return (
                  <span
                    key={item.label}
                    className="cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium text-white/40"
                  >
                    {item.label}
                  </span>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    "text-white/70 hover:text-white hover:bg-white/10",
                    isActive && "bg-white/15 text-white shadow-[0_0_12px_rgba(45,212,191,0.35)]"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2">
                  <span className="text-xs uppercase tracking-[0.35em] text-cyan-300">Pilot</span>
                  <span className="text-sm text-white/80">{user.name}</span>
                </div>
                <Button asChild variant="ghost" className="text-white/80 hover:text-white">
                  <Link href="/profile">Dashboard</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 text-black hover:from-cyan-300 hover:via-fuchsia-300 hover:to-emerald-300"
                  onClick={() => {
                    void logout()
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="text-white/75 hover:text-white">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 text-black hover:from-cyan-300 hover:via-fuchsia-300 hover:to-emerald-300"
                >
                  <Link href="/login">Launch App</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

