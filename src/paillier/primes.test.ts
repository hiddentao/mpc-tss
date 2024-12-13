import { describe, expect, test } from "bun:test"
import { bitLength } from "bigint-crypto-utils"
import { BITS_BLUM_PRIME } from "../constants"
import { PaillierPrimes, initializePrimes } from "./primes"

describe("PaillierPrimes", () => {
  test("should initialize primes", async () => {
    await initializePrimes()
  })

  test("should generate valid Blum primes", async () => {
    await initializePrimes()
    const primes = await PaillierPrimes.generate()
    
    expect(primes.p % 4n).toBe(3n)
    expect(primes.q % 4n).toBe(3n)
    
    expect(bitLength(primes.p)).toBeLessThanOrEqual(BITS_BLUM_PRIME)
    expect(bitLength(primes.q)).toBeLessThanOrEqual(BITS_BLUM_PRIME)
    
    expect(primes.p).not.toBe(primes.q)

    console.log(primes)
  }, { timeout: 60000 })
})
