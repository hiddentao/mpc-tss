import { bitLength, gcd, isProbablyPrime, modInv, modMultiply, modPow, randBetween } from "bigint-crypto-utils"

class PaillierPublicKey {
  n: bigint
  nSquared: bigint
  nPlusOne: bigint

  constructor(n: bigint) {
    this.n = n
    this.nSquared = n ** 2n
    this.nPlusOne = n + 1n
  }

  validateCiphertext(ciphertext: bigint): boolean {
    return (
      ciphertext > 0n &&
      ciphertext < this.nSquared &&
      gcd(ciphertext, this.nSquared) === 1n
    )
  }
}

class PaillierSecretKey {
  private p: bigint
  private q: bigint
  private phi: bigint
  private phiInv: bigint
  publicKey: PaillierPublicKey

  constructor(p: bigint, q: bigint) {
    this.p = p
    this.q = q
    const n = p * q
    this.phi = (p - 1n) * (q - 1n)
    this.phiInv = modInv(this.phi, n)
    this.publicKey = new PaillierPublicKey(n)
  }

  getP(): bigint {
    return this.p
  }

  getQ(): bigint {
    return this.q
  }

  getPhi(): bigint {
    return this.phi
  }

  decrypt(ciphertext: bigint): bigint {
    if (!this.publicKey.validateCiphertext(ciphertext)) {
      throw new Error("Invalid ciphertext.")
    }

    const n = this.publicKey.n
    const nSquared = this.publicKey.nSquared

    // Perform decryption using the private key.
    const m = (modPow(ciphertext, this.phi, nSquared) - 1n) / n
    return modMultiply([m, this.phiInv], n)
  }

  generatePedersen(): { parameters: any; lambda: bigint } {
    const s = randBetween(512n) // Replace with secure randomness.
    const t = randBetween(512n)
    const lambda = modPow(s, this.phi, this.publicKey.n)
    const parameters = { s, t } // Placeholder for actual Pedersen parameters.
    return { parameters, lambda }
  }

  static validatePrime(p: bigint, bitsWant: number): void {
    if (!p) throw new Error("Prime is nil")

    if (bitLength(p) !== bitsWant) {
      throw new Error(
        `Invalid prime size: expected ${bitsWant} bits, got ${bitLength(p)} bits.`,
      )
    }

    if ((p & 3n) !== 3n) {
      throw new Error("Prime is not equivalent to 3 (mod 4)")
    }

    const pMinus1Div2 = (p - 1n) / 2n
    if (!isProbablyPrime(pMinus1Div2)) {
      throw new Error("Prime is not a safe prime.")
    }
  }

  static async keyGen(
    bits: number,
  ): Promise<{ publicKey: PublicKey; secretKey: SecretKey }> {
    const p = await randomPrime(bits)
    const q = await randomPrime(bits)
    const secretKey = new SecretKey(p, q)
    return { publicKey: secretKey.publicKey, secretKey }
  }
}

// Example Usage
;(async () => {
  const bits = 512 // Key size in bits.
  const { publicKey, secretKey } = await SecretKey.keyGen(bits)

  console.log("Public Key (n):", publicKey.n)
  console.log("Private Key (p, q):", secretKey.getP(), secretKey.getQ())

  // Example ciphertext (random value less than nSquared).
  const exampleCiphertext = 1234567890123456789n
  const plaintext = secretKey.decrypt(exampleCiphertext)

  console.log("Decrypted Plaintext:", plaintext)
})()
