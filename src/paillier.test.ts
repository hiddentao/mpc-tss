import { describe, expect, test } from "bun:test"
import { modPow, randBetween } from "bigint-crypto-utils"
import { PaillierSecretKey, isValidPaillierModulus, validatePaillierModulus } from "./paillier"

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

  test("pedersen parameters generation", async () => {
    const sk = await PaillierSecretKey.generate()
    const params = sk.samplePedersenParams()
    
    expect(params.n).toBe(sk.publicKey.n)
    expect(params.s).toBeDefined()
    expect(params.t).toBeDefined()
    expect(params.lambda).toBeDefined()
    
    // Verify that s = t^lambda mod n
    const computedS = modPow(params.t, params.lambda, params.n)
    expect(computedS).toBe(params.s)
  }, { timeout: 60000 })

  test("validate paillier modulus", async () => {
    const sk = await PaillierSecretKey.generate()
    const validN = sk.publicKey.n

    // Valid modulus should pass validation
    await expect(validatePaillierModulus(validN)).resolves.toBeUndefined()
    await expect(isValidPaillierModulus(validN)).resolves.toBe(true)

    // Invalid cases
    await expect(validatePaillierModulus(0n)).rejects.toThrow("modulus N is nil")
    await expect(isValidPaillierModulus(0n)).resolves.toBe(false)

    await expect(validatePaillierModulus(2n)).rejects.toThrow("wrong number bit length")
    await expect(isValidPaillierModulus(2n)).resolves.toBe(false)

    await expect(validatePaillierModulus(2n ** 2048n)).rejects.toThrow("even")
    await expect(isValidPaillierModulus(2n ** 2048n)).resolves.toBe(false)
  }, { timeout: 60000 })
})