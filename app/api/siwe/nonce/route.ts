import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { headers } from "next/headers"

import { addNonce, extractClientMeta } from "@/lib/siwe-store"

export async function GET() {
  try {
    const nonce = crypto.randomBytes(16).toString("hex")
    const requestHeaders = await headers()
    const meta = extractClientMeta(requestHeaders)
    const ttlMs = 5 * 60 * 1000
    addNonce(nonce, ttlMs, meta)
    return new NextResponse(nonce, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("[siwe/nonce]", error)
    return new NextResponse("", { status: 500 })
  }
}
