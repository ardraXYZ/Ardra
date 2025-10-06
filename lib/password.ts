import crypto from "node:crypto"

const KEY_LENGTH = 64
const SCRYPT_PARAMS: crypto.ScryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
}

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: crypto.ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }
      resolve(derivedKey as Buffer)
    })
  })
}

export async function hashPassword(password: string) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string")
  }

  const salt = crypto.randomBytes(16)
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_PARAMS)) as Buffer
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string) {
  if (!storedHash || typeof storedHash !== "string") {
    return false
  }

  const [saltHex, hashHex] = storedHash.split(":")
  if (!saltHex || !hashHex) {
    return false
  }

  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const derived = (await scryptAsync(password, salt, expected.length, SCRYPT_PARAMS)) as Buffer

  if (derived.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(derived, expected)
}
