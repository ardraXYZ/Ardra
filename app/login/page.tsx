import { LoginContent } from "@/components/auth/login-content"

type LoginSearchParams = Record<string, string | string[] | undefined>

type LoginPageProps = {
  searchParams: Promise<LoginSearchParams>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams
  const referral = typeof resolvedParams?.ref === "string" ? resolvedParams.ref : undefined

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-24">
        <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur">
          <div className="absolute -inset-12 -z-10 rounded-[3rem] bg-gradient-to-r from-cyan-500/20 via-fuchsia-400/15 to-emerald-400/20 blur-3xl" />
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Ardra access</p>
              <h1 className="text-3xl font-semibold text-white">Sign in with Solana</h1>
            </div>
            <LoginContent initialReferral={referral} />
          </div>
        </div>
      </div>
    </div>
  )
}

