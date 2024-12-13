import { bitLength, isProbablyPrime } from "bigint-crypto-utils"
import { CustomError } from "ts-custom-error"
import { bytesToBigInt } from "../bytes"
import { BITS_BLUM_PRIME } from "../constants"
import { RandomBytes } from "../rand"

// Generate an array containing all the odd prime numbers < below
const generatePrimes = async (below: number): Promise<bigint[]> => {
  const sieve = new Array(below).fill(true)

  for (let p = 2; p * p < below; p++) {
    if (sieve[p]) {
      for (let i = p * 2; i < below; i += p) {
        sieve[i] = false
      }
    }
  }

  const primes: bigint[] = []
  for (let p = 3; p < below; p++) {
    if (sieve[p]) {
      primes.push(BigInt(p))
    }
  }
  return primes
}

const PRIMES_BOUND = 1 << 20 // 1,048,576
export let PRIMES: bigint[] = []
const BLUM_SIEVE_SIZE = 1 << 18 // 262,144
const BLUM_PRIMALITY_ITERATIONS = 20

export const initializePrimes = async () => {
  if (!PRIMES.length) {
    PRIMES = await generatePrimes(PRIMES_BOUND)
    Object.freeze(PRIMES)
  }
}

const tryAndSampleBlumPrime = async (): Promise<bigint | null> => {
  await initializePrimes()

  const bytes = RandomBytes.getBytes((BITS_BLUM_PRIME + 7) / 8)
  bytes[bytes.length - 1] |= 3 // Clear low bits to ensure 3 mod 4
  bytes[0] |= 0xc0 // Ensure the top two bits are set
  const base = bytesToBigInt(bytes)

  const sieve = new Array(BLUM_SIEVE_SIZE).fill(true)
  for (let i = 1; i + 2 < sieve.length; i += 4) {
    sieve[i] = false
    sieve[i + 1] = false
    sieve[i + 2] = false
  }

  for (const prime of PRIMES) {
    const remainder = base % prime
    const primeInt = Number(prime)
    const firstMultiple = remainder === 0n ? 0 : primeInt - Number(remainder)
    for (let i = firstMultiple; i + 1 < sieve.length; i += primeInt) {
      sieve[i] = false
      sieve[i + 1] = false
    }
  }

  for (let delta = 0; delta < sieve.length; delta++) {
    if (!sieve[delta]) continue

    const p = base + BigInt(delta)
    if (bitLength(p) > BITS_BLUM_PRIME) return null

    const q = p >> 1n
    if (
      (await isProbablyPrime(q, BLUM_PRIMALITY_ITERATIONS)) &&
      (await isProbablyPrime(p, 1))
    ) {
      return p
    }
  }
  return null
}


export const sampleBlumPrime = async (): Promise<bigint> => {
  let result: bigint | null = null
  while (result === null) {
    result = await tryAndSampleBlumPrime()
  }
  return result
}



export class InvalidPrimeBitsError extends CustomError {
  constructor(actual: number, expected: number) {
    super(`Invalid prime bits: ${actual} !== ${expected}`)
  }
}

export class InvalidPrimeMod4Error extends CustomError {
  constructor(p: bigint) {
    super(`Invalid prime mod 4: ${p} % 4 !== 3`)
  }
}

export class InvalidPrimeFactorError extends CustomError {
  constructor(p: bigint) {
    super(`Invalid prime factor: ${p} is not prime`)
  }
}

export const validateBlumPrime = async (p: bigint): Promise<void> => {
  const primeBitLength = bitLength(p)
  if (primeBitLength !== BITS_BLUM_PRIME) {
    throw new InvalidPrimeBitsError(primeBitLength, BITS_BLUM_PRIME)
  }
  if (p % 4n !== 3n) {
    throw new InvalidPrimeMod4Error(p)
  }
  const pMinus1div2 = (p - 1n) / 2n
  const isPrime = await isProbablyPrime(pMinus1div2, 1)
  if (!isPrime) {
    throw new InvalidPrimeFactorError(pMinus1div2)
  }
}

export const isValidBlumPrime = async (p: bigint): Promise<boolean> => {
  try {
    await validateBlumPrime(p)
    return true
  } catch (_) {
    return false
  }
}