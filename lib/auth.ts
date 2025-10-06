import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { Adapter } from "next-auth/adapters"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { headers, cookies as nextCookies } from "next/headers"
import { verifyMessage } from "viem"
import bs58 from "bs58"
import nacl from "tweetnacl"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { validateNonce, markNonceUsed } from "@/lib/siwe-store"

function generateRefCode() {
  return crypto.randomUUID().slice(0, 8).replace(/-/g, "").toUpperCase()
}

async function ensureUserRefCode(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { refCode: true } })
  if (user?.refCode) return user.refCode
  const refCode = generateRefCode()
  await prisma.user.update({ where: { id: userId }, data: { refCode } })
  return refCode
}

async function attachReferralIfAny(userId: string) {
  const cookieStore = await nextCookies()
  const ref = cookieStore.get("ardra_ref")?.value?.trim()
  if (!ref) return
  const referrer = await prisma.user.findFirst({ where: { refCode: ref } })
  if (!referrer || referrer.id === userId) return
  const exists = await prisma.referral.findFirst({ where: { referredId: userId } })
  if (exists) return
  await prisma.referral.create({ data: { referrerId: referrer.id, referredId: userId } })
}

async function createLoginLog(userId: string | null, method: string, success: boolean) {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null
  const ua = h.get("user-agent") || null
  await prisma.loginLog.create({ data: { userId: userId ?? undefined, method, success, ip: ip ?? undefined, userAgent: ua ?? undefined } })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "credentials-evm",
      name: "EVM Wallet",
      credentials: {
        address: { label: "address", type: "text" },
        message: { label: "message", type: "text" },
        signature: { label: "signature", type: "text" },
        nonce: { label: "nonce", type: "text" },
        chainId: { label: "chainId", type: "number" },
      },
      async authorize(creds) {
        const address = (creds.address as string | undefined)?.toLowerCase()
        const message = (creds.message as string | undefined) ?? ""
        const signature = (creds.signature as string | undefined) ?? ""
        const nonce = (creds.nonce as string | undefined) ?? ""
        const chainId = Number((creds.chainId as string | number | undefined) ?? 1)
        if (!address || !message || !signature || !nonce) {
          console.warn("[auth][credentials-evm]", "missing fields", { hasAddress: !!address, hasMessage: !!message, hasSignature: !!signature, hasNonce: !!nonce })
          throw new Error("Missing fields for wallet login")
        }
        if (!/^0x[0-9a-f]{40}$/.test(address)) {
          console.warn("[auth][credentials-evm]", "invalid address format", { address })
          throw new Error("Invalid wallet address format")
        }
        if (!message.toLowerCase().includes(`chain id: ${chainId}`.toLowerCase())) {
          console.warn("[auth][credentials-evm]", "chain id mismatch", { chainId, message })
          throw new Error("Chain ID mismatch in signed message")
        }
        const nonceRecord = validateNonce(nonce)
        if (!nonceRecord) {
          console.warn("[auth][credentials-evm]", "nonce not found or expired", { nonce })
          throw new Error("Nonce expired or not found")
        }
        const valid = await verifyMessage({ address: address as `0x${string}`, message, signature: signature as `0x${string}` })
        if (!valid) {
          console.warn("[auth][credentials-evm]", "signature verification failed", { address })
          throw new Error("Signature verification failed")
        }
        markNonceUsed(nonce)
        let userId: string
        const wallet = await prisma.wallet.findUnique({ where: { address } })
        if (wallet) {
          userId = wallet.userId
        } else {
          const user = await prisma.user.create({ data: { name: `${address.slice(0, 10)}...`, refCode: generateRefCode() } })
          await prisma.wallet.create({ data: { userId: user.id, chain: "EVM", address, provider: "siwe" } })
          await attachReferralIfAny(user.id)
          userId = user.id
        }
        await createLoginLog(userId, "credentials-evm", true)
        await ensureUserRefCode(userId)
        const user = await prisma.user.findUnique({ where: { id: userId } })
        return user ? { id: user.id, name: user.name, email: user.email ?? undefined } : null
      },
    }),
    Credentials({
      id: "credentials-solana",
      name: "Solana Wallet",
      credentials: {
        address: { label: "address", type: "text" },
        message: { label: "message", type: "text" },
        signature: { label: "signature", type: "text" },
        nonce: { label: "nonce", type: "text" },
      },
      async authorize(creds) {
        const address = (creds.address as string | undefined) ?? ""
        const message = (creds.message as string | undefined) ?? ""
        const signatureB58 = (creds.signature as string | undefined) ?? ""
        const nonce = (creds.nonce as string | undefined) ?? ""
        if (!address || !message || !signatureB58 || !nonce) {
          console.warn("[auth][credentials-solana]", "missing fields", { hasAddress: !!address, hasMessage: !!message, hasSignature: !!signatureB58, hasNonce: !!nonce })
          throw new Error("Missing fields for wallet login")
        }
        const nonceRecord = validateNonce(nonce)
        if (!nonceRecord) {
          console.warn("[auth][credentials-solana]", "nonce not found or expired", { nonce })
          throw new Error("Nonce expired or not found")
        }
        let pkBytes: Uint8Array
        try {
          pkBytes = bs58.decode(address)
        } catch {
          console.warn("[auth][credentials-solana]", "invalid address encoding", { address })
          throw new Error("Invalid Solana address encoding")
        }
        const msgBytes = new TextEncoder().encode(message)
        let sigBytes: Uint8Array
        try {
          sigBytes = bs58.decode(signatureB58)
        } catch {
          console.warn("[auth][credentials-solana]", "invalid signature encoding", { address })
          throw new Error("Invalid Solana signature encoding")
        }
        const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pkBytes)
        if (!ok) {
          console.warn("[auth][credentials-solana]", "signature verification failed", { address })
          throw new Error("Signature verification failed")
        }
        markNonceUsed(nonce)
        let wallet = await prisma.wallet.findUnique({ where: { address } })
        let userId: string
        if (!wallet) {
          const user = await prisma.user.create({ data: { name: `${address.slice(0, 10)}...`, refCode: generateRefCode() } })
          await prisma.wallet.create({ data: { userId: user.id, chain: "SOLANA", address, provider: "siws" } })
          await attachReferralIfAny(user.id)
          userId = user.id
        } else {
          userId = wallet.userId
        }
        await createLoginLog(userId, "credentials-solana", true)
        await ensureUserRefCode(userId)
        const user = await prisma.user.findUnique({ where: { id: userId } })
        return user ? { id: user.id, name: user.name, email: user.email ?? undefined } : null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id
        token.name = (user as any).name
        token.email = (user as any).email
      }
      return token
    },
    async session({ session, token }) {
      if (token?.sub) {
        const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { id: true, name: true, email: true, refCode: true } })
        if (user) (session as any).user = { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined, refCode: user.refCode }
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        if ((user as any)?.id) {
          await ensureUserRefCode((user as any).id)
          if (account?.provider === "google") await attachReferralIfAny((user as any).id)
          await createLoginLog((user as any).id, account?.provider ?? "unknown", true)
        }
      } catch (e) {
        console.error("[nextauth signIn]", e)
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      try {
        await ensureUserRefCode((user as any).id)
        await attachReferralIfAny((user as any).id)
      } catch (e) {
        console.error("[nextauth createUser]", e)
      }
    },
  },
}

export function auth() {
  return getServerSession(authOptions)
}

export default authOptions
