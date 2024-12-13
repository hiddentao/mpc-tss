import { describe, expect, test } from "bun:test"
import { randBetween } from "bigint-crypto-utils"
import { PaillierSecretKey } from "./paillier"

describe("paillier", async () => {
  test("round-trip encryption/decryption", async () => {
    const sk = await PaillierSecretKey.generate()
    const pk = sk.publicKey
    
    const bitLengths = [8, 16, 32, 64, 128, 256, 512, 768, 896, 1024]
    
    for (const bits of bitLengths) {
      const message = randBetween(2n ** BigInt(bits - 1))
      const { ciphertext } = pk.encrypt(message)
      
      expect(pk.isValidCiphertext(ciphertext)).toBe(true)
      
      const decrypted = sk.decrypt(ciphertext)
      expect(decrypted).toBe(message)
    }
  }, { timeout: 60000 })
})