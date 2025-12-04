"use client"

import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

type LoginPromptProps = {
    title?: string
    message?: string
    cta?: string
    redirect?: string
}

export function LoginPrompt({
    title = "Sign in required",
    message = "Log in to Ardra to unlock this feature. We use the same session across bots, monitor, and future tools.",
    cta = "Sign in",
    redirect = "/login",
}: LoginPromptProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 sm:px-8 sm:py-12 shadow-[0_24px_120px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_bottom,_rgba(147,51,234,0.12),transparent_55%)]" />
            <div className="relative flex flex-col items-start gap-4 text-white">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                    <Lock className="h-4 w-4 text-cyan-300" />
                    Secure Access
                </span>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-sm text-white/70">{message}</p>
                <Button
                    asChild
                    className="mt-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-black hover:from-cyan-300 hover:via-sky-300 hover:to-emerald-300"
                >
                    <Link href={redirect}>
                        {cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
