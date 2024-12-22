import { abs, bitLength, gcd, modInv, modMultiply, modPow, randBetween } from "bigint-crypto-utils"
import { CustomError } from 'ts-custom-error'
import { BITS_PAILLIER } from "./constants"
import { isValidBlumPrime, modSymmetric, sampleBlumPrime, sampleUnitModN } from "./math"
import { SerializableObject } from "./object"
import { PedersenParams } from "./pedersen"

class InvalidCiphertextError extends CustomError {
  constructor(ciphertext: bigint) {
    super(`Invalid ciphertext: ${ciphertext.toString()}`)
  }
}

class InvalidPlaintextError extends CustomError {
  constructor(plaintext: bigint) {
    super(`Plaintext ${plaintext.toString()} must be in range [-(N-1)/2, ..., (N-1)/2]`)
  }
}

class PaillierInvalidModulusError extends CustomError {
  constructor(message: string) {
    super(message)
  }
}

export type PaillierEncryptionResult = {
  ciphertext: bigint
  nonce: bigint
}

export class PaillierPublicKey extends SerializableObject {
  public readonly n: bigint
  public readonly nSquared: bigint
  public readonly nPlusOne: bigint

  constructor({ n }: { n: bigint }) {
    super()
    this.n = n
    this.nSquared = n ** 2n
    this.nPlusOne = n + 1n
  }

  isValidCiphertext(ciphertext: bigint): boolean {
    return (
      ciphertext > 0n &&
      ciphertext < this.nSquared &&
      gcd(ciphertext, this.nSquared) === 1n
    )
  }

  encrypt(m: bigint): PaillierEncryptionResult {
    const nonce = sampleUnitModN(this.n)
    return this.encryptWithNonce(m, nonce)
  }

  encryptWithNonce(m: bigint, nonce: bigint): PaillierEncryptionResult {
    const mAbs = abs(m)
    const nHalf = this.n / 2n
    if (mAbs > nHalf) {
      throw new InvalidPlaintextError(m)
    }
    const c1 = modPow(this.nPlusOne, m, this.nSquared)
    const c2 = modPow(nonce, this.n, this.nSquared)
    const ct = modMultiply([c1, c2], this.nSquared)
    return { ciphertext: ct, nonce }
  }
}

export class PaillierSecretKey extends SerializableObject {
  private readonly _p: bigint
  private readonly _q: bigint
  private readonly _phi: bigint
  private readonly _phiInv: bigint
  public readonly publicKey: PaillierPublicKey

  constructor({ p, q }: { p: bigint; q: bigint }) {
    super()
    this._p = p
    this._q = q
    const n = p * q
    this._phi = (p - 1n) * (q - 1n)
    this._phiInv = modInv(this._phi, n)
    this.publicKey = new PaillierPublicKey({ n })
  }

  public static async generate(): Promise<PaillierSecretKey> {
    const [p, q] = await Promise.all([
      sampleBlumPrime(),
      sampleBlumPrime(),
    ])
    return new PaillierSecretKey({ p, q })
  }


  decrypt(ciphertext: bigint): bigint {
    if (!this.publicKey.isValidCiphertext(ciphertext)) {
      throw new InvalidCiphertextError(ciphertext)
    }

    const n = this.publicKey.n
    const nSquared = this.publicKey.nSquared

    // Perform decryption using the private key.
    const m1 = (modPow(ciphertext, this._phi, nSquared) - 1n) / n
    const m2 = modMultiply([m1, this._phiInv], n)
    return modSymmetric(m2, this.publicKey.n);
  }

  samplePedersenParams(): PedersenParams {
    const lambda = randBetween(this._phi);
    const tau = sampleUnitModN(this.publicKey.n);
    const t = modMultiply([tau, tau], this.publicKey.n);
    const s = modPow(t, lambda, this.publicKey.n);
    return new PedersenParams({ n: this.publicKey.n, s, t, lambda });
  }
}

export const isValidPaillierPrime = async (p: bigint): Promise<boolean> => {
  return await isValidBlumPrime(p)
}

export const validatePaillierModulus = async (n: bigint): Promise<void> => {
  if (!n) {
    throw new PaillierInvalidModulusError("modulus N is nil")
  }

  const bits = bitLength(n)
  if (bits !== BITS_PAILLIER) {
    throw new PaillierInvalidModulusError(`have: ${bits}, need ${BITS_PAILLIER}: wrong number bit length of Paillier modulus N`)
  }

  if (n % 2n === 0n) {
    throw new PaillierInvalidModulusError("modulus N is even")
  }
}

export const isValidPaillierModulus = async (n: bigint): Promise<boolean> => {
  try {
    await validatePaillierModulus(n)
    return true
  } catch (_) {
    return false
  }
}

// TODO: // Example Usage
// ;(async () => {
//   const bits = 512 // Key size in bits.
//   const { publicKey, secretKey } = await SecretKey.keyGen(bits)

//   console.log("Public Key (n):", publicKey.n)
//   console.log("Private Key (p, q):", secretKey.getP(), secretKey.getQ())

//   // Example ciphertext (random value less than nSquared).
//   const exampleCiphertext = 1234567890123456789n
//   const plaintext = secretKey.decrypt(exampleCiphertext)

//   console.log("Decrypted Plaintext:", plaintext)
// })()
