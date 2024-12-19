import { bytesToNumberBE, equalBytes } from "@noble/curves/abstract/utils"
import { blake3 } from "@noble/hashes/blake3"
import { type Input, hexToBytes } from "@noble/hashes/utils"
import { CustomError } from "ts-custom-error"
import { SEC_BYTES } from "./constants.js"
import { type AffinePoint, type ProjectivePoint, isAffinePoint, isProjectivePoint } from "./curves"
import { bigIntToHex } from "./number.js"
import { RandomBytes } from "./rand.js"

class HasherUsedError extends CustomError {
  constructor() {
    super("Hasher already used")
  }
}

class HasherInvalidInputDataError extends CustomError {
  constructor(data: any) {
    super(`Hash input data type invalid: ${typeof data}`)
  }
}

class HasherBadCommitmentLengthError extends CustomError {
  constructor() {
    super(`Hasher commitment length is not equal to ${SEC_BYTES}`)
  }
}

class HasherZeroCommitmentError extends CustomError {
  constructor(type: string) {
    super(`Hasher ${type} is 0`)
  }
}

export interface HashableInputFactory {
  getHashableInputs(): HashableInput[]
}

export type HashableInput = Input | bigint | ProjectivePoint | AffinePoint | HashableInputFactory

export class Hasher {
  private readonly hash: ReturnType<typeof blake3.create>
  private used = false

  protected constructor(hash?: ReturnType<typeof blake3.create>) {
    this.hash = hash ?? blake3.create({})
  }

  public static create(): Hasher {
    return new Hasher()
  }

  private assertNotUsed() {
    if (this.used) {
      throw new HasherUsedError()
    }
  }

  public digestAsBytes(): Uint8Array {
    this.assertNotUsed()
    this.used = true
    return this.hash.digest()
  }

  public digestAsBigInt(): bigint {
    return bytesToNumberBE(this.digestAsBytes())
  }

  public digestIntoBuffer(buf: Uint8Array): void {
    this.assertNotUsed()
    this.used = true
    return this.hash.digestInto(buf)
  }

  public clone(): Hasher {
    return new Hasher(this.hash.clone())
  }

  protected _update(data: HashableInput): void {
    if (data instanceof Uint8Array || typeof data === "string") {
      this.hash.update(data)
    } else if (typeof data === "bigint") {
      this.hash.update(hexToBytes(bigIntToHex(data)))
    } else if (isProjectivePoint(data)) {
      this._update(data.toRawBytes())
    } else if (isAffinePoint(data)) {
      this._update(data.x)
      this._update(data.y)
    } else if (typeof data.getHashableInputs === "function") {
      for (const input of data.getHashableInputs()) {
        this._update(input)
      }
    } else {
      throw new HasherInvalidInputDataError(data)
    }
  }

  public update(data: HashableInput): Hasher {
    this.assertNotUsed()
    this._update(data)
    return this
  }

  public updateMulti(data: Array<HashableInput>): Hasher {
    this.assertNotUsed()
    for (let i = 0; i < data.length; i += 1) {
      this._update(data[i])
    }
    return this
  }

  public commit(data: HashableInput[]): {
    commitment: Uint8Array
    decommitment: Uint8Array
  } {
    const decommitment = RandomBytes.getBytes(SEC_BYTES)
    const h = this.clone()
    h.updateMulti(data)
    h.update(decommitment)
    const commitment = h.digestAsBytes()
    return {
      commitment,
      decommitment,
    }
  }

  protected static _validateCommitment(commitment: Uint8Array, type: string): void {
    if (commitment.length !== SEC_BYTES) {
      throw new HasherBadCommitmentLengthError()
    }
    for (let i = 0; i < commitment.length; i += 1) {
      if (commitment[i] !== 0) {
        return
      }
    }
    throw new HasherZeroCommitmentError(type)
  }

  public static validateCommitment(commitment: Uint8Array): void {
    this._validateCommitment(commitment, "commitment")
  }

  public static validateDecommitment(decommitment: Uint8Array): void {
    this._validateCommitment(decommitment, "decommitment")
  }

  public decommit(
    commitment: Uint8Array,
    decommitment: Uint8Array,
    data: HashableInput[],
  ): boolean {
    Hasher.validateCommitment(commitment)
    Hasher.validateDecommitment(decommitment)
    const h = this.clone()
    h.updateMulti(data)
    h.update(decommitment)
    const computedCommitment = h.digestAsBytes()
    return equalBytes(commitment, computedCommitment)
  }
}

