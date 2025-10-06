import type { NextRequest } from "next/server"

export type NonceMetadata = {
  ip?: string | null
  userAgent?: string | null
}

type NonceRecord = {
  value: string
  expiresAt: number
  used: boolean
  meta?: NonceMetadata
}

declare global {
  // eslint-disable-next-line no-var
  var __SIWE_NONCE_STORE__: Map<string, NonceRecord> | undefined
}

function getStore() {
  if (!global.__SIWE_NONCE_STORE__) {
    global.__SIWE_NONCE_STORE__ = new Map()
  }
  const store = global.__SIWE_NONCE_STORE__
  // periodic cleanup
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (record.expiresAt < now || record.used) {
      store.delete(key)
    }
  }
  return store
}

export function addNonce(value: string, ttlMs: number, meta?: NonceMetadata) {
  const store = getStore()
  store.set(value, {
    value,
    expiresAt: Date.now() + ttlMs,
    used: false,
    meta,
  })
}

export function validateNonce(value: string) {
  const record = getStore().get(value)
  if (!record) return null
  if (record.used) return null
  if (record.expiresAt < Date.now()) {
    getStore().delete(value)
    return null
  }
  return record
}

export function markNonceUsed(value: string) {
  const store = getStore()
  const record = store.get(value)
  if (record) {
    record.used = true
    store.set(value, record)
  }
}

export function extractClientMeta(headers: Headers | NextRequest["headers"]) {
  const forwarded = headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : headers.get("x-real-ip")
  const userAgent = headers.get("user-agent")
  return { ip, userAgent }
}
